import { Pressable, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '@/shared/theme';

const SIZE = 40;

interface ArrowButtonProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
  Icon: LucideIcon;
}

// A 40 px rounded square with a thin chevron: the previous and next buttons beside the date and in the calendar header.
export function ArrowButton({ label, enabled, onPress, Icon }: ArrowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      // The square is 40 px in Figma; the extra hit area brings the touch target to 48.
      hitSlop={4}
      style={[styles.arrow, !enabled && styles.off]}
    >
      <Icon size={20} color={colors.ink.primary} strokeWidth={1.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: SIZE,
    height: SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.35 },
});
