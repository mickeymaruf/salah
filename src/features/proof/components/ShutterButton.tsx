import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';

export function ShutterButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Take photo"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.ring, disabled && styles.disabled]}
    >
      <View style={styles.core} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.brand.onDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.brand.onDark },
  disabled: { opacity: 0.5 },
});
