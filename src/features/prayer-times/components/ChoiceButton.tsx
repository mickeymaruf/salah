import type { Ref } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';
import type { ViewHandle } from '@/shared/feedback';
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
  // The outer view, so the confetti can start from the middle of the button.
  slotRef?: Ref<ViewHandle>;
}

const LEAVE_SCALE = 0.6;

const ICON_SIZE = 22;
const STROKE = 2;

// A 44 px tile with 14 px corners, tinted red or green, holding a plain cross or check (Figma 18047:13, "3 · Today · before"). When its pill is marked the
// button fades away and shrinks while the colour grows over the pill.
export function ChoiceButton({ kind, leave, dimmed, disabled, label, onPress, style, slotRef }: ChoiceButtonProps) {
  const Icon = kind === 'prayed' ? Check : X;
  const accent = kind === 'prayed' ? colors.brand.green : colors.state.missed;
  const opacity = leave ? leave.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : dimmed ? 0.45 : 1;
  const scale = leave ? leave.interpolate({ inputRange: [0, 1], outputRange: [1, LEAVE_SCALE] }) : 1;

  return (
    <Animated.View ref={slotRef} collapsable={false} style={[styles.slot, style, { opacity, transform: [{ scale }] }]}>
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
  button: { flex: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
