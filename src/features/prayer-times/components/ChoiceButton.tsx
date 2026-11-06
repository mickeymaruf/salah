import type { Ref } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { ViewHandle } from '@/shared/feedback';
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
  // The outer view, so the confetti can start from the middle of the button.
  slotRef?: Ref<ViewHandle>;
}

const ICON_SIZE = 16;
const STROKE = 3.25;
const BADGE = 30;
const LEAVE_SCALE = 0.6;

// A 44 px tile with 14 px corners, tinted red or green, holding a round badge with a thick white cross or check (Figma 14034:15). When its pill is marked the button fades
// away and shrinks while the colour grows over the pill.
export function ChoiceButton({ kind, leave, dimmed, disabled, label, onPress, style, slotRef }: ChoiceButtonProps) {
  const accent = kind === 'prayed' ? colors.brand.green : colors.state.missed;
  const Icon = kind === 'prayed' ? Check : X;

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
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Icon size={ICON_SIZE} color={colors.bg.surface} strokeWidth={STROKE} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', width: sizes.iconButton, height: sizes.iconButton },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 2,
    borderColor: colors.badgeRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
