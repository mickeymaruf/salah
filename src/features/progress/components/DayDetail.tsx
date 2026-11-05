import { Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Card, Text } from '@/shared/ui';
import { colors, sizes } from '@/shared/theme';
import { formatShortDate, parseDateKey } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES } from '@/features/prayer-times/calculate';
import { canLog } from '@/features/prayer-times/logChoice';
import { countPrayed, type CellState, type DayCell } from '../model';
import { useHorizontalSwipe } from '../useHorizontalSwipe';

function summary(cell: DayCell): string {
  if (cell.states.every((state) => state === 'untracked')) return 'Not tracked';
  if (cell.states.every((state) => state === 'upcoming')) return 'Upcoming';
  return `${countPrayed(cell)} of 5 prayed`;
}

interface DayDetailProps {
  cell: DayCell;
  // Called for prayers that can be edited. Omitted for future days.
  onSelectPrayer?: (index: number) => void;
  // Move to the day before or after. Omitted at the ends of the year.
  onPrevious?: () => void;
  onNext?: () => void;
}

export function DayDetail({ cell, onSelectPrayer, onPrevious, onNext }: DayDetailProps) {
  const swipe = useHorizontalSwipe(onPrevious, onNext);
  return (
    <View {...swipe.panHandlers}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.title}>
            <ArrowButton direction="previous" onPress={onPrevious} />
            <Text variant="rowStrong" style={styles.date} accessibilityRole="header">
              {formatShortDate(parseDateKey(cell.date))}
            </Text>
            <ArrowButton direction="next" onPress={onNext} />
          </View>
          <Text variant="caption" color="muted">
            {summary(cell)}
          </Text>
        </View>
        <View style={styles.prayers}>
          {PRAYER_NAMES.map((name, index) => {
            // A prayer whose time has not come cannot be marked.
            const editable = onSelectPrayer !== undefined && canLog(cell.states[index]);
            return (
              <Pressable
                key={name}
                disabled={!editable}
                accessibilityRole={editable ? 'button' : undefined}
                accessibilityLabel={`${PRAYER_LABELS[name]}, ${cell.states[index]}`}
                accessibilityHint={editable ? 'Opens a sheet to mark it prayed or missed' : undefined}
                onPress={() => onSelectPrayer?.(index)}
                style={styles.prayer}
              >
                <Mark state={cell.states[index]} />
                <Text variant="caption" color="muted" style={styles.name}>
                  {PRAYER_LABELS[name]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

function ArrowButton({ direction, onPress }: { direction: 'previous' | 'next'; onPress?: () => void }) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={direction === 'previous' ? 'Previous day' : 'Next day'}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.arrow, !onPress && styles.arrowOff]}
    >
      <Icon size={20} color={colors.ink.primary} strokeWidth={2} />
    </Pressable>
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
  card: { paddingHorizontal: 17, paddingTop: 7, paddingBottom: 15, gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flexDirection: 'row', alignItems: 'center', marginLeft: -12 },
  date: { minWidth: 96, textAlign: 'center' },
  arrow: { width: sizes.iconButton, height: sizes.iconButton, alignItems: 'center', justifyContent: 'center' },
  arrowOff: { opacity: 0.25 },
  prayers: { flexDirection: 'row' },
  prayer: { flex: 1, alignItems: 'center', gap: 6 },
  mark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.line.soft },
  name: { fontSize: 12 },
});
