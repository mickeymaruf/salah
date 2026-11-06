import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';
import type { ViewHandle } from '@/shared/feedback';
import { PRAYER_NAMES, type DayTimes, type PrayerName } from '../calculate';
import type { LogChoice } from '../logChoice';
import type { PrayerState } from '../schedule';
import type { TimelineKind } from '../timeline';
import { DateNavigator } from './DateNavigator';
import { PrayerPill, PILL_HEIGHT } from './PrayerPill';
import { Timeline } from './Timeline';

const PADDING_TOP = 10;
const GAP = 10;
// Figma: the pills start 48 px from the left to leave room for the timeline, and sit 20 px from the right edge.
const PADDING_LEFT = 48;
const PADDING_RIGHT = 20;
const TIMELINE_X = 24;

interface PrayerSheetProps {
  top: number;
  dayKey: string;
  // The long date and the small line under it, for the navigator.
  dateLabel: string;
  dateSub: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onPickDate: () => void;
  times: DayTimes;
  states: Record<PrayerName, PrayerState>;
  kinds: Record<PrayerName, TimelineKind>;
  currentName: PrayerName | null;
  onMark: (name: PrayerName, choice: LogChoice) => void;
  onPrayed: (name: PrayerName, from: ViewHandle | null) => void;
  onEdit: (name: PrayerName) => void;
  // Shown above the list, for example the notice that alarms are off.
  notice?: ReactNode;
}

// The white sheet that holds the date navigator, the timeline and the five prayers. It runs from just under the hero
// to the tab bar with no side or bottom margin. The navigator stays put while the list scrolls.
export function PrayerSheet({
  top,
  dayKey,
  dateLabel,
  dateSub,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onPickDate,
  times,
  states,
  kinds,
  currentName,
  onMark,
  onPrayed,
  onEdit,
  notice,
}: PrayerSheetProps) {
  return (
    <View style={[styles.sheet, { top }]}>
      <View style={styles.navigator}>
        <DateNavigator
          date={dateLabel}
          sub={dateSub}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={onBack}
          onForward={onForward}
          onPickDate={onPickDate}
        />
      </View>
      {notice}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} overScrollMode="never">
        <Timeline kinds={kinds} firstCentre={PADDING_TOP + PILL_HEIGHT / 2} step={PILL_HEIGHT + GAP} centreX={TIMELINE_X} />
        {PRAYER_NAMES.map((name, index) => (
          <PrayerPill
            key={`${dayKey}:${name}`}
            name={name}
            time={times[name]}
            index={index}
            state={states[name]}
            isCurrent={name === currentName}
            onMark={onMark}
            onPrayed={onPrayed}
            onEdit={onEdit}
          />
        ))}
      </ScrollView>
    </View>
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
    overflow: 'hidden',
  },
  // The row is 48 px high, with the 40 px arrows centred in it, 20 px from each side.
  navigator: { marginTop: 14, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  content: { paddingLeft: PADDING_LEFT, paddingRight: PADDING_RIGHT, paddingTop: PADDING_TOP, paddingBottom: 30, gap: GAP },
});
