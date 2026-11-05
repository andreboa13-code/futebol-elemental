/**
 * Bola desenhada a partir do estado do jogo (SharedValue).
 * useDerivedValue roda na thread de UI: a bola se move sem re-render do React.
 */
import { Circle, Group } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { BALL } from '../config/balance';
import type { GameState } from '../game/types';
import type { Layout } from './layout';

type Props = { state: SharedValue<GameState>; layout: Layout };

export function Ball({ state, layout }: Props) {
  const { scale, originX, originY } = layout;
  const r = BALL.radius * scale;

  const cx = useDerivedValue(() => originX + state.value.ball.x * scale);
  const cy = useDerivedValue(() => originY + state.value.ball.y * scale);
  // Sombra levemente deslocada para dar volume.
  const shadowX = useDerivedValue(() => cx.value + r * 0.25);
  const shadowY = useDerivedValue(() => cy.value + r * 0.35);

  return (
    <Group>
      <Circle cx={shadowX} cy={shadowY} r={r} color="rgba(0,0,0,0.3)" />
      <Circle cx={cx} cy={cy} r={r} color="#ffffff" />
      <Circle cx={cx} cy={cy} r={r} color="#1b1b1b" style="stroke" strokeWidth={Math.max(1, r * 0.15)} />
    </Group>
  );
}
