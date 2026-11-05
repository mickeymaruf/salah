import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/shared/theme';

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
}

// The misty mosque picture behind the top of the screen, with two faint decorative sparkles. Nothing here takes touches.
export function HeroBackdrop({ sheetTop, safeTop }: HeroBackdropProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
      <Image
        source={require('../../../../assets/images/today-hero.png')}
        resizeMode="cover"
        style={[styles.image, { top: sheetTop + BELOW_SHEET - IMAGE_HEIGHT }]}
      />
      <View style={[styles.sparkle, { left: 236, top: safeTop + 4 }]}>
        <Sparkle size={38} />
      </View>
      <View style={[styles.sparkle, { left: 300, top: safeTop + 60 }]}>
        <Sparkle size={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { position: 'absolute', left: 0, right: 0, height: IMAGE_HEIGHT, width: '100%' },
  sparkle: { position: 'absolute', opacity: 0.35 },
});
