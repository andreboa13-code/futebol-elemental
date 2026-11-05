/** Tipos compartilhados do estado do jogo. */

export type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

/** home = seu time (ataca para cima). away = adversário (ataca para baixo). */
export type Team = 'home' | 'away';

/** Posição tática de cada jogador no time de 3. */
export type Role = 'back' | 'left' | 'right';

export type PlayerState = {
  team: Team;
  role: Role;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Direção para onde o jogador está virado (vetor unitário). Define a direção do chute. */
  dirX: number;
  dirY: number;
  /** Tempo (s) sem poder dominar a bola depois de chutar. */
  recover: number;
  /** Tempo (s) "tonto" depois de perder a bola numa roubada. */
  stun: number;
  /** Tempo (s) até poder roubar de novo. */
  tackleCooldown: number;
  /** Tempo (s) em que a bola recém-dominada não pode ser roubada. */
  protect: number;
  /** Tempo (s) até o bot poder chutar ou passar (tempo de reação). */
  decisionDelay: number;
};

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

export type Phase = 'playing' | 'goal' | 'ended';

export type GameState = {
  ball: BallState;
  /** Índices 0 a 2 = seu time; 3 a 5 = adversário. */
  players: PlayerState[];
  /** Índice de quem está com a bola, ou -1 se ela está solta. */
  owner: number;
  /** Índice do jogador que você controla (fixo durante a partida). Os outros são bots. */
  controlled: number;
  score: { home: number; away: number };
  phase: Phase;
  /** Tempo restante do período atual (s). */
  timeLeft: number;
  suddenDeath: boolean;
  /** Tempo restante da pausa de gol (s). */
  phaseTimer: number;
  /** Último segundo enviado ao React (para atualizar o cronômetro só 1x por segundo). */
  hudSecond: number;
};

/** Resumo enviado ao React para o placar e as telas. */
export type HudState = {
  home: number;
  away: number;
  seconds: number;
  phase: Phase;
  suddenDeath: boolean;
};
