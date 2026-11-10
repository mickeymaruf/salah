import { Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/shared/theme';

interface CloseButtonProps {
  onPress: () => void;
}

// 40 px circle as in Figma, with a 2 px slop on every side for a 44 px touch target.
export function CloseButton({ onPress }: CloseButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={2}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <X size={20} color={colors.brand.onDark} strokeWidth={1.75} strokeLinecap="round" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.reminder.closeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
