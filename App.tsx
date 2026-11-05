import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GameScreen } from './src/GameScreen';
import { ErrorBoundary } from './src/ui/ErrorBoundary';

export default function App() {
  return (
    // GestureHandlerRootView: necessário para os controles de toque (M1 em diante).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <GameScreen />
      </ErrorBoundary>
      <StatusBar hidden />
    </GestureHandlerRootView>
  );
}
