/** Desenho do joystick flutuante (só aparece enquanto o dedo está na tela). */
import { Circle, Group } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { JOYSTICK } from '../config/balance';
import type { JoystickVisual } from '../input/useJoystick';

type Props = { visual: SharedValue<JoystickVisual> };

export function Joystick({ visual }: Props) {
  const opacity = useDerivedValue(() => (visual.value.active ? 1 : 0));
  const baseX = useDerivedValue(() => visual.value.baseX);
  const baseY = useDerivedValue(() => visual.value.baseY);
  const knobX = useDerivedValue(() => visual.value.knobX);
  const knobY = useDerivedValue(() => visual.value.knobY);

  return (
    <Group opacity={opacity}>
      <Circle cx={baseX} cy={baseY} r={JOYSTICK.radiusPx} color="rgba(255,255,255,0.15)" />
      <Circle cx={baseX} cy={baseY} r={JOYSTICK.radiusPx} color="rgba(255,255,255,0.5)" style="stroke" strokeWidth={2} />
      <Circle cx={knobX} cy={knobY} r={JOYSTICK.radiusPx * 0.45} color="rgba(255,255,255,0.7)" />
    </Group>
  );
}
