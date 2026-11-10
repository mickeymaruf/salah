import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, sizes } from '@/shared/theme';
import { Text } from '@/shared/ui';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  // Primary is the cream pill, ghost is the outlined one.
  variant: 'primary' | 'ghost';
}

// Grows with Dynamic Type: the height is a minimum, never a fixed size.
export function PillButton({ label, onPress, variant }: PillButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, primary ? styles.primary : styles.ghost, pressed && styles.pressed]}
    >
      <View>
        <Text variant="button" color="onDark" style={[styles.label, primary && styles.primaryLabel]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minHeight: sizes.buttonHeight,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.brand.onDark },
  ghost: { borderWidth: 1.25, borderColor: colors.reminder.ghostBorder },
  pressed: { opacity: 0.7 },
  label: { textAlign: 'center' },
  primaryLabel: { color: colors.brand.greenDark },
});
