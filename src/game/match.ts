/**
 * PARTIDA
 * -------
 * Criação dos times, posições iniciais (formação) e reinício após gol.
 */
import { FIELD, MATCH } from '../config/balance';
import { resetBallToCenter } from './physics';
import type { GameState, PlayerState, Role, Team } from './types';

const ROLES: Role[] = ['back', 'left', 'right'];

/**
 * Posição inicial de cada função, como fração do campo, para o time de BAIXO (home).
 * O time de cima (away) usa o espelho vertical.
 */
const KICKOFF_SPOTS: Record<Role, { x: number; y: number }> = {
  back: { x: 0.5, y: 0.85 },
  left: { x: 0.28, y: 0.62 },
  right: { x: 0.72, y: 0.62 },
};

function newPlayer(team: Team, role: Role): PlayerState {
  return {
    team,
    role,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    dirX: 0,
    dirY: team === 'home' ? -1 : 1,
    recover: 0,
    stun: 0,
    tackleCooldown: 0,
    protect: 0,
    decisionDelay: 0,
  };
}

/** Coloca todos na formação de saída e a bola no centro. */
export function resetFormation(s: GameState): void {
  'worklet';
  for (let i = 0; i < s.players.length; i++) {
    const p = s.players[i];
    const spot = KICKOFF_SPOTS[p.role];
    p.x = spot.x * FIELD.width;
    p.y = (p.team === 'home' ? spot.y : 1 - spot.y) * FIELD.height;
    p.vx = 0;
    p.vy = 0;
    p.dirX = 0;
    p.dirY = p.team === 'home' ? -1 : 1;
    p.recover = 0;
    p.stun = 0;
    p.tackleCooldown = 0;
    p.protect = 0;
    p.decisionDelay = 0;
  }
  resetBallToCenter(s.ball);
  s.owner = -1;
  s.kickGrace = 0;
}

export function createMatch(): GameState {
  const players: PlayerState[] = [];
  for (const team of ['home', 'away'] as Team[]) {
    for (const role of ROLES) players.push(newPlayer(team, role));
  }
  const s: GameState = {
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    players,
    owner: -1,
    kickGrace: 0,
    // Você é o atacante da esquerda. Na escolha de personagem (M4) isso vira configurável.
    controlled: 1,
    score: { home: 0, away: 0 },
    phase: 'playing',
    timeLeft: MATCH.duration,
    suddenDeath: false,
    phaseTimer: 0,
    hudSecond: -1,
    tick: 0,
  };
  resetFormation(s);
  return s;
}

/** Recomeça a partida do zero (botão "Jogar de novo"). */
export function restartMatch(s: GameState): void {
  'worklet';
  s.score.home = 0;
  s.score.away = 0;
  s.phase = 'playing';
  s.timeLeft = MATCH.duration;
  s.suddenDeath = false;
  s.phaseTimer = 0;
  s.hudSecond = -1;
  resetFormation(s);
}
