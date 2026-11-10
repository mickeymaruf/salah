import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Moon } from 'lucide-react-native';
import { colors } from '@/shared/theme';

const SIZE = 201.6;
const CENTER = SIZE / 2;
// Outer to inner, as in Figma: radii 100.26, 75.06 and 49.86 with a 1.08 stroke, then a 57.6 px disc.
const RADII = [100.26, 75.06, 49.86];
const DISC = 57.6;

// Three thin rings and a moon. Static: this screen never rings or pulses.
export function StaticRings() {
  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        {RADII.map((r, i) => (
          <Circle key={r} cx={CENTER} cy={CENTER} r={r} stroke={colors.ring[i]} strokeWidth={1.08} fill="none" />
        ))}
      </Svg>
      <View style={styles.disc}>
        <Moon size={32} color={colors.brand.onDark} strokeWidth={1.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    backgroundColor: colors.brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
