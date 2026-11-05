/**
 * Converte "metros do jogo" em pixels da tela.
 * O campo (com as redes em cima e embaixo) é encaixado na tela, em pé, mantendo a proporção.
 */
import { FIELD } from '../config/balance';

export type Layout = {
  /** Pixels por metro do jogo. */
  scale: number;
  /** Posição em pixels do canto superior esquerdo do campo. */
  originX: number;
  originY: number;
};

/** Margem lateral em pixels. */
const SIDE_MARGIN = 12;
/** Espaço reservado em cima para o placar. */
const TOP_RESERVED = 56;

export function computeLayout(screenWidth: number, screenHeight: number): Layout {
  // Comprimento total desenhado inclui a profundidade das duas redes.
  const worldW = FIELD.width;
  const worldH = FIELD.height + FIELD.goalDepth * 2;

  const availW = Math.max(1, screenWidth - SIDE_MARGIN * 2);
  const availH = Math.max(1, screenHeight - TOP_RESERVED - SIDE_MARGIN);
  const scale = Math.min(availW / worldW, availH / worldH);

  return {
    scale,
    originX: (screenWidth - FIELD.width * scale) / 2,
    originY: TOP_RESERVED + (availH - FIELD.height * scale) / 2,
  };
}
