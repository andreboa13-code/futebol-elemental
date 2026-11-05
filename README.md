# Futebol Elemental

Futebol arcade 3v3 para celular em pé, visto de cima, em que cada personagem carrega a bola com o seu elemento (fogo, gelo, raio).

Especificação do MVP: https://claude.ai/artifact/2vLA2ZbpWxfrYtD7hiswQp

## Como testar no celular

1. Instale o app **Expo Go** no celular (Play Store ou App Store).
2. No computador, com o Node.js instalado, rode na pasta do projeto:
   ```bash
   npm install
   npx expo start
   ```
3. Escaneie o QR code que aparece no terminal com o Expo Go (Android) ou com a câmera (iPhone).
   O celular e o computador precisam estar na mesma rede Wi-Fi.
4. Se o celular não conseguir abrir (fica carregando ou dá erro de conexão), use o modo túnel,
   que funciona mesmo em redes diferentes:
   ```bash
   npm run tunel
   ```

## Como se joga

Um único controle: toque em qualquer lugar da tela e arraste para correr. Soltar o dedo chuta na direção em que o jogador está virado. Encostar em quem está com a bola rouba a bola. Você ataca para cima.

Você sempre controla quem está com a bola ou, sem ela, o jogador do seu time mais perto dela (anel amarelo). Partida de 2 minutos: quem fizer 2 gols vence na hora; empate vai para 30 s de morte súbita.

## Onde ajustar a sensação do jogo

Todos os números de equilíbrio (tamanho do campo, atrito da bola, força do chute) ficam em
[`src/config/balance.ts`](src/config/balance.ts), com comentários explicando cada um.

## Estrutura

| Pasta | O que tem |
| --- | --- |
| `src/config` | Valores de equilíbrio do jogo |
| `src/game` | Regras, física e o loop a 60 fps (roda na thread de UI) |
| `src/input` | Joystick flutuante (toque e arraste) |
| `src/render` | Desenho com Skia: campo, bola, jogadores |
| `src/ui` | Telas e componentes React (placar, erros, menus) |

## Roadmap

- [x] **M0** Base do projeto: campo e loop a 60 fps com uma bola de demonstração
- [x] **M1** Sensação da bola: joystick único (arrastar corre, soltar chuta), condução e gol
- [x] **M2** Partida 3v3 contra bots, cronômetro, roubada e tela de fim
- [ ] **M3** Bola elemental e 3 personagens
- [ ] **M4** Menus, escolha de personagem e sons
- [ ] **M5** Arte e polimento
- [ ] **M6** Teste com pessoas reais
