/**
 * Desenho estático do campo (grama, linhas e gols).
 * Não depende do loop: só redesenha se o tamanho da tela mudar.
 */
import { Circle, Group, Line, Rect, vec } from '@shopify/react-native-skia';
import React from 'react';

import { FIELD } from '../config/balance';
import { goalMouth } from '../game/physics';
import type { Layout } from './layout';

const COLORS = {
  grassDark: '#1f7a3a',
  grassLight: '#249044',
  line: 'rgba(255,255,255,0.85)',
  goalLeft: '#3fa9f5',
  goalRight: '#f5563f',
};

/** Número de faixas de grama (efeito de corte). */
const STRIPES = 10;

type Props = { layout: Layout };

export function Field({ layout }: Props) {
  const { scale: s, originX: ox, originY: oy } = layout;
  const w = FIELD.width * s;
  const h = FIELD.height * s;
  const lineWidth = Math.max(1.5, 0.12 * s);
  const { top, bottom } = goalMouth();
  const depth = FIELD.goalDepth * s;

  const stripeW = w / STRIPES;

  return (
    <Group>
      {/* Faixas de grama */}
      {Array.from({ length: STRIPES }, (_, i) => (
        <Rect
          key={i}
          x={ox + i * stripeW}
          y={oy}
          width={stripeW + 0.5}
          height={h}
          color={i % 2 === 0 ? COLORS.grassDark : COLORS.grassLight}
        />
      ))}

      {/* Redes (atrás das linhas de fundo), na cor de cada time */}
      <Rect
        x={ox - depth}
        y={oy + top * s}
        width={depth}
        height={(bottom - top) * s}
        color={COLORS.goalLeft}
        opacity={0.35}
      />
      <Rect
        x={ox + w}
        y={oy + top * s}
        width={depth}
        height={(bottom - top) * s}
        color={COLORS.goalRight}
        opacity={0.35}
      />

      {/* Linhas */}
      <Group color={COLORS.line} style="stroke" strokeWidth={lineWidth}>
        <Rect x={ox} y={oy} width={w} height={h} />
        <Line p1={vec(ox + w / 2, oy)} p2={vec(ox + w / 2, oy + h)} />
        <Circle cx={ox + w / 2} cy={oy + h / 2} r={FIELD.centerCircleRadius * s} />
      </Group>
      <Circle cx={ox + w / 2} cy={oy + h / 2} r={lineWidth * 1.5} color={COLORS.line} />
    </Group>
  );
}
