import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Text, UserButton } from '@/shared/ui';
import { parseDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { useProfileStore } from '@/shared/state/profileStore';
import { LogPrayerSheet } from '@/features/prayer-times/components/LogPrayerSheet';
import { PRAYER_NAMES, getDayTimes } from '@/features/prayer-times/calculate';
import { useSaveChoice } from '@/features/prayer-times/data/useSaveChoice';
import { initialChoice, isEditableDay, sheetSubtitle } from '@/features/prayer-times/logChoice';
import { DayDetail } from './components/DayDetail';
import { StatCard } from './components/StatCard';
import { YearGrid } from './components/YearGrid';
import { formatStreak } from './stats';
import { useYearProgress } from './useYearProgress';

export function ProgressScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Progress profile={profile} /> : null;
}

function Progress({ profile }: { profile: Profile }) {
  const { year, dayKey, grid, stats } = useYearProgress(profile);
  const [picked, setPicked] = useState<string | null>(null);
  const [logging, setLogging] = useState<number | null>(null);
  const saveChoice = useSaveChoice();

  // Until the user taps a day, the detail card follows today (which changes at midnight).
  const selectedDate = picked ?? dayKey;
  const selected = grid.flat().find((cell) => cell.date === selectedDate) ?? grid.flat()[0];

  return (
    <Screen scroll bottomInset={false}>
      <View style={styles.top}>
        <View style={styles.heading}>
          <Text variant="label" color="muted">
            Your year
          </Text>
          <Text variant="heading">{String(year)}</Text>
        </View>
        <UserButton />
      </View>
      <View style={styles.summary}>
        <Text variant="stat">{stats.percentKept === null ? '—' : `${stats.percentKept}%`}</Text>
        <Text variant="label" color="muted" style={styles.summaryLabel}>
          {stats.percentKept === null ? 'Pray today to start your year' : 'of prayers kept'}
        </Text>
      </View>
      <View style={styles.stats}>
        <StatCard label="Prayed" value={String(stats.prayed)} />
        <StatCard label="Missed" value={String(stats.missed)} />
        <StatCard label="Best streak" value={formatStreak(stats.bestStreak)} />
      </View>
      <View style={styles.chart}>
        <YearGrid
          grid={grid}
          selectedDate={selectedDate}
          focusDay={parseDateKey(dayKey).getDate()}
          onSelect={setPicked}
        />
      </View>
      <View style={styles.detail}>
        <DayDetail
          cell={selected}
          onSelectPrayer={isEditableDay(selected.date, dayKey) ? setLogging : undefined}
        />
      </View>
      <Text variant="caption" color="muted" style={styles.hint}>
        Tap a prayer to mark it done or missed
      </Text>
      {logging !== null ? (
        <LogPrayerSheet
          key={`${selected.date}-${logging}`}
          prayer={PRAYER_NAMES[logging]}
          subtitle={sheetSubtitle(
            getDayTimes(profile, parseDateKey(selected.date))[PRAYER_NAMES[logging]],
            selected.date,
            dayKey,
          )}
          status={selected.states[logging]}
          initial={initialChoice(selected.states[logging])}
          onSave={(choice) => saveChoice(selected.date, PRAYER_NAMES[logging], choice)}
          onClose={() => setLogging(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flex: 1, gap: 4, paddingVertical: 8 },
  summary: { marginTop: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  summaryLabel: { paddingBottom: 8 },
  stats: { marginTop: 16, flexDirection: 'row', gap: 10 },
  chart: { marginTop: 14 },
  detail: { marginTop: 12 },
  hint: { marginTop: 8, paddingHorizontal: 14 },
});
