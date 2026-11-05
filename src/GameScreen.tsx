/**
 * Tela da partida: junta o loop do jogo, o joystick, o desenho (Skia) e o placar (React).
 */
import { Canvas, Group } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { useGameLoop } from './game/useGameLoop';
import type { Team } from './game/types';
import { useJoystick } from './input/useJoystick';
import { Ball } from './render/Ball';
import { BallPointer } from './render/BallPointer';
import { Field } from './render/Field';
import { Joystick } from './render/Joystick';
import { computeLayout } from './render/layout';
import { Player } from './render/Player';
import { StaminaBar } from './render/StaminaBar';
import { useCamera } from './render/useCamera';
import { ErrorScreen } from './ui/ErrorBoundary';
import { EndScreen, GoalBanner, Scoreboard } from './ui/Hud';

/** Time de cada índice do estado: 0 a 2 = seu time, 3 a 5 = adversário. */
const PLAYER_TEAMS: Team[] = ['home', 'home', 'home', 'away', 'away', 'away'];

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const layout = useMemo(() => computeLayout(width, height), [width, height]);
  const { state, input, hud, loopError, restart } = useGameLoop();
  const { gesture, visual } = useJoystick(input);
  const camera = useCamera(state, layout);

  if (loopError) return <ErrorScreen message={`Erro no loop do jogo: ${loopError}`} />;

  return (
    <View style={styles.container}>
      {/* A área do jogo inteira é o joystick: toque em qualquer lugar. */}
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill}>
          <Canvas style={StyleSheet.absoluteFill}>
            {/* Mundo do jogo, deslocado pela câmera que segue o seu jogador */}
            <Group transform={camera.transform}>
              <Field layout={layout} />
              {PLAYER_TEAMS.map((team, i) => (
                <Player key={i} state={state} layout={layout} index={i} team={team} />
              ))}
              <Ball state={state} layout={layout} />
              <StaminaBar state={state} layout={layout} />
            </Group>
            {/* Elementos fixos na tela (não se movem com a câmera) */}
            <BallPointer state={state} layout={layout} offsetX={camera.offsetX} offsetY={camera.offsetY} />
            <Joystick visual={visual} />
          </Canvas>
        </View>
      </GestureDetector>

      <Scoreboard hud={hud} />
      {hud.phase === 'goal' && <GoalBanner />}
      {hud.phase === 'ended' && <EndScreen hud={hud} onRestart={restart} />}

      {hud.phase === 'playing' && (
        <Text style={styles.hint} pointerEvents="none">
          Arraste para correr · solte para chutar · encoste para roubar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d3b1c' },
  hint: { position: 'absolute', bottom: 6, alignSelf: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 11 },
});
