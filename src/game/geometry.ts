/** Pequenas funções de geometria usadas pela física e pelos bots. */
import { FIELD } from '../config/balance';
import type { Team } from './types';

export function clamp(v: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(v, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  'worklet';
  return a + (b - a) * t;
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  'worklet';
  return Math.hypot(bx - ax, by - ay);
}

/** Para onde o time ataca no eixo y: seu time sobe (-1), o adversário desce (+1). */
export function attackDirY(team: Team): number {
  'worklet';
  return team === 'home' ? -1 : 1;
}

/** Linha do gol que o time ATACA. */
export function attackGoalY(team: Team): number {
  'worklet';
  return team === 'home' ? 0 : FIELD.height;
}

/** Linha do gol que o time DEFENDE. */
export function ownGoalY(team: Team): number {
  'worklet';
  return team === 'home' ? FIELD.height : 0;
}
