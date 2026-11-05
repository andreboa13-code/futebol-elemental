/**
 * LOOP DO JOGO
 * ------------
 * Um único `useFrameCallback` roda a cada quadro na thread de UI.
 * O estado vive num SharedValue, que o Skia lê direto para desenhar.
 * O React só é avisado quando algo raro acontece (ex.: gol), via scheduleOnRN.
 */
import { useCallback, useState } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { FIELD, MAX_FRAME_DT } from '../config/balance';
import { moveBall, resetBallToCenter, resolveBallBounds } from './physics';
import { createPlayer, resetPlayer, stepPlayer } from './player';
import type { GameState, InputState, Side } from './types';

function createInitialState(): GameState {
  return {
    ball: { x: FIELD.width / 2, y: FIELD.height / 2, vx: 0, vy: 0 },
    player: createPlayer(),
    score: { home: 0, away: 0 },
  };
}

export function useGameLoop() {
  const state = useSharedValue<GameState>(createInitialState());
  // Entrada do joystick: escrita pelo gesto, lida (e o chute "consumido") pelo loop.
  const input = useSharedValue<InputState>({ x: 0, y: 0, kickRequested: false });
  // Interruptor do loop: se der erro, desligamos aqui sem derrubar o app.
  const running = useSharedValue(true);

  // Placar espelhado no React apenas para exibir na tela (muda raramente).
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [loopError, setLoopError] = useState<string | null>(null);

  const onGoal = useCallback((side: Side, home: number, away: number) => {
    setScore({ home, away });
    if (__DEV__) console.log(`Gol (${side})! ${home} x ${away}`);
  }, []);

  const onLoopError = useCallback((message: string) => setLoopError(message), []);

  useFrameCallback((info) => {
    'worklet';
    if (!running.value) return;
    try {
      // Primeiro quadro não tem intervalo; depois limitamos o dt para evitar saltos.
      const rawDt = (info.timeSincePreviousFrame ?? 16) / 1000;
      const dt = Math.min(rawDt, MAX_FRAME_DT);
      const inp = input.value;

      // modify() altera o objeto no lugar e notifica o Skia uma vez só.
      state.modify((s) => {
        'worklet';
        stepPlayer(s.player, s.ball, inp, dt);
        if (!s.player.hasBall) moveBall(s.ball, dt);

        const event = resolveBallBounds(s.ball);
        if (event.kind === 'goal') {
          s.score[event.scoredBy] += 1;
          resetBallToCenter(s.ball);
          resetPlayer(s.player);
          scheduleOnRN(onGoal, event.scoredBy, s.score.home, s.score.away);
        }
        return s;
      });

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

  return { state, input, score, loopError };
}
