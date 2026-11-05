/**
 * Desenho estático do campo em pé (grama, linhas e gols em cima e embaixo).
 * Não depende do loop: só redesenha se o tamanho da tela mudar.
 */
import { Circle, Group, Line, Rect, vec } from '@shopify/react-native-skia';
import React from 'react';

import { FIELD } from '../config/balance';
import { goalMouth } from '../game/physics';
import { TEAM_COLORS } from './colors';
import type { Layout } from './layout';

const COLORS = {
  grassDark: '#1f7a3a',
  grassLight: '#249044',
  line: 'rgba(255,255,255,0.85)',
};

/** Número de faixas de grama (efeito de corte). */
const STRIPES = 10;

type Props = { layout: Layout };

export function Field({ layout }: Props) {
  const { scale: s, originX: ox, originY: oy } = layout;
  const w = FIELD.width * s;
  const h = FIELD.height * s;
  const lineWidth = Math.max(1.5, 0.12 * s);
  const { left, right } = goalMouth();
  const depth = FIELD.goalDepth * s;
  const stripeH = h / STRIPES;

  return (
    <Group>
      {/* Faixas de grama */}
      {Array.from({ length: STRIPES }, (_, i) => (
        <Rect
          key={i}
          x={ox}
          y={oy + i * stripeH}
          width={w}
          height={stripeH + 0.5}
          color={i % 2 === 0 ? COLORS.grassDark : COLORS.grassLight}
        />
      ))}

      {/* Rede de cima: gol do adversário (onde você marca) */}
      <Rect x={ox + left * s} y={oy - depth} width={(right - left) * s} height={depth} color={TEAM_COLORS.away} opacity={0.4} />
      {/* Rede de baixo: o seu gol */}
      <Rect x={ox + left * s} y={oy + h} width={(right - left) * s} height={depth} color={TEAM_COLORS.home} opacity={0.4} />

      {/* Linhas */}
      <Group color={COLORS.line} style="stroke" strokeWidth={lineWidth}>
        <Rect x={ox} y={oy} width={w} height={h} />
        <Line p1={vec(ox, oy + h / 2)} p2={vec(ox + w, oy + h / 2)} />
        <Circle cx={ox + w / 2} cy={oy + h / 2} r={FIELD.centerCircleRadius * s} />
      </Group>
      <Circle cx={ox + w / 2} cy={oy + h / 2} r={lineWidth * 1.5} color={COLORS.line} />
    </Group>
  );
}
