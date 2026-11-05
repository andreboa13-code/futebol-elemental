/**
 * BALANÇO DO JOGO
 * ----------------
 * Todos os números que mudam a "sensação" do jogo ficam aqui.
 * Para ajustar algo (ex.: chute mais forte), mude só este arquivo.
 *
 * Unidade de distância: "metros do jogo" (não pixels).
 * O campo é desenhado em escala para caber em qualquer tela.
 *
 * Orientação: celular EM PÉ. O seu time ataca para CIMA.
 */

export const FIELD = {
  /** Largura do campo (de uma lateral à outra). */
  width: 24,
  /** Comprimento do campo (do gol de baixo ao gol de cima). */
  height: 40,
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

export const PLAYER = {
  radius: 0.8,
  /** Velocidade máxima correndo (metros por segundo). */
  maxSpeed: 9,
  /** Velocidade com a bola nos pés (um pouco mais lento, para dar chance à defesa). */
  dribbleSpeed: 7.5,
  /** Distância extra, além dos raios, em que o jogador "gruda" na bola. */
  pickupRange: 0.25,
  /** Bola mais rápida que isso passa direto (não dá para dominar um chute forte). */
  maxPickupBallSpeed: 16,
  /** Posição inicial: centro, um pouco abaixo do meio (fração do comprimento). */
  startYFraction: 0.62,
} as const;

export const KICK = {
  /** Velocidade da bola no chute (metros por segundo). */
  speed: 24,
  /** Segundos depois de chutar em que o jogador não pode dominar a bola de novo. */
  recoverTime: 0.35,
} as const;

export const JOYSTICK = {
  /** Raio, em pixels, até onde o polegar precisa ir para correr na velocidade máxima. */
  radiusPx: 60,
  /** Abaixo desta fração do raio, o toque é ignorado (evita tremidas). */
  deadZone: 0.12,
} as const;

/** Maior passo de tempo aceito por quadro (evita "teleporte" após travadas). */
export const MAX_FRAME_DT = 1 / 30;
