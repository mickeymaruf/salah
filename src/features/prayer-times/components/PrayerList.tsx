import { StyleSheet, View } from 'react-native';
import { Card } from '@/shared/ui';
import { PRAYER_NAMES, type DayTimes, type PrayerName } from '../calculate';
import type { PrayerState } from '../schedule';
import { PrayerRow } from './PrayerRow';

interface PrayerListProps {
  times: DayTimes;
  states: Record<PrayerName, PrayerState>;
  nextName: PrayerName | null;
  onSelect: (name: PrayerName) => void;
}

export function PrayerList({ times, states, nextName, onSelect }: PrayerListProps) {
  return (
    <Card style={styles.card}>
      <View>
        {PRAYER_NAMES.map((name) => (
          <PrayerRow
            key={name}
            name={name}
            time={times[name]}
            state={states[name]}
            isNext={name === nextName}
            onPress={states[name] === 'unmarked' || states[name] === 'missed' ? () => onSelect(name) : undefined}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 6 },
});
