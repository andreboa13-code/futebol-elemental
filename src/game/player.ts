/**
 * JOGADOR CONTROLADO
 * ------------------
 * Movimento, domínio de bola (condução) e chute.
 * Regra de controle: arrastar move; soltar o dedo chuta (se estiver com a bola).
 */
import { BALL, FIELD, KICK, PLAYER } from '../config/balance';
import type { BallState, InputState, PlayerState } from './types';

/** Distância do centro do jogador ao centro da bola quando ela está nos pés. */
const CARRY_DISTANCE = PLAYER.radius + BALL.radius + 0.05;

export function createPlayer(): PlayerState {
  return {
    x: FIELD.width / 2,
    y: FIELD.height * PLAYER.startYFraction,
    dirX: 0,
    dirY: -1, // virado para o gol adversário (para cima)
    hasBall: false,
    recover: 0,
  };
}

export function resetPlayer(p: PlayerState): void {
  'worklet';
  p.x = FIELD.width / 2;
  p.y = FIELD.height * PLAYER.startYFraction;
  p.dirX = 0;
  p.dirY = -1;
  p.hasBall = false;
  p.recover = 0;
}

/**
 * Avança o jogador `dt` segundos e cuida da interação com a bola.
 * Deve ser chamada ANTES de mover a bola solta.
 */
export function stepPlayer(p: PlayerState, ball: BallState, input: InputState, dt: number): void {
  'worklet';
  // 1) Movimento a partir do joystick.
  const speed = p.hasBall ? PLAYER.dribbleSpeed : PLAYER.maxSpeed;
  const vx = input.x * speed;
  const vy = input.y * speed;
  p.x += vx * dt;
  p.y += vy * dt;

  // Mantém o jogador dentro do campo.
  const r = PLAYER.radius;
  p.x = Math.min(Math.max(p.x, r), FIELD.width - r);
  p.y = Math.min(Math.max(p.y, r), FIELD.height - r);

  // Atualiza para onde ele está virado (só se o joystick estiver sendo usado).
  const mag = Math.hypot(input.x, input.y);
  if (mag > 0) {
    p.dirX = input.x / mag;
    p.dirY = input.y / mag;
  }

  if (p.recover > 0) p.recover -= dt;

  // 2) Domínio: encostou numa bola não muito rápida → ela gruda nos pés.
  if (!p.hasBall && p.recover <= 0) {
    const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    if (dist < CARRY_DISTANCE + PLAYER.pickupRange && ballSpeed < PLAYER.maxPickupBallSpeed) {
      p.hasBall = true;
    }
  }

  // 3) Chute ao soltar o dedo.
  if (input.kickRequested && p.hasBall) {
    p.hasBall = false;
    p.recover = KICK.recoverTime;
    ball.vx = p.dirX * KICK.speed;
    ball.vy = p.dirY * KICK.speed;
  }

  // 4) Condução: a bola acompanha os pés, à frente do jogador.
  if (p.hasBall) {
    ball.x = p.x + p.dirX * CARRY_DISTANCE;
    ball.y = p.y + p.dirY * CARRY_DISTANCE;
    ball.vx = vx;
    ball.vy = vy;
  }
}
