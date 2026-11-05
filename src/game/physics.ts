/**
 * FÍSICA DA BOLA
 * --------------
 * Funções puras marcadas com 'worklet' para rodarem na thread de UI,
 * dentro do loop de 60 fps, sem passar pelo JavaScript do React.
 *
 * Convenção do mundo: origem (0,0) no canto superior esquerdo do campo,
 * x para a direita, y para baixo, em "metros do jogo".
 * Gol de CIMA (y = 0) é onde o seu time marca. Gol de BAIXO é o seu.
 */
import { BALL, FIELD } from '../config/balance';
import type { BallState, Team } from './types';

/** Faixa horizontal (x) ocupada pela boca dos gols. */
export function goalMouth(): { left: number; right: number } {
  'worklet';
  const left = (FIELD.width - FIELD.goalWidth) / 2;
  return { left, right: left + FIELD.goalWidth };
}

/** Move a bola solta `dt` segundos, aplicando atrito. Modifica `ball` no lugar. */
export function moveBall(ball: BallState, dt: number): void {
  'worklet';
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Atrito exponencial: independe da taxa de quadros (30 ou 120 fps dão o mesmo resultado).
  const decay = Math.pow(BALL.frictionPerSecond, dt);
  ball.vx *= decay;
  ball.vy *= decay;
  if (Math.hypot(ball.vx, ball.vy) < BALL.stopSpeed) {
    ball.vx = 0;
    ball.vy = 0;
  }
}

/**
 * Trata paredes e gols. Chamada todo quadro, com a bola solta ou nos pés.
 * Devolve o time que marcou, ou null se não houve gol.
 */
export function resolveBallBounds(ball: BallState): Team | null {
  'worklet';
  const r = BALL.radius;
  const { left, right } = goalMouth();

  // Laterais (esquerda e direita): sempre parede.
  if (ball.x < r) {
    ball.x = r;
    ball.vx = Math.abs(ball.vx) * BALL.wallBounce;
  } else if (ball.x > FIELD.width - r) {
    ball.x = FIELD.width - r;
    ball.vx = -Math.abs(ball.vx) * BALL.wallBounce;
  }

  // Linhas de fundo: parede, exceto na boca do gol.
  const insideMouth = ball.x > left + r && ball.x < right - r;

  if (insideMouth) {
    // A bola inteira cruzou a linha → gol.
    if (ball.y < -r) return 'home';
    if (ball.y > FIELD.height + r) return 'away';
  } else {
    if (ball.y < r) {
      ball.y = r;
      ball.vy = Math.abs(ball.vy) * BALL.wallBounce;
    } else if (ball.y > FIELD.height - r) {
      ball.y = FIELD.height - r;
      ball.vy = -Math.abs(ball.vy) * BALL.wallBounce;
    }
  }

  return null;
}

/** Coloca a bola parada no centro do campo. */
export function resetBallToCenter(ball: BallState): void {
  'worklet';
  ball.x = FIELD.width / 2;
  ball.y = FIELD.height / 2;
  ball.vx = 0;
  ball.vy = 0;
}
