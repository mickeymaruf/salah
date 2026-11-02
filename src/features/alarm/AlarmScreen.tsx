import { BackHandler, StyleSheet, View } from 'react-native';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Camera } from 'lucide-react-native';
import { Button, Screen, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatTime, parseDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { useProfileStore } from '@/shared/state/profileStore';
import { useSettingsStore } from '@/shared/state/settingsStore';
import { getDayTimes, PRAYER_LABELS, type PrayerName } from '@/features/prayer-times/calculate';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { usePrayedOn } from '@/features/prayer-times/data/usePrayedOn';
import { PulseRings } from './components/PulseRings';
import { isDateKey, isPrayerName } from './notificationData';
import { useAlarmSound } from './useAlarmSound';

export function AlarmScreen() {
  const params = useLocalSearchParams<{ prayer?: string; date?: string }>();
  const profile = useProfileStore((state) => state.profile);

  if (!profile || !isPrayerName(params.prayer) || !isDateKey(params.date)) return <Redirect href="/today" />;
  return <Alarm profile={profile} prayer={params.prayer} date={params.date} />;
}

interface AlarmProps {
  profile: Profile;
  prayer: PrayerName;
  date: string;
}

function Alarm({ profile, prayer, date }: AlarmProps) {
  const settings = useSettingsStore((state) => state.settings);
  const mark = usePrayerLogStore((state) => state.mark);
  const prayed = usePrayedOn(date);
  const done = prayed.has(prayer);

  useAlarmSound(settings.alarmSound);

  // The alarm must not be dismissable with the back button while proof is required.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  if (done) return <Redirect href="/today" />;

  const time = formatTime(getDayTimes(profile, parseDateKey(date))[prayer]);
  const [clock, meridiem] = time.split(' ');

  const takePhoto = () => router.push({ pathname: '/proof', params: { prayer, date } });
  const markPrayed = async () => {
    await mark(date, prayer, null);
    router.dismissTo('/today');
  };

  return (
    <Screen tone="dark">
      <View style={styles.body}>
        <Text variant="overline" color="onDark" style={styles.overline}>
          TIME TO PRAY
        </Text>
        <Text variant="alarmName" color="onDark" style={styles.name}>
          {PRAYER_LABELS[prayer]}
        </Text>
        <View style={styles.time}>
          <Text variant="clock" color="onDark">
            {clock}
          </Text>
          <Text variant="alarmName" color="onDark" style={styles.meridiem}>
            {meridiem}
          </Text>
        </View>
        <View style={styles.rings}>
          <PulseRings />
        </View>
        <Text variant="prompt" color="onDark" style={styles.prompt}>
          {settings.requireProof ? 'Pray, then show proof\nto silence this alarm.' : 'Pray, then mark it as\nprayed to silence this alarm.'}
        </Text>
        <View style={styles.fill} />
        {settings.requireProof ? (
          <Button
            label="Take photo"
            variant="light"
            onPress={takePhoto}
            icon={<Camera size={22} color={colors.brand.greenDark} strokeWidth={1.75} />}
          />
        ) : (
          <Button label="Mark as prayed" variant="light" onPress={markPrayed} />
        )}
        {settings.requireProof ? (
          <Text variant="caption" color="onDark" style={styles.hint}>
            A prayer mat, a mosque, or your praying space.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center' },
  fill: { flex: 1 },
  overline: { opacity: 0.6, letterSpacing: 1.68, marginTop: 28 },
  name: { marginTop: 8 },
  time: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  meridiem: { fontSize: 22, opacity: 0.6, paddingBottom: 14 },
  rings: { marginTop: 20 },
  prompt: { marginTop: 16, textAlign: 'center' },
  hint: { opacity: 0.55, marginTop: 14, textAlign: 'center' },
});
