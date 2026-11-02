import { StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';
import { PRAYER_NAMES, type PrayerName } from '../calculate';
import type { PrayerState } from '../schedule';

interface DayProgressProps {
  states: Record<PrayerName, PrayerState>;
  prayedCount: number;
}

export function DayProgress({ states, prayedCount }: DayProgressProps) {
  return (
    <View style={styles.block}>
      <View style={styles.bars}>
        {PRAYER_NAMES.map((name) => (
          <View
            key={name}
            style={[styles.bar, { backgroundColor: states[name] === 'prayed' ? colors.brand.green : colors.heat[0] }]}
          />
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
