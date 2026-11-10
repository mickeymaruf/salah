import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';

export const ROLL_MS = 280;
const OLD_TRAVEL = -68;
const NEW_OFFSET = 20;
const NEW_START_OPACITY = 0.85;
const OLD_END_SCALE = 0.9;

interface RollingCountProps {
  value: number;
  reduceMotion: boolean;
}

// The number rolls on each change: the old one moves up about 68 px, fades and shrinks a little, and the new one comes in from about 20 px below
// at 85% opacity and settles (Figma P-H2b). A new tap stops the running roll and starts the next one at once. With Reduce Motion it is a crossfade.
export function RollingCount({ value, reduceMotion }: RollingCountProps) {
  const [progress] = useState(() => new Animated.Value(1));
  const last = useRef(value);
  const [pair, setPair] = useState({ old: value, current: value });

  useEffect(() => {
    if (last.current === value) return;
    setPair({ old: last.current, current: value });
    last.current = value;
    progress.stopAnimation();
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: ROLL_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [value, progress]);

  const range = (from: number, to: number) => progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  const oldStyle = reduceMotion
    ? { opacity: range(1, 0) }
    : { opacity: range(1, 0), transform: [{ translateY: range(0, OLD_TRAVEL) }, { scale: range(1, OLD_END_SCALE) }] };
  const newStyle = reduceMotion
    ? { opacity: range(0, 1) }
    : { opacity: range(NEW_START_OPACITY, 1), transform: [{ translateY: range(NEW_OFFSET, 0) }] };

  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.layer, oldStyle]}>
        <Text variant="tapCount" color="brand" style={styles.number}>
          {pair.old}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.layer, newStyle]}>
        <Text variant="tapCount" color="brand" style={styles.number}>
          {pair.current}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 150, alignSelf: 'stretch' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  number: { textAlign: 'center' },
});
