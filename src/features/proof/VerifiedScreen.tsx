import { Image, StyleSheet, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Button, Card, Screen, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { formatTime } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import { useProfileStore } from '@/shared/state/profileStore';
import { isDateKey, isPrayerName } from '@/features/alarm/notificationData';
import { PRAYER_LABELS, type PrayerName } from '@/features/prayer-times/calculate';
import { useDayLog } from '@/features/prayer-times/data/useDayLog';
import { useTodayPrayers } from '@/features/prayer-times/useTodayPrayers';

export function VerifiedScreen() {
  const params = useLocalSearchParams<{ prayer?: string; date?: string; label?: string }>();
  const profile = useProfileStore((state) => state.profile);
  if (!profile || !isPrayerName(params.prayer) || !isDateKey(params.date)) return <Redirect href="/today" />;
  return <Verified profile={profile} prayer={params.prayer} date={params.date} label={params.label} />;
}

interface VerifiedProps {
  profile: Profile;
  prayer: PrayerName;
  date: string;
  label?: string;
}

function Verified({ profile, prayer, date, label }: VerifiedProps) {
  const entry = useDayLog(date).find((item) => item.prayer === prayer);
  const { next } = useTodayPrayers(profile);
  const name = PRAYER_LABELS[prayer];

  return (
    <Screen>
      <View style={styles.body}>
        <View style={styles.fill} />
        <View style={styles.check}>
          <Check size={40} color={colors.brand.onDark} strokeWidth={1.75} />
        </View>
        <Text variant="confirm" style={styles.title}>{`${name} marked\nas prayed`}</Text>
        <Text variant="lead" color="muted" style={styles.silenced}>
          {entry ? `Alarm silenced · ${formatTime(new Date(entry.completedAt))}` : 'Alarm silenced'}
        </Text>
        {entry?.proofUri ? (
          <Card style={styles.proof}>
            <View style={styles.proofRow}>
              <Image source={{ uri: entry.proofUri }} style={styles.photo} accessibilityLabel="Your proof photo" />
              <View style={styles.proofText}>
                <Text variant="rowStrong">{label ?? 'Photo taken just now'}</Text>
                <Text variant="caption" color="muted">
                  Checked on your device
                </Text>
              </View>
              <Check size={22} color={colors.brand.green} strokeWidth={1.75} />
            </View>
          </Card>
        ) : null}
        <Text variant="label" color="brand" style={styles.next}>
          {`Next: ${PRAYER_LABELS[next.name]} at ${formatTime(next.time)}`}
        </Text>
        <View style={styles.fill} />
        <Button label="Done" onPress={() => router.dismissTo('/today')} style={styles.done} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center' },
  fill: { flex: 1 },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 28, textAlign: 'center' },
  silenced: { marginTop: 10 },
  proof: { marginTop: 32, alignSelf: 'stretch', padding: 14 },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photo: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.camera.photoBackground },
  proofText: { flex: 1, gap: 3 },
  next: { marginTop: 16, textAlign: 'center' },
  done: { alignSelf: 'stretch' },
});
