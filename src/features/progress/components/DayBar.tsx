import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';
import { formatShortDate, parseDateKey } from '@/shared/lib/date';
import { countPrayed, type CellState, type DayCell } from '../model';

export const DAY_WIDTH = 14;
export const DAY_GAP = 3;
export const DAY_STEP = DAY_WIDTH + DAY_GAP;
export const ROW_HEIGHT = 19;
export const ROW_GAP = 3;
const SEGMENT = ROW_HEIGHT / 5;

const SEGMENT_COLORS: Record<CellState, string> = {
  prayed: colors.brand.green,
  missed: colors.state.missed,
  unmarked: colors.heat[0],
  upcoming: colors.heat[0],
  untracked: colors.heat[0],
};

interface DayBarProps {
  cell: DayCell;
  selected: boolean;
  onSelect: (date: string) => void;
}

function DayBarBase({ cell, selected, onSelect }: DayBarProps) {
  const label = `${formatShortDate(parseDateKey(cell.date))}, ${countPrayed(cell)} of 5 prayed`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={{ left: 1, right: 1, top: 1, bottom: 1 }}
      onPress={() => onSelect(cell.date)}
      style={styles.day}
    >
      {cell.states.map((state, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            // Each segment runs 1 px under the next one. Five fractional heights otherwise leave a faint
            // light line between segments on screens where the boundary lands between two pixels.
            { top: index * SEGMENT, height: SEGMENT + 1, backgroundColor: SEGMENT_COLORS[state] },
          ]}
        />
      ))}
      {selected ? <View pointerEvents="none" style={styles.selection} /> : null}
    </Pressable>
  );
}

// Compares the five states, not the cell object, so a change to one day does not re-render the other 364.
export const DayBar = memo(
  DayBarBase,
  (before, after) =>
    before.cell.date === after.cell.date &&
    before.selected === after.selected &&
    before.onSelect === after.onSelect &&
    before.cell.states.every((state, i) => state === after.cell.states[i]),
);

const styles = StyleSheet.create({
  day: { width: DAY_WIDTH, height: ROW_HEIGHT, borderRadius: 3, overflow: 'hidden' },
  segment: { position: 'absolute', left: 0, right: 0 },
  selection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: colors.ink.primary,
    borderRadius: 3,
  },
});
