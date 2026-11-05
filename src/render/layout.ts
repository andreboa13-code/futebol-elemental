/**
 * Converte "metros do jogo" em pixels.
 * O mundo é desenhado com origem (0,0) no canto do campo; a câmera (useCamera)
 * desloca esse desenho para manter o seu jogador no centro da tela.
 */
import { CAMERA, FIELD } from '../config/balance';

export type Layout = {
  /** Pixels por metro do jogo (já com o zoom aplicado). */
  scale: number;
  /** Posição em pixels do canto do campo dentro do mundo desenhado (0 com câmera). */
  originX: number;
  originY: number;
  /** Tamanho da tela em pixels. */
  screenWidth: number;
  screenHeight: number;
};

/** Margem lateral em pixels quando o zoom é 1. */
const SIDE_MARGIN = 12;

export function computeLayout(screenWidth: number, screenHeight: number): Layout {
  // Com zoom 1, a largura do campo ocupa a largura da tela. O zoom multiplica a partir daí.
  const fitScale = Math.max(1, screenWidth - SIDE_MARGIN * 2) / FIELD.width;
  return {
    scale: fitScale * CAMERA.zoom,
    originX: 0,
    originY: 0,
    screenWidth,
    screenHeight,
  };
}
