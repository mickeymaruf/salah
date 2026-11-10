import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';

// The 24 px icon of Figma at x 24, in a 44 px touch area.
export function BackButton() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.button}>
      <ChevronLeft size={24} color={colors.ink.primary} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: sizes.iconButton, height: sizes.iconButton, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
});
