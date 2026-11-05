/**
 * Jogador controlado: círculo na cor do time + um "nariz" mostrando para onde está virado
 * (que é a direção do chute).
 */
import { Circle, Group } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PLAYER } from '../config/balance';
import type { GameState } from '../game/types';
import { TEAM_COLORS } from './colors';
import type { Layout } from './layout';

type Props = { state: SharedValue<GameState>; layout: Layout };

export function Player({ state, layout }: Props) {
  const { scale, originX, originY } = layout;
  const r = PLAYER.radius * scale;

  const cx = useDerivedValue(() => originX + state.value.player.x * scale);
  const cy = useDerivedValue(() => originY + state.value.player.y * scale);
  const noseX = useDerivedValue(() => cx.value + state.value.player.dirX * r * 0.6);
  const noseY = useDerivedValue(() => cy.value + state.value.player.dirY * r * 0.6);

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r} color={TEAM_COLORS.home} />
      <Circle cx={cx} cy={cy} r={r} color="#ffffff" style="stroke" strokeWidth={Math.max(1.5, r * 0.12)} />
      <Circle cx={noseX} cy={noseY} r={r * 0.25} color="#ffffff" />
    </Group>
  );
}
