/**
 * PASSO DA PARTIDA
 * ----------------
 * Tudo o que acontece em um quadro, nesta ordem:
 *  1. Fases (pausa de gol, fim de jogo) e cronômetro
 *  2. Quem você controla (troca automática)
 *  3. Movimento de todos (você pelo joystick, o resto pelos bots)
 *  4. Chutes, roubadas, domínio e condução
 *  5. Bola solta, paredes e gols
 */
import { AI, BALL, FIELD, KICK, MATCH, PLAYER, TACKLE } from '../config/balance';
import { think, type BotDecision } from './ai';
import { clamp, dist } from './geometry';
import { resetFormation } from './match';
import { moveBall, resolveBallBounds } from './physics';
import type { GameState, InputState, PlayerState } from './types';

/** Distância do centro do jogador ao centro da bola quando ela está nos pés. */
const CARRY_DISTANCE = PLAYER.radius + BALL.radius + 0.05;

/** Resultado do quadro, para o loop avisar o React. */
export type StepResult = 'none' | 'goal' | 'ended';

function kickBall(s: GameState, i: number, dx: number, dy: number, speed: number): void {
  'worklet';
  const p = s.players[i];
  p.dirX = dx;
  p.dirY = dy;
  p.recover = KICK.recoverTime;
  s.owner = -1;
  // Solta a bola um pouco à frente para não "grudar" de novo em ninguém colado.
  s.ball.x = p.x + dx * CARRY_DISTANCE;
  s.ball.y = p.y + dy * CARRY_DISTANCE;
  s.ball.vx = dx * speed;
  s.ball.vy = dy * speed;
}

function giveBall(s: GameState, i: number): void {
  'worklet';
  s.owner = i;
  s.players[i].decisionDelay = AI.reactionTime;
  s.players[i].protect = TACKLE.protectTime;
}

/** Acelera a velocidade de `p` em direção a (vx, vy) de forma suave. */
function steer(p: PlayerState, vx: number, vy: number, accel: number, dt: number): void {
  'worklet';
  const k = Math.min(1, accel * dt);
  p.vx += (vx - p.vx) * k;
  p.vy += (vy - p.vy) * k;
}

function maxSpeedOf(s: GameState, i: number): number {
  'worklet';
  const p = s.players[i];
  let v = s.owner === i ? PLAYER.dribbleSpeed : PLAYER.maxSpeed;
  if (p.team === 'away' || i !== s.controlled) v *= AI.speedFactor;
  if (p.stun > 0) v *= TACKLE.stunSpeedFactor;
  return v;
}

/** Troca automática: você controla quem está com a bola ou o mais perto dela. */
function updateControlled(s: GameState): void {
  'worklet';
  if (s.owner >= 0 && s.players[s.owner].team === 'home') {
    s.controlled = s.owner;
    return;
  }
  const cur = s.players[s.controlled];
  const curD = dist(cur.x, cur.y, s.ball.x, s.ball.y);
  for (let j = 0; j < s.players.length; j++) {
    const q = s.players[j];
    if (q.team !== 'home' || j === s.controlled) continue;
    // Histerese: só troca se o outro estiver claramente mais perto (evita "piscar").
    if (dist(q.x, q.y, s.ball.x, s.ball.y) < curD - AI.switchHysteresis) s.controlled = j;
  }
}

function tickTimers(p: PlayerState, dt: number): void {
  'worklet';
  if (p.recover > 0) p.recover -= dt;
  if (p.stun > 0) p.stun -= dt;
  if (p.tackleCooldown > 0) p.tackleCooldown -= dt;
  if (p.protect > 0) p.protect -= dt;
  if (p.decisionDelay > 0) p.decisionDelay -= dt;
}

/** Empurra jogadores que se sobrepõem (ninguém atravessa ninguém). */
function separatePlayers(s: GameState): void {
  'worklet';
  const minD = PLAYER.radius * 2;
  for (let a = 0; a < s.players.length; a++) {
    for (let b = a + 1; b < s.players.length; b++) {
      const p = s.players[a];
      const q = s.players[b];
      const d = dist(p.x, p.y, q.x, q.y);
      if (d >= minD || d === 0) continue;
      const push = (minD - d) / 2;
      const nx = (q.x - p.x) / d;
      const ny = (q.y - p.y) / d;
      p.x -= nx * push;
      p.y -= ny * push;
      q.x += nx * push;
      q.y += ny * push;
    }
  }
}

/** Roubada: um adversário encostou em quem está com a bola. */
function checkTackle(s: GameState): void {
  'worklet';
  if (s.owner < 0) return;
  const o = s.players[s.owner];
  if (o.protect > 0) return;
  for (let j = 0; j < s.players.length; j++) {
    const q = s.players[j];
    if (q.team === o.team || q.tackleCooldown > 0 || q.stun > 0) continue;
    if (dist(o.x, o.y, q.x, q.y) < PLAYER.radius * 2 + TACKLE.reach) {
      o.stun = TACKLE.stunTime;
      o.recover = TACKLE.stunTime;
      q.tackleCooldown = TACKLE.cooldown;
      giveBall(s, j);
      return;
    }
  }
}

/** Domínio: o primeiro que encostar numa bola solta (e não muito rápida) fica com ela. */
function checkPickup(s: GameState): void {
  'worklet';
  if (s.owner >= 0) return;
  const ballSpeed = Math.hypot(s.ball.vx, s.ball.vy);
  if (ballSpeed >= PLAYER.maxPickupBallSpeed) return;
  let best = -1;
  let bestD = CARRY_DISTANCE + PLAYER.pickupRange;
  for (let j = 0; j < s.players.length; j++) {
    const q = s.players[j];
    if (q.recover > 0 || q.stun > 0) continue;
    const d = dist(q.x, q.y, s.ball.x, s.ball.y);
    if (d < bestD) {
      bestD = d;
      best = j;
    }
  }
  if (best >= 0) giveBall(s, best);
}

/** Atualiza fases e cronômetro. Devolve true se o jogo deve parar neste quadro. */
function updatePhase(s: GameState, dt: number): boolean {
  'worklet';
  if (s.phase === 'ended') return true;

  if (s.phase === 'goal') {
    s.phaseTimer -= dt;
    if (s.phaseTimer <= 0) {
      s.phase = 'playing';
      resetFormation(s);
    }
    return true;
  }

  s.timeLeft -= dt;
  if (s.timeLeft <= 0) {
    s.timeLeft = 0;
    if (s.score.home === s.score.away && !s.suddenDeath) {
      // Empate no tempo normal: morte súbita.
      s.suddenDeath = true;
      s.timeLeft = MATCH.suddenDeath;
    } else {
      s.phase = 'ended';
      return true;
    }
  }
  return false;
}

export function stepMatch(s: GameState, input: InputState, dt: number): StepResult {
  'worklet';
  const phaseBefore = s.phase;
  if (updatePhase(s, dt)) {
    return s.phase === 'ended' && phaseBefore !== 'ended' ? 'ended' : 'none';
  }

  updateControlled(s);
  const r = PLAYER.radius;
  // Um objeto por quadro para as decisões dos bots, reaproveitado entre os 5 bots.
  // (Criado aqui dentro de propósito: objetos de fora da worklet chegam como cópia somente leitura.)
  const decision: BotDecision = { tx: 0, ty: 0, kick: false, kx: 0, ky: 0, kickSpeed: 0 };

  for (let i = 0; i < s.players.length; i++) {
    const p = s.players[i];
    tickTimers(p, dt);
    const speed = maxSpeedOf(s, i);

    if (i === s.controlled) {
      // VOCÊ: joystick define a velocidade; soltar o dedo chuta.
      steer(p, input.x * speed, input.y * speed, PLAYER.accelHuman, dt);
      const mag = Math.hypot(input.x, input.y);
      if (mag > 0) {
        p.dirX = input.x / mag;
        p.dirY = input.y / mag;
      }
      if (input.kickRequested && s.owner === i) kickBall(s, i, p.dirX, p.dirY, KICK.speed);
    } else {
      // BOT
      think(s, i, decision);
      if (decision.kick && s.owner === i) {
        kickBall(s, i, decision.kx, decision.ky, decision.kickSpeed);
      } else {
        const dx = decision.tx - p.x;
        const dy = decision.ty - p.y;
        const d = Math.hypot(dx, dy);
        // Desacelera ao chegar no ponto (sem ficar tremendo em volta dele).
        const want = d < 0.3 ? 0 : Math.min(speed, d * 3);
        steer(p, d > 0 ? (dx / d) * want : 0, d > 0 ? (dy / d) * want : 0, PLAYER.accelBot, dt);
        const v = Math.hypot(p.vx, p.vy);
        if (v > 0.5) {
          p.dirX = p.vx / v;
          p.dirY = p.vy / v;
        }
      }
    }

    p.x = clamp(p.x + p.vx * dt, r, FIELD.width - r);
    p.y = clamp(p.y + p.vy * dt, r, FIELD.height - r);
  }

  separatePlayers(s);
  checkTackle(s);
  checkPickup(s);

  if (s.owner >= 0) {
    // Condução: a bola acompanha os pés, à frente do jogador.
    const o = s.players[s.owner];
    s.ball.x = o.x + o.dirX * CARRY_DISTANCE;
    s.ball.y = o.y + o.dirY * CARRY_DISTANCE;
    s.ball.vx = o.vx;
    s.ball.vy = o.vy;
  } else {
    moveBall(s.ball, dt);
  }

  const scoredBy = resolveBallBounds(s.ball);
  if (scoredBy) {
    s.score[scoredBy] += 1;
    s.owner = -1;
    s.ball.vx = 0;
    s.ball.vy = 0;
    const won = s.score[scoredBy] >= MATCH.goalsToWin || s.suddenDeath;
    s.phase = won ? 'ended' : 'goal';
    s.phaseTimer = MATCH.goalPause;
    return won ? 'ended' : 'goal';
  }
  return 'none';
}
