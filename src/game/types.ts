/** Tipos compartilhados do estado do jogo. */

export type Vec2 = { x: number; y: number };

export type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type Side = 'left' | 'right';

export type GameState = {
  ball: BallState;
  score: { left: number; right: number };
  /** Segundos que a bola está parada (usado pela demonstração). */
  idleTime: number;
  /** Contador simples para gerar chutes variados sem Math.random fora da worklet. */
  kickSeed: number;
};

/** O que aconteceu em um passo da física, para a lógica de regras reagir. */
export type StepEvent = { kind: 'none' } | { kind: 'goal'; scoredBy: Side };
