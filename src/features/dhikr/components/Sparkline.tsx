import { StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/shared/theme';
import { smoothPath, sparklinePoints } from '../chart';

// The line is 120 x 44 as in Figma; the svg is 4 px wider each side so the 8 px dot on today is not cut off.
const LINE_WIDTH = 120;
const HEIGHT = 44;
const PAD = 4;
const DOT_RADIUS = 4;

interface SparklineProps {
  // Daily deeds, oldest first, today last.
  values: readonly number[];
}

export function Sparkline({ values }: SparklineProps) {
  const points = sparklinePoints(values, PAD, LINE_WIDTH, PAD, HEIGHT - PAD * 2);
  const today = points[points.length - 1];
  return (
    <Svg width={LINE_WIDTH + PAD * 2} height={HEIGHT} style={styles.svg} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path d={smoothPath(points)} stroke={colors.brand.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {today ? <Circle cx={today.x} cy={today.y} r={DOT_RADIUS} fill={colors.brand.green} /> : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: { position: 'absolute', right: 46, top: 14 },
});
