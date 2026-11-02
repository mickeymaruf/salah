import { useRef, useState } from 'react';
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
  };

  return (
    <Card style={styles.card}>
      <View style={styles.chart}>
        <View style={styles.labels}>
          {MONTH_LETTERS.map((letter, month) => (
            <View key={month} style={styles.label}>
              <Text variant="caption" color="muted" style={styles.letter}>
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
        >
          <View style={styles.grid}>
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
      <View style={styles.legend}>
        <LegendItem color={colors.brand.green} label="Prayed" />
        <LegendItem color={colors.state.missed} label="Missed" />
        <LegendItem color={colors.heat[0]} label="Upcoming" />
      </View>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text variant="caption" color="muted" style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 13, paddingTop: 15, paddingBottom: 15 },
  chart: { flexDirection: 'row', gap: LABEL_GAP },
  labels: { width: LABEL_WIDTH, gap: ROW_GAP },
  label: { height: ROW_HEIGHT, justifyContent: 'center' },
  letter: { fontSize: 10, lineHeight: 12 },
  viewport: { flex: 1 },
  grid: { gap: ROW_GAP },
  monthRow: { flexDirection: 'row', gap: DAY_STEP - DAY_WIDTH },
  scrollbar: { marginTop: 25, paddingLeft: LABEL_WIDTH + LABEL_GAP },
  track: { height: TRACK_HEIGHT, borderRadius: 2, backgroundColor: colors.heat[0], overflow: 'hidden' },
  thumb: { height: TRACK_HEIGHT, borderRadius: 2, backgroundColor: colors.ink.muted },
  legend: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11 },
});
