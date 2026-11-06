import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/shared/theme';
import { heroScale } from '../heroScale';

const IMAGE_HEIGHT = 585;
// Figma places the picture 31 px below the top of the prayer sheet, so the mosque base ends just above the sheet.
const BELOW_SHEET = 31;

// A four-point star drawn as a thin outline.
function Sparkle({ size }: { size: number }) {
  const m = size / 2;
  const path = `M ${m} 1 Q ${m} ${m} ${size - 1} ${m} Q ${m} ${m} ${m} ${size - 1} Q ${m} ${m} 1 ${m} Q ${m} ${m} ${m} 1 Z`;
  return (
    <Svg width={size} height={size}>
      <Path d={path} stroke={colors.ink.muted} strokeWidth={1} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

interface HeroBackdropProps {
  sheetTop: number;
  // Top of the area below the status bar. The sparkles are placed from it.
  safeTop: number;
  width: number;
}

// The misty mosque picture behind the top of the screen, with two faint decorative sparkles. Nothing here takes touches.
export function HeroBackdrop({ sheetTop, safeTop, width }: HeroBackdropProps) {
  const scale = heroScale(width);
  const imageHeight = IMAGE_HEIGHT * scale;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
      <Image
        source={require('../../../../assets/images/today-hero.png')}
        resizeMode="cover"
        style={[styles.image, { top: sheetTop + BELOW_SHEET * scale - imageHeight, height: imageHeight }]}
      />
      <View style={[styles.sparkle, { left: 236 * scale, top: safeTop + 4 * scale }]}>
        <Sparkle size={38 * scale} />
      </View>
      <View style={[styles.sparkle, { left: 300 * scale, top: safeTop + 60 * scale }]}>
        <Sparkle size={24 * scale} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { position: 'absolute', left: 0, right: 0, width: '100%' },
  sparkle: { position: 'absolute', opacity: 0.35 },
});
