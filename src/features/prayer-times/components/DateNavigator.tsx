import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { colors } from '@/shared/theme';

const ARROW = 40;

interface DateNavigatorProps {
  date: string;
  sub: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

// The top row of the prayer sheet: a square arrow on each side and the date with "Today" (or "Yesterday", ...) under it.
export function DateNavigator({ date, sub, canGoBack, canGoForward, onBack, onForward }: DateNavigatorProps) {
  return (
    <View style={styles.row}>
      <Arrow label="Previous day" enabled={canGoBack} onPress={onBack} Icon={ChevronLeft} />
      <View style={styles.centre} accessible accessibilityRole="header" accessibilityLabel={`${date}, ${sub}`}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {date}
        </Text>
        <Text variant="tiny" color="muted">
          {sub}
        </Text>
      </View>
      <Arrow label="Next day" enabled={canGoForward} onPress={onForward} Icon={ChevronRight} />
    </View>
  );
}

interface ArrowProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
  Icon: typeof ChevronLeft;
}

function Arrow({ label, enabled, onPress, Icon }: ArrowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      // The square is 40 px in Figma; the extra hit area brings the touch target to 48.
      hitSlop={4}
      style={[styles.arrow, !enabled && styles.arrowOff]}
    >
      <Icon size={20} color={colors.ink.primary} strokeWidth={1.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  arrow: {
    width: ARROW,
    height: ARROW,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowOff: { opacity: 0.35 },
});
