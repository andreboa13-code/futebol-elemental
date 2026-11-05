/**
 * BALANÇO DO JOGO
 * ----------------
 * Todos os números que mudam a "sensação" do jogo ficam aqui.
 * Para ajustar algo (ex.: bola mais rápida), mude só este arquivo.
 *
 * Unidade de distância: "metros do jogo" (não pixels).
 * O campo é desenhado em escala para caber em qualquer tela.
 */

export const FIELD = {
  /** Largura do campo (de um gol ao outro). */
  width: 40,
  /** Altura do campo (de uma lateral à outra). */
  height: 24,
  /** Abertura do gol, medida na linha de fundo. */
  goalWidth: 7,
  /** Profundidade da rede, atrás da linha de fundo. */
  goalDepth: 1.6,
  /** Raio do círculo central. */
  centerCircleRadius: 3.5,
} as const;

export const BALL = {
  radius: 0.45,
  /**
   * Atrito: fração da velocidade que SOBRA após 1 segundo.
   * 0.35 = a bola perde 65% da velocidade por segundo.
   */
  frictionPerSecond: 0.35,
  /** Quanto da velocidade sobra ao bater numa parede (0 a 1). */
  wallBounce: 0.75,
  /** Abaixo desta velocidade a bola é considerada parada. */
  stopSpeed: 0.05,
} as const;

/** Configuração da demonstração do M0 (bola chutada sozinha). */
export const DEMO = {
  /** Força mínima e máxima do chute automático (metros por segundo). */
  minKickSpeed: 14,
  maxKickSpeed: 24,
  /** Segundos com a bola parada antes de um novo chute automático. */
  idleBeforeKick: 0.6,
} as const;

/** Maior passo de tempo aceito por quadro (evita "teleporte" após travadas). */
export const MAX_FRAME_DT = 1 / 30;
