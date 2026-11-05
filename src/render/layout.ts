/**
 * Converte "metros do jogo" em pixels da tela.
 * O campo (com as redes) é encaixado na tela mantendo a proporção.
 */
import { FIELD } from '../config/balance';

export type Layout = {
  /** Pixels por metro do jogo. */
  scale: number;
  /** Posição em pixels do canto superior esquerdo do campo. */
  originX: number;
  originY: number;
};

/** Margem em pixels ao redor do campo (espaço para HUD e controles futuros). */
const SCREEN_MARGIN = 16;

export function computeLayout(screenWidth: number, screenHeight: number): Layout {
  // Largura total desenhada inclui a profundidade das duas redes.
  const worldW = FIELD.width + FIELD.goalDepth * 2;
  const worldH = FIELD.height;

  const availW = Math.max(1, screenWidth - SCREEN_MARGIN * 2);
  const availH = Math.max(1, screenHeight - SCREEN_MARGIN * 2);
  const scale = Math.min(availW / worldW, availH / worldH);

  return {
    scale,
    originX: (screenWidth - FIELD.width * scale) / 2,
    originY: (screenHeight - FIELD.height * scale) / 2,
  };
}
