import { Animated, Pressable, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, sizes } from '@/shared/theme';
import type { LogChoice } from '../logChoice';

export type ButtonRole = 'idle' | 'tapped' | 'other';

interface ChoiceButtonProps {
  kind: LogChoice;
  // Where this button sits in the pill: the missed button on the left, the prayed one on the right.
  role: ButtonRole;
  // Marking progress, 0 to 1. Only read while a mark is animating.
  progress: Animated.Value;
  dimmed: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
  style: object;
}

const ICON_SIZE = 22;
const STROKE = 1.25;

// A 44 px rounded square holding a thin cross or check. While its pill is being marked, the tapped one turns solid and
// then fades with the circle that covers the pill, and the other one fades away.
export function ChoiceButton({ kind, role, progress, dimmed, disabled, label, onPress, style }: ChoiceButtonProps) {
  const accent = kind === 'prayed' ? colors.brand.green : colors.state.missed;
  const Icon = kind === 'prayed' ? Check : X;

  const opacity =
    role === 'tapped'
      ? progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] })
      : role === 'other'
        ? progress.interpolate({ inputRange: [0, 0.4, 0.8], outputRange: [1, 0.3, 0], extrapolate: 'clamp' })
        : dimmed
          ? 0.45
          : 1;
  const solid = progress.interpolate({ inputRange: [0, 0.25], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <Animated.View style={[styles.slot, style, { opacity }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={styles.button}
      >
        <Icon size={ICON_SIZE} color={accent} strokeWidth={STROKE} />
        {role === 'tapped' ? (
          <Animated.View pointerEvents="none" style={[styles.solid, { backgroundColor: accent, opacity: solid }]}>
            <Icon size={ICON_SIZE} color={colors.bg.surface} strokeWidth={STROKE} />
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', width: sizes.iconButton, height: sizes.iconButton },
  button: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line.soft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  solid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
