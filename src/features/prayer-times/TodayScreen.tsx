import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen, Text, UserButton } from '@/shared/ui';
import { formatLongDate } from '@/shared/lib/date';
import { useProfileStore } from '@/shared/state/profileStore';
import type { Profile } from '@/shared/state/profile';
import { AlarmsOffNotice } from '@/features/alarm/components/AlarmsOffNotice';
import { useNotificationStatus } from '@/features/alarm/useNotificationStatus';
import { DayProgress } from './components/DayProgress';
import { LogPrayerSheet } from './components/LogPrayerSheet';
import { NextPrayerBlock } from './components/NextPrayerBlock';
import { PrayerList } from './components/PrayerList';
import type { PrayerName } from './calculate';
import { useSaveChoice } from './data/useSaveChoice';
import { initialChoice, sheetSubtitle } from './logChoice';
import { useTodayPrayers } from './useTodayPrayers';

export function TodayScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Today profile={profile} /> : null;
}

function Today({ profile }: { profile: Profile }) {
  const { at, dayKey, times, states, next, countdownMs, prayedCount } = useTodayPrayers(profile);
  const [logging, setLogging] = useState<PrayerName | null>(null);
  const saveChoice = useSaveChoice();
  const notifications = useNotificationStatus();

  return (
    <Screen scroll bottomInset={false}>
      <View style={styles.top}>
        <View style={styles.greeting}>
          <Text variant="label" color="muted">
            {formatLongDate(at)}
          </Text>
          <Text variant="heading">{`Assalamu alaikum, ${profile.name}`}</Text>
        </View>
        <UserButton />
      </View>
      {notifications.status === 'denied' ? (
        <View style={styles.notice}>
          <AlarmsOffNotice onFix={notifications.fix} />
        </View>
      ) : null}
      <View style={styles.next}>
        <NextPrayerBlock next={next} countdownMs={countdownMs} />
      </View>
      <View style={styles.progress}>
        <DayProgress states={states} prayedCount={prayedCount} />
      </View>
      <View style={styles.list}>
        <PrayerList
          times={times}
          states={states}
          nextName={next.isTomorrow ? null : next.name}
          onSelect={setLogging}
        />
      </View>
      {logging ? (
        <LogPrayerSheet
          key={logging}
          prayer={logging}
          subtitle={sheetSubtitle(times[logging], dayKey, dayKey)}
          status={states[logging]}
          initial={initialChoice(states[logging])}
          onSave={(choice) => saveChoice(dayKey, logging, choice)}
          onClose={() => setLogging(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { flex: 1, gap: 4, paddingVertical: 8 },
  notice: { marginTop: 16 },
  next: { marginTop: 32 },
  progress: { marginTop: 24 },
  list: { marginTop: 28, marginBottom: 24 },
});
