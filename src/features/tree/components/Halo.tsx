import { StyleSheet } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/shared/theme';

// Figma: a 330 x 300 ellipse of bg/sage at 80% with a 50 px layer blur. The blur is drawn as a radial fade that spreads
// 50 px past the ellipse on every side.
const WIDTH = 330;
const HEIGHT = 300;
const SPREAD = 50;

export function Halo() {
  const width = WIDTH + SPREAD * 2;
  const height = HEIGHT + SPREAD * 2;
  return (
    <Svg width={width} height={height} style={styles.halo} pointerEvents="none">
      <Defs>
        <RadialGradient id="halo" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={colors.bg.sage} stopOpacity={0.8} />
          <Stop offset="0.62" stopColor={colors.bg.sage} stopOpacity={0.68} />
          <Stop offset="1" stopColor={colors.bg.sage} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill="url(#halo)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute' },
});

export const HALO_SIZE = { width: WIDTH + SPREAD * 2, height: HEIGHT + SPREAD * 2 } as const;
