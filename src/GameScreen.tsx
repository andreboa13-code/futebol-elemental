/**
 * Tela da partida: junta o loop do jogo, o desenho (Skia) e o placar (React).
 */
import { Canvas } from '@shopify/react-native-skia';
import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useGameLoop } from './game/useGameLoop';
import { Ball } from './render/Ball';
import { Field } from './render/Field';
import { computeLayout } from './render/layout';
import { ErrorScreen } from './ui/ErrorBoundary';

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const layout = useMemo(() => computeLayout(width, height), [width, height]);
  const { state, score, loopError } = useGameLoop();

  if (loopError) return <ErrorScreen message={`Erro no loop do jogo: ${loopError}`} />;

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Field layout={layout} />
        <Ball state={state} layout={layout} />
      </Canvas>

      {/* Placar: React comum por cima do Canvas, atualizado só quando sai gol */}
      <View style={styles.scoreboard} pointerEvents="none">
        <Text style={[styles.score, styles.left]}>{score.left}</Text>
        <Text style={styles.separator}>×</Text>
        <Text style={[styles.score, styles.right]}>{score.right}</Text>
      </View>

      <Text style={styles.badge} pointerEvents="none">
        M0 · demonstração do loop
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d3b1c' },
  scoreboard: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: 10,
  },
  score: { fontSize: 22, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  left: { color: '#3fa9f5' },
  right: { color: '#f5563f' },
  separator: { color: '#fff', fontSize: 18, marginHorizontal: 6 },
  badge: { position: 'absolute', bottom: 6, right: 10, color: 'rgba(255,255,255,0.6)', fontSize: 11 },
});
