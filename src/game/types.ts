/** Tipos compartilhados do estado do jogo. */

export type Vec2 = { x: number; y: number };

export type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type PlayerState = {
  x: number;
  y: number;
  /** Direção para onde o jogador está virado (vetor unitário). Define a direção do chute. */
  dirX: number;
  dirY: number;
  /** true quando a bola está grudada nos pés. */
  hasBall: boolean;
  /** Tempo restante (s) até poder dominar a bola de novo após chutar. */
  recover: number;
};

/** home = seu time (ataca para cima). away = adversário (ataca para baixo). */
export type Side = 'home' | 'away';

/**
 * Entrada do jogador, escrita pelo joystick e lida pelo loop.
 * x/y vão de -1 a 1 (já com zona morta aplicada).
 */
export type InputState = {
  x: number;
  y: number;
  /** Fica true por um quadro quando o dedo é solto: o loop chuta e zera. */
  kickRequested: boolean;
};

export type GameState = {
  ball: BallState;
  player: PlayerState;
  score: { home: number; away: number };
};

/** O que aconteceu em um passo da física, para a lógica de regras reagir. */
export type StepEvent = { kind: 'none' } | { kind: 'goal'; scoredBy: Side };
