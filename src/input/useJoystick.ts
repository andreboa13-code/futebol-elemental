/**
 * JOYSTICK FLUTUANTE
 * ------------------
 * O joystick aparece onde o polegar toca a tela (em qualquer lugar).
 * - Arrastar: move o jogador (intensidade = distância do centro).
 * - Soltar o dedo: pede um chute (o loop só chuta se o jogador estiver com a bola).
 *
 * Os callbacks rodam na thread de UI ('worklet'), então não há atraso do React.
 */
import { usePanGesture } from 'react-native-gesture-handler';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { JOYSTICK } from '../config/balance';
import type { InputState } from '../game/types';

/** Estado visual do joystick, em pixels de tela (lido pelo Skia). */
export type JoystickVisual = {
  active: boolean;
  baseX: number;
  baseY: number;
  knobX: number;
  knobY: number;
};

export function useJoystick(input: SharedValue<InputState>) {
  const visual = useSharedValue<JoystickVisual>({
    active: false,
    baseX: 0,
    baseY: 0,
    knobX: 0,
    knobY: 0,
  });

  const gesture = usePanGesture({
    // Ativa no primeiro pixel de movimento: o controle precisa ser imediato.
    minDistance: 0,

    onBegin: (e) => {
      'worklet';
      visual.value = { active: true, baseX: e.x, baseY: e.y, knobX: e.x, knobY: e.y };
    },

    onUpdate: (e) => {
      'worklet';
      const R = JOYSTICK.radiusPx;
      const dx = e.translationX;
      const dy = e.translationY;
      const dist = Math.hypot(dx, dy);

      // Limita o pino ao raio do joystick.
      const k = dist > R ? R / dist : 1;
      const v = visual.value;
      visual.value = { ...v, knobX: v.baseX + dx * k, knobY: v.baseY + dy * k };

      // Intensidade de 0 a 1, com zona morta para ignorar tremidas do dedo.
      const strength = Math.min(dist / R, 1);
      if (strength < JOYSTICK.deadZone || dist === 0) {
        input.value = { ...input.value, x: 0, y: 0 };
      } else {
        input.value = {
          ...input.value,
          x: (dx / dist) * strength,
          y: (dy / dist) * strength,
        };
      }
    },

    // onFinalize roda sempre que o toque termina (inclusive um toque rápido sem arrastar).
    onFinalize: (e) => {
      'worklet';
      visual.value = { ...visual.value, active: false };
      // Se o gesto foi cancelado pelo sistema (ex.: notificação), não chuta.
      input.value = { x: 0, y: 0, kickRequested: !e.canceled };
    },
  });

  return { gesture, visual };
}
