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

import { DEMO, FIELD, MAX_FRAME_DT } from '../config/balance';
import { resetBallToCenter, stepBall } from './physics';
import type { GameState, Side } from './types';

function createInitialState(): GameState {
  return {
    ball: { x: FIELD.width / 2, y: FIELD.height / 2, vx: 0, vy: 0 },
    score: { left: 0, right: 0 },
    idleTime: 0,
    kickSeed: 1,
  };
}

/**
 * Gera um número entre 0 e 1 a partir de uma semente (pseudoaleatório determinístico).
 * Determinístico = mesma semente, mesmo resultado; útil para reproduzir bugs.
 */
function seededRandom(seed: number): number {
  'worklet';
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function useGameLoop() {
  const state = useSharedValue<GameState>(createInitialState());
  // Interruptor do loop: se der erro, desligamos aqui sem derrubar o app.
  const running = useSharedValue(true);

  // Placar espelhado no React apenas para exibir na tela (muda raramente).
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [loopError, setLoopError] = useState<string | null>(null);

  const onGoal = useCallback((side: Side, left: number, right: number) => {
    setScore({ left, right });
    if (__DEV__) console.log(`Gol do lado ${side}! ${left} x ${right}`);
  }, []);

  const onLoopError = useCallback((message: string) => setLoopError(message), []);

  useFrameCallback((info) => {
    'worklet';
    if (!running.value) return;
    try {
      // Primeiro quadro não tem intervalo; depois limitamos o dt para evitar saltos.
      const rawDt = (info.timeSincePreviousFrame ?? 16) / 1000;
      const dt = Math.min(rawDt, MAX_FRAME_DT);

      // modify() altera o objeto no lugar e notifica o Skia uma vez só.
      state.modify((s) => {
        'worklet';
        const event = stepBall(s.ball, dt);

        if (event.kind === 'goal') {
          s.score[event.scoredBy] += 1;
          resetBallToCenter(s.ball);
          s.idleTime = 0;
          scheduleOnRN(onGoal, event.scoredBy, s.score.left, s.score.right);
          return s;
        }

        // Demonstração do M0: bola parada por um tempo leva um chute automático.
        const stopped = s.ball.vx === 0 && s.ball.vy === 0;
        s.idleTime = stopped ? s.idleTime + dt : 0;
        if (s.idleTime > DEMO.idleBeforeKick) {
          s.kickSeed += 1;
          const angle = seededRandom(s.kickSeed) * Math.PI * 2;
          const speed =
            DEMO.minKickSpeed +
            seededRandom(s.kickSeed + 0.5) * (DEMO.maxKickSpeed - DEMO.minKickSpeed);
          s.ball.vx = Math.cos(angle) * speed;
          s.ball.vy = Math.sin(angle) * speed;
          s.idleTime = 0;
        }
        return s;
      });
    } catch (e) {
      // Um erro no loop não pode derrubar o app: paramos o loop e mostramos o erro.
      running.value = false;
      scheduleOnRN(onLoopError, e instanceof Error ? e.message : String(e));
    }
  });

  return { state, score, loopError };
}
