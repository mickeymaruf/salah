import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';
import { formatMonthYear, formatWeekdayDate, parseDateKey } from '@/shared/lib/date';
import { useReduceMotion } from '@/shared/lib/useReduceMotion';
import { compareMonths, monthGrid, monthOf, shiftMonth, weekdayLetters, type MonthRef } from '../calendar';
import { deviceFirstWeekday } from '../firstWeekday';
import { ArrowButton } from './ArrowButton';
import { useSwipeDown } from './useSwipeDown';

const OPEN_MS = 320;
const CLOSE_MS = 240;
// After a day is tapped the sheet waits a moment, so the selection is seen before it closes.
const PICK_DELAY_MS = 150;
const CELL = 40;
const SHEET_HEIGHT = 470;

interface CalendarSheetProps {
  // The day Today is showing: the sheet opens on its month with it selected.
  shownKey: string;
  todayKey: string;
  // The earliest day that can be picked.
  firstKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

// A month grid in a bottom sheet over Today. Mount it to open. It closes by swiping down, tapping the scrim, the back button, or
// picking a day; `onClose` runs after the exit animation. Days after today cannot be picked.
export function CalendarSheet({ shownKey, todayKey, firstKey, onSelect, onClose }: CalendarSheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [firstWeekday] = useState(deviceFirstWeekday);
  const [month, setMonth] = useState<MonthRef>(() => monthOf(shownKey));
  const [selected, setSelected] = useState(shownKey);

  const [progress] = useState(() => new Animated.Value(0));
  const [drag] = useState(() => new Animated.Value(0));
  const [height, setHeight] = useState(0);
  const started = useRef(false);
  const closing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wait for the first measurement so the slide distance is exact and there is no flash at the final position.
  useEffect(() => {
    if (height === 0 || started.current) return;
    started.current = true;
    Animated.timing(progress, { toValue: 1, duration: OPEN_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [height, progress]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(progress, { toValue: 0, duration: CLOSE_MS, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(onClose);
  }, [progress, onClose]);

  const pick = (key: string) => {
    if (closing.current) return;
    setSelected(key);
    timer.current = setTimeout(() => {
      onSelect(key);
      close();
    }, PICK_DELAY_MS);
  };

  // Dragging the sheet down closes it; a short drag springs back.
  const pan = useSwipeDown(drag, close);

  const today = monthOf(todayKey);
  const earliest = monthOf(firstKey);
  const grid = monthGrid(month.year, month.monthIndex, firstWeekday);
  const letters = weekdayLetters(firstWeekday);

  const slide = reduceMotion ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [height || SHEET_HEIGHT, 0] });
  const pull = drag.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolateLeft: 'clamp' });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
          <Pressable accessibilityLabel="Close calendar" style={styles.scrim} onPress={close} />
        </Animated.View>
        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={{ transform: [{ translateY: slide }], opacity: reduceMotion ? progress : 1 }}
        >
          <Animated.View {...pan.panHandlers} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8, transform: [{ translateY: pull }] }]}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <Text variant="title" accessibilityRole="header">
                {formatMonthYear(month.year, month.monthIndex)}
              </Text>
              <View style={styles.arrows}>
                <ArrowButton
                  label="Previous month"
                  enabled={compareMonths(month, earliest) > 0}
                  onPress={() => setMonth(shiftMonth(month, -1))}
                  Icon={ChevronLeft}
                />
                <ArrowButton
                  label="Next month"
                  enabled={compareMonths(month, today) < 0}
                  onPress={() => setMonth(shiftMonth(month, 1))}
                  Icon={ChevronRight}
                />
              </View>
            </View>
            <View style={styles.week} importantForAccessibility="no-hide-descendants">
              {letters.map((letter, i) => (
                <View key={i} style={styles.column}>
                  <Text variant="label" color="muted" style={styles.letter}>
                    {letter}
                  </Text>
                </View>
              ))}
            </View>
            {grid.map((week, row) => (
              <View key={row} style={styles.week}>
                {week.map((key, col) => (
                  <View key={col} style={styles.column}>
                    {key ? (
                      <DayCell
                        dayKey={key}
                        selected={key === selected}
                        isToday={key === todayKey}
                        enabled={key <= todayKey && key >= firstKey}
                        onPick={pick}
                      />
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
            <Pressable accessibilityRole="button" onPress={() => pick(todayKey)} style={styles.today}>
              <Text variant="label" color="brand">
                Go to today
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface DayCellProps {
  dayKey: string;
  selected: boolean;
  isToday: boolean;
  enabled: boolean;
  onPick: (key: string) => void;
}

function DayCell({ dayKey, selected, isToday, enabled, onPick }: DayCellProps) {
  const date = parseDateKey(dayKey);
  const spoken = `${formatWeekdayDate(date)}${isToday ? ', today' : ''}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityState={{ selected, disabled: !enabled }}
      disabled={!enabled}
      onPress={() => onPick(dayKey)}
      style={[styles.cell, selected && styles.cellSelected, isToday && !selected && styles.cellToday, !enabled && styles.cellFaded]}
    >
      <Text variant={selected ? 'rowStrong' : 'row'} style={selected ? styles.selectedNumber : undefined}>
        {date.getDate()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1, backgroundColor: colors.scrimCalendar },
  sheet: {
    minHeight: SHEET_HEIGHT,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line.soft, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  arrows: { flexDirection: 'row', gap: 8 },
  week: { flexDirection: 'row', marginBottom: 4 },
  column: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: CELL },
  letter: { fontSize: 12 },
  cell: { width: CELL, height: CELL, borderRadius: CELL / 2, alignItems: 'center', justifyContent: 'center' },
  cellSelected: { backgroundColor: colors.brand.green },
  cellToday: { borderWidth: 1.5, borderColor: colors.brand.green },
  cellFaded: { opacity: 0.55 },
  selectedNumber: { color: colors.bg.surface },
  today: {
    minHeight: 52,
    marginTop: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
