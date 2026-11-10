import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Screen, Text } from '@/shared/ui';
import { colors, spacing } from '@/shared/theme';
import { addDays, daysInMonth, formatMonthYear, formatWeekday, parseDateKey, toDateKey, todayKey } from '@/shared/lib/date';
import { BackButton } from './components/BackButton';
import { CHART_HEIGHT, MonthChart } from './components/MonthChart';
import { formatThousands } from './chart';
import { getDhikrRange, getDhikrTotals } from './data/dhikrLog';
import { allTimeDeeds, deedsForDay, deedsForMonth, sum, type DhikrRow, type DhikrTotal } from './deeds';
import { useFocusData } from './useFocusData';

const RECENT_DAYS = 4;
const NONE_ROWS: DhikrRow[] = [];
const NONE_TOTALS: DhikrTotal[] = [];

function monthKeys(year: number, monthIndex: number): { start: string; end: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  return { start: `${year}-${pad(monthIndex + 1)}-01`, end: `${year}-${pad(monthIndex + 1)}-${pad(daysInMonth(year, monthIndex))}` };
}

// The month before or after: a year and a zero-based month.
function shiftMonth(year: number, monthIndex: number, by: number): { year: number; monthIndex: number } {
  const date = new Date(year, monthIndex + by, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function DeedsScreen() {
  const today = todayKey();
  const todayDate = parseDateKey(today);
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();
  const [shown, setShown] = useState({ year: currentYear, monthIndex: currentMonth });
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing.screenX * 2;
  const onCurrentMonth = shown.year === currentYear && shown.monthIndex === currentMonth;

  const currentKeys = monthKeys(currentYear, currentMonth);
  const shownKeys = monthKeys(shown.year, shown.monthIndex);
  const recentStart = toDateKey(addDays(todayDate, -(RECENT_DAYS - 1)));

  const totals = useFocusData(getDhikrTotals, NONE_TOTALS, 'totals');
  const currentMonthRows = useFocusData(() => getDhikrRange(currentKeys.start, currentKeys.end), NONE_ROWS, currentKeys.start);
  const shownRows = useFocusData(() => getDhikrRange(shownKeys.start, shownKeys.end), NONE_ROWS, shownKeys.start);
  const recentRows = useFocusData(() => getDhikrRange(recentStart, today), NONE_ROWS, `${recentStart}:${today}`);

  const monthDeeds = deedsForMonth(shownRows, shown.year, shown.monthIndex);
  const todayIndex = onCurrentMonth ? todayDate.getDate() - 1 : null;
  // Days still to come are left empty.
  const values = monthDeeds.map((value, i) => (onCurrentMonth && i > (todayIndex ?? 0) ? null : value));
  const thisMonth = sum(deedsForMonth(currentMonthRows, currentYear, currentMonth));
  const recent = Array.from({ length: RECENT_DAYS }, (_, i) => {
    const day = toDateKey(addDays(todayDate, -i));
    return { day, label: i === 0 ? 'Today' : formatWeekday(parseDateKey(day)), deeds: deedsForDay(recentRows, day) };
  });

  const title = formatMonthYear(shown.year, shown.monthIndex);

  return (
    <Screen scroll>
      <BackButton />
      <Text variant="pageTitle" accessibilityRole="header" style={styles.title}>
        Deeds
      </Text>
      <Text variant="eyebrow" color="muted" style={styles.eyebrow}>
        ALL TIME
      </Text>
      <Text variant="deedsAllTime" color="brand" style={styles.allTime}>
        {formatThousands(allTimeDeeds(totals))}
      </Text>
      <Text variant="pillTime" color="muted" style={styles.collected}>
        deeds collected
      </Text>
      <Text variant="label" color="brand" style={styles.thisMonth}>
        +{formatThousands(thisMonth)} this month
      </Text>

      <View style={styles.switcher}>
        <Text variant="label" accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.arrows}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => setShown((s) => shiftMonth(s.year, s.monthIndex, -1))}
            style={styles.arrow}
          >
            <ChevronLeft size={20} color={colors.ink.primary} strokeWidth={1.75} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            accessibilityState={{ disabled: onCurrentMonth }}
            disabled={onCurrentMonth}
            onPress={() => setShown((s) => shiftMonth(s.year, s.monthIndex, 1))}
            style={[styles.arrow, onCurrentMonth && styles.disabled]}
          >
            <ChevronRight size={20} color={colors.ink.primary} strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>

      <View style={styles.chart} accessible accessibilityLabel={`${title}: ${formatThousands(sum(monthDeeds))} deeds`}>
        <MonthChart width={chartWidth} values={values} todayIndex={todayIndex} />
      </View>

      <ScrollView scrollEnabled={false} style={styles.days}>
        {recent.map((item, i) => (
          <View key={item.day}>
            <View style={styles.dayRow}>
              <Text variant="row">{item.label}</Text>
              <Text variant="bodyStrong">{formatThousands(item.deeds)}</Text>
            </View>
            {i < recent.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 14 },
  eyebrow: { marginTop: 24 },
  allTime: { marginTop: 3 },
  collected: { marginTop: 0 },
  thisMonth: { marginTop: 9 },
  switcher: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  // Two 44 px touch areas side by side, so the icons sit 44 px apart where Figma has 28 px. The right one reaches 12 px past the margin.
  arrows: { flexDirection: 'row', marginRight: -12 },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.25 },
  chart: { height: CHART_HEIGHT, marginTop: -4 },
  days: { flexGrow: 0 },
  dayRow: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: colors.line.soft },
});
