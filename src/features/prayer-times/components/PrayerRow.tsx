import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
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
}

export function PrayerRow({ name, time, state, isNext }: PrayerRowProps) {
  const prayed = state === 'prayed';
  const muted = !prayed && !isNext;
  const label = `${PRAYER_LABELS[name]}, ${formatTime(time)}, ${isNext ? 'next' : state}`;

  return (
    <View accessible accessibilityLabel={label} style={[styles.row, isNext && styles.next]}>
      <StatusMark state={state} isNext={isNext} />
      <Text variant={isNext ? 'bodyStrong' : 'bodyMedium'} color={muted ? 'muted' : 'primary'}>
        {PRAYER_LABELS[name]}
      </Text>
      <View style={styles.spacer} />
      <Text variant={isNext ? 'bodyStrong' : 'body'} color={muted ? 'muted' : 'primary'}>
        {formatTime(time)}
      </Text>
    </View>
  );
}

function StatusMark({ state, isNext }: { state: PrayerState; isNext: boolean }) {
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
  const borderColor = state === 'missed' ? colors.state.missed : colors.line.soft;
  return <View style={[styles.mark, styles.ring, { borderColor }]} />;
}

const styles = StyleSheet.create({
  row: {
    height: sizes.prayerRowHeight,
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
