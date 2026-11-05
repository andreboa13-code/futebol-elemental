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

/**
 * VELOCIDADE GERAL DO JOGO
 * Multiplica TODAS as velocidades (jogadores, chute, passe) de uma vez.
 * 1 = original. 0.75 = 25% mais lento. Ajuste aqui se o jogo parecer rápido ou lento.
 */
export const GAME_SPEED = 0.75;

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
   * 0.45 = a bola perde 55% da velocidade por segundo.
   * (Um pouco menos de atrito que antes: com o jogo mais lento, a bola ainda precisa chegar longe.)
   */
  frictionPerSecond: 0.45,
  /** Quanto da velocidade sobra ao bater numa parede (0 a 1). */
  wallBounce: 0.75,
  /** Abaixo desta velocidade a bola é considerada parada. */
  stopSpeed: 0.05 * GAME_SPEED,
} as const;

export const PLAYER = {
  radius: 0.8,
  /** Velocidade máxima correndo (metros por segundo). */
  maxSpeed: 9 * GAME_SPEED,
  /** Velocidade com a bola nos pés (um pouco mais lento, para dar chance à defesa). */
  dribbleSpeed: 7.5 * GAME_SPEED,
  /** Distância extra, além dos raios, em que o jogador "gruda" na bola. */
  pickupRange: 0.25,
  /** Bola mais rápida que isso passa direto (não dá para dominar um chute forte). */
  maxPickupBallSpeed: 16 * GAME_SPEED,
  /** Rapidez para atingir a velocidade desejada (maior = mais "seco"). */
  accelHuman: 20,
  accelBot: 10,
} as const;

export const KICK = {
  /** Velocidade da bola no chute (metros por segundo). */
  speed: 24 * GAME_SPEED,
  /** Segundos depois de chutar em que o jogador não pode dominar a bola de novo. */
  recoverTime: 0.35,
  /** Segundos após o chute em que NINGUÉM domina a bola (ela precisa sair do pé primeiro). */
  graceTime: 0.12,
} as const;

/**
 * Roubada de bola: encoste NA BOLA, pela frente de quem conduz.
 * Chegar por trás (no corpo do jogador) não rouba.
 */
export const TACKLE = {
  /** Distância extra, além dos raios, entre quem rouba e a bola. */
  reach: 0.15,
  /**
   * Ângulo mínimo para roubar, como produto escalar com a direção de quem conduz.
   * 0 = só pela frente ou pelos lados (90°). Negativo libera um pouco por trás.
   */
  minFrontDot: 0,
  /** Segundos que quem perdeu a bola fica tonto: mais lento, sem dominar e sem roubar. */
  stunTime: 1.1,
  /** Velocidade (fração) de quem está tonto. */
  stunSpeedFactor: 0.45,
  /** Empurrão em quem perdeu a bola (m/s), para separar os dois jogadores. */
  knockback: 5,
  /** Segundos até quem roubou poder roubar de novo. */
  cooldown: 1.0,
  /** Segundos de proteção logo após dominar a bola: ninguém pode roubar nesse tempo. */
  protectTime: 0.9,
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
  /** Velocidade dos seus companheiros (bots) em relação à velocidade máxima (0 a 1). */
  speedFactor: 0.88,
  /**
   * Velocidade dos ADVERSÁRIOS em relação à velocidade máxima (0 a 1).
   * É o principal botão de DIFICULDADE: menor = mais fácil.
   */
  opponentSpeedFactor: 0.7,
  /** Tempo de reação depois de dominar a bola antes de passar/chutar (s). */
  reactionTime: 0.25,
  /** Distância do gol a partir da qual o bot chuta. */
  shootRange: 12,
  /** Adversário mais perto que isso = bot sob pressão e tenta passar. */
  pressureDistance: 2.6,
  /** Distância (m) em que o zagueiro deixa a posição para dar o bote em quem conduz. */
  backEngageRange: 7,
  /** Distância mínima (m) de um adversário à linha do passe para o bot arriscar passar. */
  laneMargin: 1.4,
  /** Velocidade do passe dos bots (precisa ser dominável). */
  passSpeed: 15 * GAME_SPEED,
  /** Imprecisão do chute: fração da boca do gol em que o bot mira. */
  shotSpread: 0.75,
  /** Preferência dos bots do seu time em passar para você (em "metros de vantagem"). */
  passToHumanBonus: 2,
} as const;

/**
 * SPRINT: quanto mais tempo você segura o joystick numa direção, mais rápido corre.
 * Soltar o dedo (ou virar mais de 90°) zera a aceleração.
 */
export const SPRINT = {
  /** Velocidade no começo da corrida (fração da velocidade normal). */
  startFactor: 0.75,
  /** Velocidade máxima depois de correr um tempo (fração da velocidade normal). */
  maxFactor: 1.3,
  /** Segundos segurando até chegar na velocidade máxima. */
  rampTime: 1.5,
  /** Força mínima no joystick (0 a 1) para contar como "correndo". */
  minInput: 0.5,
} as const;

/**
 * STAMINA: o sprint gasta; ficar parado recarrega rápido, andar devagar recarrega pouco.
 * Sem stamina, você ainda corre na velocidade normal, só não acelera além dela.
 */
export const STAMINA = {
  /** Quanto gasta por segundo correndo acima da velocidade normal (1 = barra cheia). */
  drainPerSecond: 0.3,
  /** Quanto recarrega por segundo parado. */
  refillStill: 0.45,
  /** Quanto recarrega por segundo andando sem sprint. */
  refillMoving: 0.1,
  /** Abaixo desta força no joystick (0 a 1) você conta como parado. */
  stillInput: 0.15,
} as const;

/** Câmera que segue o seu jogador. */
export const CAMERA = {
  /**
   * Zoom em relação ao campo inteiro caber na largura da tela.
   * 1 = campo inteiro na tela. 2 = tudo com o dobro do tamanho (mostra metade da largura).
   */
  zoom: 2,
  /** Quanto além das redes a câmera pode mostrar (m). */
  edgeMargin: 1,
} as const;

export const JOYSTICK = {
  /** Raio, em pixels, até onde o polegar precisa ir para correr na velocidade máxima. */
  radiusPx: 60,
  /** Abaixo desta fração do raio, o toque é ignorado (evita tremidas). */
  deadZone: 0.12,
} as const;

/** Maior passo de tempo aceito por quadro (evita "teleporte" após travadas). */
export const MAX_FRAME_DT = 1 / 30;
