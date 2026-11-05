import { StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { PRAYER_LABELS, type PrayerName } from '@/features/prayer-times/calculate';
import type { LogChoice } from '@/features/prayer-times/logChoice';

// The centre of the full-colour screen shown for a moment after an answer.
export function ResultContent({ choice, prayer }: { choice: LogChoice; prayer: PrayerName }) {
  const prayed = choice === 'prayed';
  const color = prayed ? colors.brand.green : colors.state.missed;
  const Icon = prayed ? Check : X;
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <Icon size={72} color={color} strokeWidth={1.5} />
      <Text variant="confirm" style={[styles.word, { color }]}>
        {prayed ? 'Prayed' : 'Missed'}
      </Text>
      <Text variant="row" color="muted">
        {PRAYER_LABELS[prayer]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 4 },
  word: { marginTop: 20 },
});
