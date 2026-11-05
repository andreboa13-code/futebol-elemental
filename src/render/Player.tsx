/**
 * Um jogador (de qualquer time), lido do estado pelo índice.
 * Círculo na cor do time + "nariz" mostrando para onde está virado (direção do chute).
 * O jogador que você controla ganha um anel amarelo embaixo.
 */
import { Circle, Group } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PLAYER } from '../config/balance';
import type { GameState, Team } from '../game/types';
import { TEAM_COLORS } from './colors';
import type { Layout } from './layout';

type Props = { state: SharedValue<GameState>; layout: Layout; index: number; team: Team };

export function Player({ state, layout, index, team }: Props) {
  const { scale, originX, originY } = layout;
  const r = PLAYER.radius * scale;

  const cx = useDerivedValue(() => originX + state.value.players[index].x * scale);
  const cy = useDerivedValue(() => originY + state.value.players[index].y * scale);
  const noseX = useDerivedValue(() => cx.value + state.value.players[index].dirX * r * 0.6);
  const noseY = useDerivedValue(() => cy.value + state.value.players[index].dirY * r * 0.6);
  const ringOpacity = useDerivedValue(() => (state.value.controlled === index ? 1 : 0));
  // Fica meio transparente enquanto está "tonto" depois de perder a bola.
  const bodyOpacity = useDerivedValue(() => (state.value.players[index].stun > 0 ? 0.55 : 1));

  return (
    <Group>
      <Group opacity={ringOpacity}>
        <Circle cx={cx} cy={cy} r={r * 1.45} color="#ffd34d" style="stroke" strokeWidth={Math.max(2, r * 0.18)} />
      </Group>
      <Group opacity={bodyOpacity}>
        <Circle cx={cx} cy={cy} r={r} color={TEAM_COLORS[team]} />
        <Circle cx={cx} cy={cy} r={r} color="#ffffff" style="stroke" strokeWidth={Math.max(1.5, r * 0.12)} />
        <Circle cx={noseX} cy={noseY} r={r * 0.25} color="#ffffff" />
      </Group>
    </Group>
  );
}
