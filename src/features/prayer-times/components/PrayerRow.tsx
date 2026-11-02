import { Pressable, StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { colors, sizes } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import { PRAYER_LABELS, type PrayerName } from '../calculate';
import type { PrayerState } from '../schedule';

interface PrayerRowProps {
  name: PrayerName;
  time: Date;
  state: PrayerState;
  isNext: boolean;
  manual: boolean;
  // Set for rows that can be logged by hand.
  onPress?: () => void;
}

export function PrayerRow({ name, time, state, isNext, manual, onPress }: PrayerRowProps) {
  const prayed = state === 'prayed';
  const muted = !prayed && !isNext;
  const label = `${PRAYER_LABELS[name]}, ${formatTime(time)}, ${isNext ? 'next' : state}`;

  const content = (
    <>
      <StatusMark state={state} isNext={isNext} manual={manual} />
      <Text variant={isNext ? 'bodyStrong' : 'bodyMedium'} color={muted ? 'muted' : 'primary'}>
        {PRAYER_LABELS[name]}
      </Text>
      <View style={styles.spacer} />
      <Text variant={isNext ? 'bodyStrong' : 'body'} color={muted ? 'muted' : 'primary'}>
        {formatTime(time)}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label} style={[styles.row, isNext && styles.next]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens a sheet to mark it prayed or missed"
      onPress={onPress}
      style={[styles.row, isNext && styles.next]}
    >
      {content}
    </Pressable>
  );
}

function StatusMark({ state, isNext, manual }: { state: PrayerState; isNext: boolean; manual: boolean }) {
  if (state === 'prayed' && manual) {
    return (
      <View style={[styles.mark, styles.ring, { borderColor: colors.brand.green }]}>
        <Check size={14} color={colors.brand.green} strokeWidth={3} />
      </View>
    );
  }
  if (state === 'prayed') {
    return (
      <View style={[styles.mark, styles.filled]}>
        <Check size={14} color={colors.brand.onDark} strokeWidth={3} />
      </View>
    );
  }
  if (isNext) {
    return (
      <View style={[styles.mark, styles.ring, { borderColor: colors.brand.green }]}>
        <View style={styles.dot} />
      </View>
    );
  }
  if (state === 'missed') {
    return (
      <View style={[styles.mark, { backgroundColor: colors.state.missed }]}>
        <X size={14} color={colors.brand.onDark} strokeWidth={3} />
      </View>
    );
  }
  return <View style={[styles.mark, styles.ring, { borderColor: colors.line.soft }]} />;
}

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.prayerRowHeight,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  next: { backgroundColor: colors.bg.sage },
  spacer: { flex: 1 },
  mark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filled: { backgroundColor: colors.brand.green },
  ring: { borderWidth: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.green },
});
