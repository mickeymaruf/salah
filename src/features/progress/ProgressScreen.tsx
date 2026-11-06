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
import { StatPills } from './components/StatPills';
import { YearGrid } from './components/YearGrid';
import { adjacentDate } from './model';
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

  const previousDate = adjacentDate(grid, selected.date, -1);
  const nextDate = adjacentDate(grid, selected.date, 1);

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
        <StatPills stats={stats} />
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
          onPrevious={previousDate ? () => setPicked(previousDate) : undefined}
          onNext={nextDate ? () => setPicked(nextDate) : undefined}
        />
      </View>
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
          onClear={() => saveChoice(selected.date, PRAYER_NAMES[logging], 'clear')}
          onClose={() => setLogging(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flex: 1, gap: 2, paddingVertical: 8 },
  summary: { marginTop: 14 },
  chart: { marginTop: 12 },
  detail: { marginTop: 12 },
});
