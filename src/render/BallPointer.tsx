/**
 * Seta na borda da tela apontando para a bola quando ela está fora da câmera.
 */
import { Group, Path } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { GameState } from '../game/types';
import type { Layout } from './layout';

/** Distância da seta até a borda da tela (px). Em cima, deixa espaço para o placar. */
const EDGE = 28;
const TOP_EDGE = 80;
/** Triângulo apontando para a direita, centrado na origem. */
const ARROW = 'M 12 0 L -8 -9 L -8 9 Z';

type Props = {
  state: SharedValue<GameState>;
  layout: Layout;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
};

export function BallPointer({ state, layout, offsetX, offsetY }: Props) {
  const { scale, screenWidth: W, screenHeight: H } = layout;

  const info = useDerivedValue(() => {
    // Posição da bola na tela.
    const bx = state.value.ball.x * scale + offsetX.value;
    const by = state.value.ball.y * scale + offsetY.value;
    const visible = bx > EDGE && bx < W - EDGE && by > TOP_EDGE && by < H - EDGE;
    // Seta presa à borda, na direção da bola a partir do centro da tela.
    const x = Math.min(Math.max(bx, EDGE), W - EDGE);
    const y = Math.min(Math.max(by, TOP_EDGE), H - EDGE);
    const angle = Math.atan2(by - H / 2, bx - W / 2);
    return { visible, x, y, angle };
  });

  const opacity = useDerivedValue(() => (info.value.visible ? 0 : 0.9));
  const transform = useDerivedValue(() => [
    { translateX: info.value.x },
    { translateY: info.value.y },
    { rotate: info.value.angle },
  ]);

  return (
    <Group opacity={opacity} transform={transform}>
      <Path path={ARROW} color="#ffffff" />
      <Path path={ARROW} color="#1b1b1b" style="stroke" strokeWidth={2} />
    </Group>
  );
}
