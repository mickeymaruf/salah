import { Pressable, StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Card, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatShortDate, parseDateKey } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES } from '@/features/prayer-times/calculate';
import { countPrayed, type CellState, type DayCell } from '../model';

function summary(cell: DayCell): string {
  if (cell.states.every((state) => state === 'untracked')) return 'Not tracked';
  if (cell.states.every((state) => state === 'upcoming')) return 'Upcoming';
  return `${countPrayed(cell)} of 5 prayed`;
}

interface DayDetailProps {
  cell: DayCell;
  // Called for prayers that can be edited. Omitted for future days.
  onSelectPrayer?: (index: number) => void;
}

export function DayDetail({ cell, onSelectPrayer }: DayDetailProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="rowStrong">{formatShortDate(parseDateKey(cell.date))}</Text>
        <Text variant="caption" color="muted">
          {summary(cell)}
        </Text>
      </View>
      <View style={styles.prayers}>
        {PRAYER_NAMES.map((name, index) => (
          <Pressable
            key={name}
            disabled={!onSelectPrayer}
            accessibilityRole={onSelectPrayer ? 'button' : undefined}
            accessibilityLabel={`${PRAYER_LABELS[name]}, ${cell.states[index]}`}
            accessibilityHint={onSelectPrayer ? 'Opens a sheet to mark it prayed or missed' : undefined}
            onPress={() => onSelectPrayer?.(index)}
            style={styles.prayer}
          >
            <Mark state={cell.states[index]} />
            <Text variant="caption" color="muted" style={styles.name}>
              {PRAYER_LABELS[name]}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function Mark({ state }: { state: CellState }) {
  if (state === 'prayed') {
    return (
      <View style={[styles.mark, { backgroundColor: colors.brand.green }]}>
        <Check size={14} color={colors.brand.onDark} strokeWidth={3} />
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
  return <View style={[styles.mark, styles.ring]} />;
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 17, paddingVertical: 15, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prayers: { flexDirection: 'row' },
  prayer: { flex: 1, alignItems: 'center', gap: 6 },
  mark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.line.soft },
  name: { fontSize: 12 },
});
