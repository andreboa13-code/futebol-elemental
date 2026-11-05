/**
 * BOTS
 * ----
 * Cada bot decide, a cada quadro, para ONDE correr e se deve CHUTAR/PASSAR.
 * Regras simples e legíveis (sem "inteligência" escondida):
 *
 *  Com a bola:   chuta se perto do gol; passa se pressionado; senão conduz para o gol.
 *  Time atacando (sem a bola): abre pelos lados e se oferece à frente da bola.
 *  Time defendendo: o mais perto da bola pressiona; os outros fecham o caminho do gol.
 *
 * Os bots do SEU time nunca pressionam: quem pressiona é você
 * (a troca automática sempre te dá o jogador mais perto da bola).
 */
import { AI, FIELD, KICK } from '../config/balance';
import { attackDirY, attackGoalY, clamp, dist, lerp, ownGoalY } from './geometry';
import type { GameState, PlayerState } from './types';

export type BotDecision = {
  /** Ponto para onde correr. */
  tx: number;
  ty: number;
  /** Chutar/passar neste quadro? */
  kick: boolean;
  /** Direção (unitária) e força do chute. */
  kx: number;
  ky: number;
  kickSpeed: number;
};

/** Distância lateral entre os jogadores de linha ao se posicionar. */
const SPREAD_X = FIELD.width * 0.24;
/** Margem para não colar nas linhas do campo. */
const EDGE = 2;

/** Jogador adversário mais próximo de (x, y): devolve a distância. */
function nearestOpponentDistance(s: GameState, team: string, x: number, y: number): number {
  'worklet';
  let best = 1e9;
  for (let j = 0; j < s.players.length; j++) {
    const q = s.players[j];
    if (q.team === team) continue;
    const d = dist(x, y, q.x, q.y);
    if (d < best) best = d;
  }
  return best;
}

/** Índice do jogador do time `team` mais perto da bola. */
export function nearestToBall(s: GameState, team: string): number {
  'worklet';
  let best = -1;
  let bestD = 1e9;
  for (let j = 0; j < s.players.length; j++) {
    const q = s.players[j];
    if (q.team !== team) continue;
    const d = dist(q.x, q.y, s.ball.x, s.ball.y);
    if (d < bestD) {
      bestD = d;
      best = j;
    }
  }
  return best;
}

function roleOffsetX(p: PlayerState): number {
  'worklet';
  return p.role === 'left' ? -SPREAD_X : p.role === 'right' ? SPREAD_X : 0;
}

function aim(d: BotDecision, fromX: number, fromY: number, toX: number, toY: number, speed: number) {
  'worklet';
  const len = Math.max(0.001, dist(fromX, fromY, toX, toY));
  d.kick = true;
  d.kx = (toX - fromX) / len;
  d.ky = (toY - fromY) / len;
  d.kickSpeed = speed;
}

/** Decisão do bot com a bola nos pés. */
function withBall(s: GameState, i: number, d: BotDecision): void {
  'worklet';
  const p = s.players[i];
  const goalY = attackGoalY(p.team);
  const goalX = FIELD.width / 2;
  const toGoal = dist(p.x, p.y, goalX, goalY);
  const pressure = nearestOpponentDistance(s, p.team, p.x, p.y);
  const canAct = p.decisionDelay <= 0;

  // 1) Perto do gol: chuta mirando um ponto aleatório dentro da boca.
  if (canAct && toGoal < AI.shootRange) {
    const spread = (Math.random() - 0.5) * FIELD.goalWidth * AI.shotSpread;
    aim(d, p.x, p.y, goalX + spread, goalY, KICK.speed);
    return;
  }

  // 2) Pressionado: passa para o companheiro mais livre e mais adiantado.
  if (canAct && pressure < AI.pressureDistance) {
    let bestJ = -1;
    let bestScore = -1e9;
    for (let j = 0; j < s.players.length; j++) {
      if (j === i) continue;
      const q = s.players[j];
      if (q.team !== p.team) continue;
      const advance = (q.y - p.y) * attackDirY(p.team); // positivo = mais perto do gol
      const freedom = Math.min(nearestOpponentDistance(s, p.team, q.x, q.y), 6);
      const score = advance * 0.5 + freedom;
      if (score > bestScore) {
        bestScore = score;
        bestJ = j;
      }
    }
    if (bestJ >= 0) {
      const q = s.players[bestJ];
      // Mira um pouco à frente do companheiro (para onde ele está indo).
      aim(d, p.x, p.y, q.x + q.vx * 0.3, q.y + q.vy * 0.3, AI.passSpeed);
      return;
    }
  }

  // 3) Conduz em direção ao gol, desviando de quem estiver na frente.
  let tx = lerp(p.x, goalX, 0.5);
  const ty = goalY;
  for (let j = 0; j < s.players.length; j++) {
    const q = s.players[j];
    if (q.team === p.team) continue;
    const ahead = (q.y - p.y) * attackDirY(p.team);
    if (ahead > 0 && ahead < 4 && Math.abs(q.x - p.x) < 2.5) {
      tx = p.x + (p.x >= q.x ? 5 : -5);
    }
  }
  d.tx = tx;
  d.ty = ty;
}

/** Preenche `d` com a decisão do bot `i` neste quadro. */
export function think(s: GameState, i: number, d: BotDecision): void {
  'worklet';
  const p = s.players[i];
  const ball = s.ball;
  d.kick = false;
  d.tx = p.x;
  d.ty = p.y;

  if (s.owner === i) {
    withBall(s, i, d);
    return;
  }

  const ownerTeam = s.owner >= 0 ? s.players[s.owner].team : null;
  const dirY = attackDirY(p.team);

  if (ownerTeam === p.team) {
    // ATAQUE sem a bola: abre pelos lados e se oferece à frente.
    if (p.role === 'back') {
      d.tx = FIELD.width / 2;
      d.ty = ball.y - dirY * 7;
    } else {
      d.tx = FIELD.width / 2 + roleOffsetX(p);
      d.ty = ball.y + dirY * 5;
    }
  } else {
    // DEFESA ou bola solta.
    const chaser = p.team === 'away' ? nearestToBall(s, 'away') : -1;
    if (chaser === i) {
      // Pressiona: corre para onde a bola vai estar em instantes.
      d.tx = ball.x + ball.vx * 0.2;
      d.ty = ball.y + ball.vy * 0.2;
      return;
    }
    // Fecha o caminho entre a bola e o próprio gol.
    const goalY = ownGoalY(p.team);
    const depth = p.role === 'back' ? 0.25 : 0.55;
    d.tx = lerp(FIELD.width / 2, ball.x, 0.5) + roleOffsetX(p) * 0.6;
    d.ty = lerp(goalY, ball.y, depth);
  }

  d.tx = clamp(d.tx, EDGE, FIELD.width - EDGE);
  d.ty = clamp(d.ty, EDGE, FIELD.height - EDGE);
}
