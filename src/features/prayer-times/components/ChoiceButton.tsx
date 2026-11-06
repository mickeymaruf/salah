import { Animated, Pressable, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';
import type { LogChoice } from '../logChoice';

interface ChoiceButtonProps {
  kind: LogChoice;
  // 0 to 1 while the pill is being marked: the button fades out and shrinks. Null at rest.
  leave: Animated.Value | null;
  dimmed: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
  style: object;
}

const ICON_SIZE = 22;
const STROKE = 2.25;
const LEAVE_SCALE = 0.6;

// A 44 px rounded square, tinted red or green, holding a thick cross or check. When its pill is marked the button fades
// away and shrinks while the colour grows over the pill.
export function ChoiceButton({ kind, leave, dimmed, disabled, label, onPress, style }: ChoiceButtonProps) {
  const accent = kind === 'prayed' ? colors.brand.green : colors.state.missed;
  const Icon = kind === 'prayed' ? Check : X;

  const opacity = leave ? leave.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : dimmed ? 0.45 : 1;
  const scale = leave ? leave.interpolate({ inputRange: [0, 1], outputRange: [1, LEAVE_SCALE] }) : 1;

  return (
    <Animated.View style={[styles.slot, style, { opacity, transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[styles.button, { backgroundColor: kind === 'prayed' ? colors.pill.prayedButton : colors.pill.missedButton }]}
      >
        <Icon size={ICON_SIZE} color={accent} strokeWidth={STROKE} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', width: sizes.iconButton, height: sizes.iconButton },
  button: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
