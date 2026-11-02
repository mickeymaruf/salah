import { StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import { formatCountdown, formatTime } from '@/shared/lib/date';
import { PRAYER_LABELS } from '../calculate';
import type { NextPrayer } from '../schedule';

interface NextPrayerBlockProps {
  next: NextPrayer;
  countdownMs: number;
}

export function NextPrayerBlock({ next, countdownMs }: NextPrayerBlockProps) {
  const time = formatTime(next.time);
  return (
    <View style={styles.block}>
      <Text variant="overline" color="muted">
        NEXT PRAYER
      </Text>
      <View style={styles.title}>
        <Text variant="display">{PRAYER_LABELS[next.name]}</Text>
        <Text variant="time" color="muted" style={styles.time}>
          {next.isTomorrow ? `Tomorrow ${time}` : time}
        </Text>
      </View>
      <Text variant="bodyMedium" color="brand">
        {formatCountdown(countdownMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 4 },
  title: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  time: { paddingBottom: 10 },
});
