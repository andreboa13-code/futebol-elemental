/**
 * Barra de stamina logo abaixo do seu jogador (some quando está cheia).
 */
import { Group, Rect } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PLAYER } from '../config/balance';
import type { GameState } from '../game/types';
import type { Layout } from './layout';

type Props = { state: SharedValue<GameState>; layout: Layout };

export function StaminaBar({ state, layout }: Props) {
  const { scale } = layout;
  const width = PLAYER.radius * 2.4 * scale;
  const height = Math.max(4, 0.18 * scale);

  const x = useDerivedValue(() => state.value.players[state.value.controlled].x * scale - width / 2);
  const y = useDerivedValue(
    () => state.value.players[state.value.controlled].y * scale + PLAYER.radius * 1.75 * scale,
  );
  const fill = useDerivedValue(() => width * state.value.stamina);
  const opacity = useDerivedValue(() => (state.value.stamina >= 1 ? 0 : 1));
  // Verde → amarelo → vermelho conforme esvazia.
  const color = useDerivedValue(() =>
    state.value.stamina > 0.5 ? '#5ee06b' : state.value.stamina > 0.2 ? '#ffd34d' : '#f5563f',
  );

  return (
    <Group opacity={opacity}>
      <Rect x={x} y={y} width={width} height={height} color="rgba(0,0,0,0.55)" />
      <Rect x={x} y={y} width={fill} height={height} color={color} />
    </Group>
  );
}
