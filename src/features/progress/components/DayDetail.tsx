import { useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Card, Text } from '@/shared/ui';
import { colors, type TextColor } from '@/shared/theme';
import { formatShortDate, parseDateKey } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES } from '@/features/prayer-times/calculate';
import { canLog } from '@/features/prayer-times/logChoice';
import { countPrayed, type CellState, type DayCell } from '../model';
import { useHorizontalSwipe } from '../useHorizontalSwipe';

function summaryColor(cell: DayCell): TextColor {
  if (cell.states.includes('missed')) return 'missed';
  if (cell.states.every((state) => state === 'prayed')) return 'brand';
  return 'muted';
}

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
              <Text variant="daySummary" color={summaryColor(cell)}>
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
                  <Text variant="statLabel" color={cell.states[index] === 'missed' ? 'missed' : 'muted'}>
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
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={[styles.arrow, !onPress && styles.arrowOff]}
    >
      <Icon size={18} color={colors.ink.primary} strokeWidth={2} />
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
        <X size={12} color={colors.brand.onDark} strokeWidth={3} />
      </View>
    );
  }
  return <View style={[styles.mark, styles.ring]} />;
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 13 },
  content: { gap: 10 },
  header: { height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flexDirection: 'row', alignItems: 'center', marginLeft: -6 },
  date: { minWidth: 84, textAlign: 'center' },
  arrow: { width: 28, height: 20, alignItems: 'center', justifyContent: 'center' },
  arrowOff: { opacity: 0.25 },
  prayers: { flexDirection: 'row' },
  prayer: { flex: 1, minHeight: 44, alignItems: 'center', gap: 6 },
  mark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.line.soft },
});
