import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme';
import { PRAYER_NAMES, type DayTimes, type PrayerName } from '../calculate';
import type { LogChoice } from '../logChoice';
import type { PrayerState } from '../schedule';
import { PrayerPill } from './PrayerPill';

interface PrayerSheetProps {
  top: number;
  times: DayTimes;
  states: Record<PrayerName, PrayerState>;
  currentName: PrayerName;
  onMark: (name: PrayerName, choice: LogChoice) => void;
  onEdit: (name: PrayerName) => void;
  // Shown above the pills, for example the notice that alarms are off.
  notice?: ReactNode;
}

// The white sheet that holds the five prayers. It runs from just under the hero to the tab bar with no side or bottom margin.
export function PrayerSheet({ top, times, states, currentName, onMark, onEdit, notice }: PrayerSheetProps) {
  return (
    <ScrollView
      style={[styles.sheet, { top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
    >
      {notice}
      {PRAYER_NAMES.map((name, index) => (
        <PrayerPill
          key={name}
          name={name}
          time={times[name]}
          index={index}
          state={states[name]}
          isCurrent={name === currentName}
          onMark={(choice) => onMark(name, choice)}
          onEdit={() => onEdit(name)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.ink.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 34, gap: 12 },
});
