/**
 * Tela da partida: junta o loop do jogo, o joystick, o desenho (Skia) e o placar (React).
 */
import { Canvas } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { useGameLoop } from './game/useGameLoop';
import { useJoystick } from './input/useJoystick';
import { Ball } from './render/Ball';
import { TEAM_COLORS } from './render/colors';
import { Field } from './render/Field';
import { Joystick } from './render/Joystick';
import { computeLayout } from './render/layout';
import { Player } from './render/Player';
import { ErrorScreen } from './ui/ErrorBoundary';

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const layout = useMemo(() => computeLayout(width, height), [width, height]);
  const { state, input, score, loopError } = useGameLoop();
  const { gesture, visual } = useJoystick(input);

  if (loopError) return <ErrorScreen message={`Erro no loop do jogo: ${loopError}`} />;

  return (
    // A tela inteira é a área do joystick: toque em qualquer lugar.
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Field layout={layout} />
          <Player state={state} layout={layout} />
          <Ball state={state} layout={layout} />
          <Joystick visual={visual} />
        </Canvas>

        {/* Placar: React comum por cima do Canvas, atualizado só quando sai gol */}
        <View style={styles.scoreboard} pointerEvents="none">
          <Text style={[styles.score, { color: TEAM_COLORS.home }]}>{score.home}</Text>
          <Text style={styles.separator}>×</Text>
          <Text style={[styles.score, { color: TEAM_COLORS.away }]}>{score.away}</Text>
        </View>

        <Text style={styles.hint} pointerEvents="none">
          Arraste para correr · solte para chutar
        </Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d3b1c' },
  scoreboard: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 10,
  },
  score: { fontSize: 22, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  separator: { color: '#fff', fontSize: 18, marginHorizontal: 6 },
  hint: { position: 'absolute', bottom: 6, alignSelf: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 11 },
});
