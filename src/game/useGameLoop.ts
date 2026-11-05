/**
 * LOOP DO JOGO
 * ------------
 * Um único `useFrameCallback` roda a cada quadro na thread de UI.
 * O estado vive num SharedValue, que o Skia lê direto para desenhar.
 * O React só é avisado quando algo raro acontece (gol, segundo do relógio, fim),
 * via scheduleOnRN, para o placar e as telas.
 */
import { useCallback, useState } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { MATCH, MAX_FRAME_DT } from '../config/balance';
import { createMatch, restartMatch } from './match';
import { stepMatch } from './step';
import type { GameState, HudState, InputState, Phase } from './types';

const INITIAL_HUD: HudState = {
  home: 0,
  away: 0,
  seconds: MATCH.duration,
  phase: 'playing',
  suddenDeath: false,
};

export function useGameLoop() {
  const state = useSharedValue<GameState>(createMatch());
  // Entrada do joystick: escrita pelo gesto, lida (e o chute "consumido") pelo loop.
  const input = useSharedValue<InputState>({ x: 0, y: 0, kickRequested: false });
  // Pedido de nova partida, feito pelo botão da tela final.
  const restartRequested = useSharedValue(false);
  // Interruptor do loop: se der erro, desligamos aqui sem derrubar o app.
  const running = useSharedValue(true);

  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [loopError, setLoopError] = useState<string | null>(null);

  const onHud = useCallback(
    (home: number, away: number, seconds: number, phase: Phase, suddenDeath: boolean) => {
      setHud({ home, away, seconds, phase, suddenDeath });
    },
    [],
  );
  const onLoopError = useCallback((message: string) => setLoopError(message), []);

  const restart = useCallback(() => {
    restartRequested.value = true;
  }, [restartRequested]);

  useFrameCallback((info) => {
    'worklet';
    if (!running.value) return;
    try {
      // Primeiro quadro não tem intervalo; depois limitamos o dt para evitar saltos.
      const rawDt = (info.timeSincePreviousFrame ?? 16) / 1000;
      const dt = Math.min(rawDt, MAX_FRAME_DT);
      const inp = input.value;
      const wantsRestart = restartRequested.value;

      // modify() altera o objeto no lugar e notifica o Skia uma vez só.
      state.modify((s) => {
        'worklet';
        if (wantsRestart) restartMatch(s);
        const result = stepMatch(s, inp, dt);

        // Avisa o React só quando o placar/fase muda ou o relógio vira um segundo.
        const second = Math.ceil(s.timeLeft);
        if (result !== 'none' || second !== s.hudSecond || wantsRestart) {
          s.hudSecond = second;
          scheduleOnRN(onHud, s.score.home, s.score.away, second, s.phase, s.suddenDeath);
        }
        return s;
      });

      if (wantsRestart) restartRequested.value = false;

      // O pedido de chute vale por um quadro só.
      if (inp.kickRequested) {
        input.modify((v) => {
          'worklet';
          v.kickRequested = false;
          return v;
        });
      }
    } catch (e) {
      // Um erro no loop não pode derrubar o app: paramos o loop e mostramos o erro.
      running.value = false;
      scheduleOnRN(onLoopError, e instanceof Error ? e.message : String(e));
    }
  });

  return { state, input, hud, loopError, restart };
}
