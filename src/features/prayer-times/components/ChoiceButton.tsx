import type { Ref } from 'react';
import { Animated, Image, Pressable, StyleSheet } from 'react-native';
import { sizes } from '@/shared/theme';
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
const PICTURE = 38;

// The round 3D pictures from Figma (nodes 14034:15 and 14034:31), made by `scripts/prepare-buttons.js`.
const PICTURES = {
  missed: require('../../../../assets/images/button-missed.png'),
  prayed: require('../../../../assets/images/button-prayed.png'),
} as const;

// A 44 px touch area holding a round 38 px 3D cross or check. When its pill is marked the button fades away and
// shrinks while the colour grows over the pill.
export function ChoiceButton({ kind, leave, dimmed, disabled, label, onPress, style, slotRef }: ChoiceButtonProps) {
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
        style={styles.button}
      >
        <Image source={PICTURES[kind]} style={styles.picture} accessibilityIgnoresInvertColors />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', width: sizes.iconButton, height: sizes.iconButton },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  picture: { width: PICTURE, height: PICTURE, borderRadius: PICTURE / 2 },
});
