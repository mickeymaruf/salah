import { StyleSheet, View } from 'react-native';
import { Screen, Text, UserButton } from '@/shared/ui';
import { formatLongDate } from '@/shared/lib/date';
import { useProfileStore } from '@/shared/state/profileStore';
import type { Profile } from '@/shared/state/profile';
import { DayProgress } from './components/DayProgress';
import { NextPrayerBlock } from './components/NextPrayerBlock';
import { PrayerList } from './components/PrayerList';
import { useTodayPrayers } from './useTodayPrayers';

export function TodayScreen() {
  const profile = useProfileStore((state) => state.profile);
  return profile ? <Today profile={profile} /> : null;
}

function Today({ profile }: { profile: Profile }) {
  const { at, times, states, next, countdownMs, prayedCount } = useTodayPrayers(profile);

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
      <View style={styles.next}>
        <NextPrayerBlock next={next} countdownMs={countdownMs} />
      </View>
      <View style={styles.progress}>
        <DayProgress states={states} prayedCount={prayedCount} />
      </View>
      <View style={styles.list}>
        <PrayerList times={times} states={states} nextName={next.isTomorrow ? null : next.name} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { flex: 1, gap: 4, paddingVertical: 8 },
  next: { marginTop: 32 },
  progress: { marginTop: 24 },
  list: { marginTop: 28, marginBottom: 24 },
});
