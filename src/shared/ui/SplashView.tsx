import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme';
import { LogoMark } from './LogoMark';
import { Text } from './Text';

const BOX = 160;

export function SplashView() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <View style={styles.mark}>
          <Svg width={BOX} height={BOX} style={StyleSheet.absoluteFill}>
            <Circle cx={BOX / 2} cy={BOX / 2} r={BOX / 2 - 0.5} stroke={colors.ring[0]} strokeWidth={1} fill="none" />
            <Circle cx={BOX / 2} cy={BOX / 2} r={BOX / 2 - 22.5} stroke={colors.ring[1]} strokeWidth={1} fill="none" />
          </Svg>
          <LogoMark height={80} archColor={colors.brand.onDark} moonColor={colors.brand.greenDark} />
          <Text variant="splash" color="onDark" style={styles.name}>
            Salah
          </Text>
        </View>
      </View>
      <Text variant="small" color="onDark" style={[styles.tagline, { marginBottom: insets.bottom + 48 }]}>
        Be present for every prayer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand.greenDark, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center' },
  // The mark box is centered on the screen, the same place the native splash image uses.
  mark: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' },
  name: { position: 'absolute', top: BOX + 24, width: 240, textAlign: 'center' },
  tagline: { opacity: 0.55 },
});
