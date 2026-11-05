/**
 * CÂMERA
 * ------
 * Mantém o seu jogador no centro da tela, sem mostrar além das bordas do campo.
 * Roda na thread de UI (useDerivedValue): segue o jogador a 60 fps sem re-render.
 */
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { CAMERA, FIELD } from '../config/balance';
import type { GameState } from '../game/types';
import type { Layout } from './layout';

/**
 * Centro da câmera em um eixo: segue `target`, mas para nas bordas [min, max].
 * Se a tela for maior que o mundo nesse eixo, centraliza.
 */
function follow(target: number, halfView: number, min: number, max: number): number {
  'worklet';
  if (max - min <= halfView * 2) return (min + max) / 2;
  return Math.min(Math.max(target, min + halfView), max - halfView);
}

export function useCamera(state: SharedValue<GameState>, layout: Layout) {
  const { scale, screenWidth, screenHeight } = layout;
  const halfW = screenWidth / 2 / scale;
  const halfH = screenHeight / 2 / scale;
  const m = CAMERA.edgeMargin;

  /** Centro da câmera em metros do jogo. */
  const center = useDerivedValue(() => {
    const p = state.value.players[state.value.controlled];
    if (!p) return { x: FIELD.width / 2, y: FIELD.height / 2 };
    return {
      x: follow(p.x, halfW, -m, FIELD.width + m),
      y: follow(p.y, halfH, -FIELD.goalDepth - m, FIELD.height + FIELD.goalDepth + m),
    };
  });

  /** Deslocamento em pixels aplicado ao desenho do mundo. */
  const offsetX = useDerivedValue(() => screenWidth / 2 - center.value.x * scale);
  const offsetY = useDerivedValue(() => screenHeight / 2 - center.value.y * scale);
  const transform = useDerivedValue(() => [{ translateX: offsetX.value }, { translateY: offsetY.value }]);

  return { transform, offsetX, offsetY };
}
