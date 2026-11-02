import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { colors } from '@/shared/theme';

const SIZES = [280, 210, 140];

export function PulseRings() {
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {SIZES.map((size, i) => (
        <Animated.View
          key={size}
          style={[
            styles.ring,
            { width: size, height: size, borderRadius: size / 2, borderColor: colors.ring[i], transform: [{ scale }] },
          ]}
        />
      ))}
      <View style={styles.bell}>
        <Bell size={32} color={colors.brand.onDark} strokeWidth={1.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1 },
  bell: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
