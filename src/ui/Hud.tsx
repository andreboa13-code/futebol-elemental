/**
 * Placar, cronômetro e telas de "GOL!" e fim de partida.
 * Componentes React comuns por cima do Canvas; atualizam no máximo 1x por segundo.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HudState } from '../game/types';
import { TEAM_COLORS } from '../render/colors';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Scoreboard({ hud }: { hud: HudState }) {
  return (
    <View style={styles.scoreboard} pointerEvents="none">
      <Text style={[styles.score, { color: TEAM_COLORS.home }]}>{hud.home}</Text>
      <View style={styles.clock}>
        <Text style={styles.clockText}>{formatTime(hud.seconds)}</Text>
        {hud.suddenDeath && <Text style={styles.sudden}>MORTE SÚBITA</Text>}
      </View>
      <Text style={[styles.score, { color: TEAM_COLORS.away }]}>{hud.away}</Text>
    </View>
  );
}

export function GoalBanner() {
  return (
    <View style={styles.center} pointerEvents="none">
      <Text style={styles.goal}>GOL!</Text>
    </View>
  );
}

export function EndScreen({ hud, onRestart }: { hud: HudState; onRestart: () => void }) {
  const title = hud.home > hud.away ? 'Vitória!' : hud.home < hud.away ? 'Derrota' : 'Empate';
  return (
    <View style={[styles.center, styles.dim]}>
      <Text style={styles.endTitle}>{title}</Text>
      <Text style={styles.endScore}>
        {hud.home} × {hud.away}
      </Text>
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onRestart}>
        <Text style={styles.buttonText}>Jogar de novo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreboard: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  score: { fontSize: 24, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  clock: { alignItems: 'center', marginHorizontal: 12, minWidth: 56 },
  clockText: { color: '#fff', fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  sudden: { color: '#ffd34d', fontSize: 9, fontWeight: '800', marginTop: 1 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  dim: { backgroundColor: 'rgba(0,0,0,0.6)' },
  goal: { color: '#ffd34d', fontSize: 64, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 8 },
  endTitle: { color: '#fff', fontSize: 40, fontWeight: '900' },
  endScore: { color: '#fff', fontSize: 28, fontWeight: '700', marginVertical: 12 },
  button: { backgroundColor: '#249044', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
