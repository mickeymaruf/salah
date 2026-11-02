import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/theme';

interface ScreenProps {
  children: ReactNode;
  tone?: 'light' | 'dark' | 'camera';
  scroll?: boolean;
  // Tab screens leave the bottom inset to the tab bar.
  bottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BACKGROUNDS = {
  light: colors.bg.base,
  dark: colors.brand.greenDark,
  camera: colors.camera.background,
} as const;

export function Screen({ children, tone = 'light', scroll = false, bottomInset = true, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const background = BACKGROUNDS[tone];
  const padding = {
    paddingTop: insets.top,
    paddingBottom: bottomInset ? Math.max(insets.bottom, spacing.lg) : 0,
  };

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <StatusBar style={tone === 'light' ? 'dark' : 'light'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, padding, style]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, padding, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  content: { paddingHorizontal: spacing.screenX },
});
