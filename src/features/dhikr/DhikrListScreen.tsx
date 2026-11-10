import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Screen, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { addDays, parseDateKey, toDateKey, todayKey } from '@/shared/lib/date';
import { BackButton } from './components/BackButton';
import { Sparkline } from './components/Sparkline';
import { DHIKR } from './config';
import { getDhikrRange } from './data/dhikrLog';
import { countForKey, deedsForDay, lastDays, todayLine, type DhikrRow } from './deeds';
import { useFocusData } from './useFocusData';

const WEEK = 7;
const NONE: DhikrRow[] = [];

export function DhikrListScreen() {
  const today = todayKey();
  const start = toDateKey(addDays(parseDateKey(today), -(WEEK - 1)));
  const rows = useFocusData(() => getDhikrRange(start, today), NONE, `${start}:${today}`);
  const total = deedsForDay(rows, today);

  return (
    <Screen>
      <BackButton />
      <Text variant="pageTitle" accessibilityRole="header" style={styles.title}>
        Dhikr
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${total} deeds today. Open the deeds details`}
        onPress={() => router.push('/dhikr/deeds')}
        style={styles.strip}
      >
        <Text variant="deedsToday" color="brand" style={styles.total}>
          {total}
        </Text>
        <Text variant="logSubtitle" color="muted" style={styles.caption}>
          deeds today
        </Text>
        <Sparkline values={lastDays(rows, today, WEEK)} />
        <View style={styles.chevron}>
          <ChevronRight size={20} color={colors.ink.muted} strokeWidth={1.75} />
        </View>
      </Pressable>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {DHIKR.map((entry, i) => (
          <View key={entry.key}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${entry.name}, ${todayLine(countForKey(rows, entry.key, today))}`}
              onPress={() => router.push({ pathname: '/dhikr/[key]', params: { key: entry.key } })}
              style={styles.row}
            >
              <View style={styles.names}>
                <Text variant="bodyMedium">{entry.name}</Text>
                <Text variant="caption" color="muted">
                  {todayLine(countForKey(rows, entry.key, today))}
                </Text>
              </View>
              <Text variant={entry.key === 'durood' ? 'arabicRowSign' : 'arabicRow'} style={styles.arabic} accessibilityElementsHidden importantForAccessibility="no">
                {entry.arabic}
              </Text>
            </Pressable>
            {i < DHIKR.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 14 },
  strip: { height: 84, marginTop: 2 },
  total: { position: 'absolute', left: 0, top: 0 },
  caption: { position: 'absolute', left: 0, top: 62 },
  chevron: { position: 'absolute', right: 0, top: 32 },
  list: { marginTop: 24 },
  row: { height: 84, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  names: { gap: 2, flexShrink: 1 },
  arabic: { marginLeft: 12 },
  divider: { height: 1, backgroundColor: colors.line.soft },
});
