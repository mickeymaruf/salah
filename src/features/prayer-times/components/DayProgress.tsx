import { StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';
import { PRAYER_NAMES, type PrayerName } from '../calculate';
import type { PrayerState } from '../schedule';

interface DayProgressProps {
  states: Record<PrayerName, PrayerState>;
  prayedCount: number;
}

// Prayed is green, missed is red, and anything not due yet stays pale.
const BAR_COLORS = {
  prayed: colors.brand.green,
  missed: colors.state.missed,
  upcoming: colors.heat[0],
} as const;

export function DayProgress({ states, prayedCount }: DayProgressProps) {
  return (
    <View style={styles.block}>
      <View style={styles.bars}>
        {PRAYER_NAMES.map((name) => (
          <View key={name} style={[styles.bar, { backgroundColor: BAR_COLORS[states[name]] }]} />
        ))}
      </View>
      <Text variant="label" color="muted" style={styles.caption}>
        {`${prayedCount} of 5 prayed today`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 6, borderRadius: radii.bar },
  caption: { fontSize: 14 },
});
