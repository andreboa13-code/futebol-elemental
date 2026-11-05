/**
 * FÍSICA DA BOLA
 * --------------
 * Funções puras marcadas com 'worklet' para rodarem na thread de UI,
 * dentro do loop de 60 fps, sem passar pelo JavaScript do React.
 *
 * Convenção do mundo: origem (0,0) no canto superior esquerdo do campo,
 * x para a direita, y para baixo, em "metros do jogo".
 */
import { BALL, FIELD } from '../config/balance';
import type { BallState, StepEvent } from './types';

/** Faixa vertical (y) ocupada pela boca do gol. */
export function goalMouth(): { top: number; bottom: number } {
  'worklet';
  const top = (FIELD.height - FIELD.goalWidth) / 2;
  return { top, bottom: top + FIELD.goalWidth };
}

/**
 * Avança a bola `dt` segundos.
 * Modifica `ball` no lugar (mais barato que criar objetos a cada quadro)
 * e devolve se houve gol.
 */
export function stepBall(ball: BallState, dt: number): StepEvent {
  'worklet';
  const r = BALL.radius;
  const { top, bottom } = goalMouth();

  // 1) Movimento.
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // 2) Atrito exponencial: independe da taxa de quadros (30 ou 120 fps dão o mesmo resultado).
  const decay = Math.pow(BALL.frictionPerSecond, dt);
  ball.vx *= decay;
  ball.vy *= decay;
  if (Math.hypot(ball.vx, ball.vy) < BALL.stopSpeed) {
    ball.vx = 0;
    ball.vy = 0;
  }

  // 3) Laterais (cima e baixo): sempre parede.
  if (ball.y < r) {
    ball.y = r;
    ball.vy = Math.abs(ball.vy) * BALL.wallBounce;
  } else if (ball.y > FIELD.height - r) {
    ball.y = FIELD.height - r;
    ball.vy = -Math.abs(ball.vy) * BALL.wallBounce;
  }

  // 4) Linhas de fundo: parede, exceto na boca do gol.
  const insideMouth = ball.y > top + r && ball.y < bottom - r;

  if (insideMouth) {
    // A bola inteira cruzou a linha → gol.
    if (ball.x < -r) return { kind: 'goal', scoredBy: 'right' };
    if (ball.x > FIELD.width + r) return { kind: 'goal', scoredBy: 'left' };
  } else {
    if (ball.x < r) {
      ball.x = r;
      ball.vx = Math.abs(ball.vx) * BALL.wallBounce;
    } else if (ball.x > FIELD.width - r) {
      ball.x = FIELD.width - r;
      ball.vx = -Math.abs(ball.vx) * BALL.wallBounce;
    }
  }

  return { kind: 'none' };
}

/** Coloca a bola parada no centro do campo. */
export function resetBallToCenter(ball: BallState): void {
  'worklet';
  ball.x = FIELD.width / 2;
  ball.y = FIELD.height / 2;
  ball.vx = 0;
  ball.vy = 0;
}
