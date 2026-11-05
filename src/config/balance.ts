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
  /** Rapidez para atingir a velocidade desejada (maior = mais "seco"). */
  accelHuman: 20,
  accelBot: 10,
} as const;

export const KICK = {
  /** Velocidade da bola no chute (metros por segundo). */
  speed: 24,
  /** Segundos depois de chutar em que o jogador não pode dominar a bola de novo. */
  recoverTime: 0.35,
} as const;

/** Roubada de bola: basta encostar no adversário que está com a bola. */
export const TACKLE = {
  /** Distância extra, além dos raios, para a roubada acontecer. */
  reach: 0.15,
  /** Segundos que quem perdeu a bola fica sem poder dominar de novo. */
  stunTime: 0.7,
  /** Velocidade (fração) de quem acabou de perder a bola. */
  stunSpeedFactor: 0.5,
  /** Segundos até o mesmo jogador poder roubar de novo (evita pingue-pongue). */
  cooldown: 1.0,
  /** Segundos de proteção logo após dominar a bola (dá tempo de reagir antes de perder). */
  protectTime: 0.45,
} as const;

/** Regras da partida. */
export const MATCH = {
  /** Duração do tempo normal, em segundos. */
  duration: 120,
  /** Quem chegar a este número de gols vence na hora. */
  goalsToWin: 2,
  /** Morte súbita após empate no tempo normal (s). Gol nesse período vence. */
  suddenDeath: 30,
  /** Pausa para comemorar o gol antes de recomeçar (s). */
  goalPause: 1.5,
} as const;

/** Comportamento dos bots (dificuldade). */
export const AI = {
  /** Velocidade dos bots em relação à velocidade máxima (0 a 1). */
  speedFactor: 0.85,
  /** Tempo de reação depois de dominar a bola antes de passar/chutar (s). */
  reactionTime: 0.25,
  /** Distância do gol a partir da qual o bot chuta. */
  shootRange: 12,
  /** Adversário mais perto que isso = bot sob pressão e tenta passar. */
  pressureDistance: 2.6,
  /** Velocidade do passe dos bots (precisa ser dominável). */
  passSpeed: 15,
  /** Imprecisão do chute: fração da boca do gol em que o bot mira. */
  shotSpread: 0.75,
  /** Diferença de distância (m) para trocar o jogador que você controla. */
  switchHysteresis: 2,
} as const;

export const JOYSTICK = {
  /** Raio, em pixels, até onde o polegar precisa ir para correr na velocidade máxima. */
  radiusPx: 60,
  /** Abaixo desta fração do raio, o toque é ignorado (evita tremidas). */
  deadZone: 0.12,
} as const;

/** Maior passo de tempo aceito por quadro (evita "teleporte" após travadas). */
export const MAX_FRAME_DT = 1 / 30;
