import { useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Card, Text } from '@/shared/ui';
import { colors, sizes } from '@/shared/theme';
import { formatShortDate, parseDateKey } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES } from '@/features/prayer-times/calculate';
import { canLog } from '@/features/prayer-times/logChoice';
import { countPrayed, type CellState, type DayCell } from '../model';
import { useHorizontalSwipe } from '../useHorizontalSwipe';

// The round 3D pictures from the Today buttons, shown at 28 px (Figma 18035:2310).
const MARKS = {
  prayed: require('../../../../assets/images/button-prayed.png'),
  missed: require('../../../../assets/images/button-missed.png'),
} as const;
const MARK_SIZE = 28;

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

const SLIDE_DISTANCE = 56;

export function DayDetail({ cell, onSelectPrayer, onPrevious, onNext }: DayDetailProps) {
  const swipe = useHorizontalSwipe(onPrevious, onNext);
  // 0 is at rest. A new day starts at 1 (came from the right) or -1 (came from the left) and slides to 0.
  const [slide] = useState(() => new Animated.Value(0));
  const shownDate = useRef(cell.date);

  useLayoutEffect(() => {
    if (shownDate.current === cell.date) return;
    const direction = cell.date > shownDate.current ? 1 : -1;
    shownDate.current = cell.date;
    slide.setValue(direction);
    Animated.timing(slide, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [cell.date, slide]);

  const translateX = slide.interpolate({ inputRange: [-1, 0, 1], outputRange: [-SLIDE_DISTANCE, 0, SLIDE_DISTANCE] });
  const opacity = slide.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] });
  // The arrows stay put; the date, the summary and the five prayers slide in together.
  const motion = { opacity, transform: [{ translateX }] };

  return (
    <View {...swipe.panHandlers}>
      <Card radius={20} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.title}>
              <ArrowButton direction="previous" onPress={onPrevious} />
              <Animated.View style={motion}>
                <Text variant="dayTitle" style={styles.date} accessibilityRole="header">
                  {formatShortDate(parseDateKey(cell.date))}
                </Text>
              </Animated.View>
              <ArrowButton direction="next" onPress={onNext} />
            </View>
            <Animated.View style={motion}>
              <Text variant="daySummary">
                {summary(cell)}
              </Text>
            </Animated.View>
          </View>
          <Animated.View style={[styles.prayers, motion]}>
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
                  <Text variant="dayPrayer" color={cell.states[index] === 'missed' ? 'missed' : 'muted'}>
                    {PRAYER_LABELS[name]}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>
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
  if (state === 'prayed' || state === 'missed') {
    return <Image source={MARKS[state]} style={styles.mark} accessibilityIgnoresInvertColors />;
  }
  return <View style={[styles.mark, styles.ring]} />;
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingTop: 7, paddingBottom: 13 },
  content: { gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flexDirection: 'row', alignItems: 'center', marginLeft: -12 },
  date: { minWidth: 96, textAlign: 'center' },
  arrow: { width: sizes.iconButton, height: sizes.iconButton, alignItems: 'center', justifyContent: 'center' },
  arrowOff: { opacity: 0.25 },
  prayers: { flexDirection: 'row' },
  prayer: { flex: 1, minHeight: 44, alignItems: 'center', gap: 6 },
  mark: { width: MARK_SIZE, height: MARK_SIZE, borderRadius: MARK_SIZE / 2 },
  ring: { borderWidth: 2, borderColor: colors.line.soft },
});
