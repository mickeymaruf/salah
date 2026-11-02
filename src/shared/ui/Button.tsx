import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, sizes } from '@/shared/theme';
import { Text } from './Text';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'light';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled = false, style }: ButtonProps) {
  const light = variant === 'light';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: light ? colors.brand.onDark : colors.brand.green },
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {icon}
      <Text variant="button" color={light ? 'brand' : 'onDark'} style={light && styles.darkLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizes.buttonHeight,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  dimmed: { opacity: 0.6 },
  darkLabel: { color: colors.brand.greenDark },
});
