import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { Card, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import type { YearGrid as YearGridData } from '../model';
import { DayBar, DAY_GAP, DAY_STEP, DAY_WIDTH, ROW_GAP, ROW_HEIGHT } from './DayBar';

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const LABEL_WIDTH = 12;
const LABEL_GAP = 6;
const GRID_WIDTH = 31 * DAY_STEP - (DAY_STEP - DAY_WIDTH);
const TRACK_HEIGHT = 4;
const NUMBER_HEIGHT = 12;
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface YearGridProps {
  grid: YearGridData;
  selectedDate: string;
  // 1-based day of the month to bring into view on the right edge.
  focusDay: number;
  onSelect: (date: string) => void;
}

export function YearGrid({ grid, selectedDate, focusDay, onSelect }: YearGridProps) {
  const [viewport, setViewport] = useState(0);
  const [scrollX] = useState(() => new Animated.Value(0));
  const scroller = useRef<ScrollViewInstance>(null);
  // Where the user last left the chart, read when a day is picked by the arrows.
  const settledAt = useRef(0);
  // Placement needs both the viewport width and the content size, which arrive in either order.
  const measured = useRef({ viewport: 0, content: false, placed: false });

  const maxScroll = Math.max(0, GRID_WIDTH - viewport);
  const thumbWidth = viewport > 0 ? Math.max(40, (viewport / GRID_WIDTH) * viewport) : 0;
  const thumbTravel = Math.max(0, viewport - thumbWidth);
  const thumbX = scrollX.interpolate({
    inputRange: [0, Math.max(1, maxScroll)],
    outputRange: [0, thumbTravel],
    extrapolate: 'clamp',
  });

  // Opens on the latest days: today's column sits on the right edge of the viewport.
  const placeOnce = () => {
    const state = measured.current;
    if (state.placed || !state.content || state.viewport === 0) return;
    state.placed = true;
    const max = Math.max(0, GRID_WIDTH - state.viewport);
    const offset = Math.min(max, Math.max(0, focusDay * DAY_STEP - DAY_GAP - state.viewport));
    scroller.current?.scrollTo({ x: offset, animated: false });
    scrollX.setValue(offset);
    settledAt.current = offset;
  };

  // Stepping through days with the arrows or a swipe can pick a day that is scrolled out of sight: bring it back in.
  const selectedDay = Number(selectedDate.slice(-2));
  useEffect(() => {
    if (viewport === 0) return;
    const left = (selectedDay - 1) * DAY_STEP;
    const right = left + DAY_WIDTH;
    let target: number | null = null;
    if (left < settledAt.current) target = left - DAY_STEP;
    else if (right > settledAt.current + viewport) target = right + DAY_STEP - viewport;
    if (target === null) return;
    const clamped = Math.min(Math.max(0, GRID_WIDTH - viewport), Math.max(0, target));
    settledAt.current = clamped;
    scroller.current?.scrollTo({ x: clamped, animated: true });
  }, [selectedDay, viewport]);

  return (
    <Card style={styles.card}>
      <View style={styles.chart}>
        <View style={styles.labels}>
          <View style={styles.numberSpacer} />
          {MONTH_LETTERS.map((letter, month) => (
            <View key={month} style={styles.label}>
              <Text variant="monthLetter" color="muted">
                {letter}
              </Text>
            </View>
          ))}
        </View>
        <Animated.ScrollView
          ref={scroller}
          horizontal
          style={styles.viewport}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            measured.current.viewport = width;
            setViewport(width);
            placeOnce();
          }}
          onContentSizeChange={() => {
            measured.current.content = true;
            placeOnce();
          }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          onScrollEndDrag={(event) => {
            settledAt.current = event.nativeEvent.contentOffset.x;
          }}
          onMomentumScrollEnd={(event) => {
            settledAt.current = event.nativeEvent.contentOffset.x;
          }}
        >
          <View style={styles.grid}>
            <View style={styles.numbers} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              {DAYS.map((day) => (
                <Text
                  key={day}
                  variant="tab"
                  color={day === selectedDay ? 'primary' : 'muted'}
                  allowFontScaling={false}
                  style={styles.number}
                >
                  {String(day)}
                </Text>
              ))}
            </View>
            {grid.map((month, monthIndex) => (
              <View key={monthIndex} style={styles.monthRow}>
                {month.map((cell) => (
                  <DayBar key={cell.date} cell={cell} selected={cell.date === selectedDate} onSelect={onSelect} />
                ))}
              </View>
            ))}
          </View>
        </Animated.ScrollView>
      </View>
      <View style={styles.scrollbar}>
        <View style={styles.track}>
          <Animated.View style={[styles.thumb, { width: thumbWidth, transform: [{ translateX: thumbX }] }]} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 13, paddingTop: 15, paddingBottom: 13 },
  chart: { flexDirection: 'row', gap: LABEL_GAP },
  labels: { width: LABEL_WIDTH, gap: ROW_GAP },
  label: { height: ROW_HEIGHT, justifyContent: 'center' },
  viewport: { flex: 1 },
  grid: { gap: ROW_GAP },
  numbers: { height: NUMBER_HEIGHT, flexDirection: 'row', gap: DAY_STEP - DAY_WIDTH },
  number: { width: DAY_WIDTH, fontSize: 9, lineHeight: NUMBER_HEIGHT, textAlign: 'center' },
  numberSpacer: { height: NUMBER_HEIGHT },
  monthRow: { flexDirection: 'row', gap: DAY_STEP - DAY_WIDTH },
  scrollbar: { marginTop: 10, paddingLeft: LABEL_WIDTH + LABEL_GAP },
  track: { height: TRACK_HEIGHT, borderRadius: 2, backgroundColor: colors.line.soft, overflow: 'hidden' },
  thumb: { height: TRACK_HEIGHT, borderRadius: 2, backgroundColor: colors.ink.muted },
});
