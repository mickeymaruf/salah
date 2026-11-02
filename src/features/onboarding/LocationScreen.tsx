import { useMemo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Button, Screen, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { now, todayKey } from '@/shared/lib/date';
import { DEFAULT_ASR_METHOD, DEFAULT_CALCULATION_METHOD } from '@/shared/state/profile';
import { useProfileStore } from '@/shared/state/profileStore';
import { requestNotificationPermission } from '@/features/alarm/permission';
import { getDayTimes } from '@/features/prayer-times/calculate';
import { formatPlace } from '@/features/prayer-times/location';
import { LocationCard } from './components/LocationCard';
import { StepDots } from './components/StepDots';
import { useLocationStep, type LocationStatus } from './useLocationStep';

const SUBTITLES: Record<LocationStatus, string> = {
  idle: 'Not detected yet',
  detecting: 'Finding your location…',
  ready: 'Detected automatically',
  denied: 'Location permission was denied',
  blocked: 'Location is turned off for Salah',
  error: 'Could not get your location',
};

export function LocationScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const saveProfile = useProfileStore((state) => state.save);
  const { status, place, detect } = useLocationStep();

  const times = useMemo(
    () =>
      place
        ? getDayTimes(
            {
              latitude: place.latitude,
              longitude: place.longitude,
              calculationMethod: DEFAULT_CALCULATION_METHOD,
              asrMethod: DEFAULT_ASR_METHOD,
            },
            now(),
          )
        : null,
    [place],
  );

  const finish = async () => {
    if (!place) return;
    // Denying notifications does not block onboarding; Today explains what is missing.
    await requestNotificationPermission();
    await saveProfile({
      name: name ?? '',
      ...place,
      calculationMethod: DEFAULT_CALCULATION_METHOD,
      asrMethod: DEFAULT_ASR_METHOD,
      startedOn: todayKey(),
    });
    router.replace('/');
  };

  const primary = (() => {
    switch (status) {
      case 'ready':
        return { label: 'Continue', onPress: finish, disabled: false };
      case 'detecting':
        return { label: 'Finding your location…', onPress: detect, disabled: true };
      case 'blocked':
        return { label: 'Open settings', onPress: () => Linking.openSettings(), disabled: false };
      case 'denied':
      case 'error':
        return { label: 'Try again', onPress: detect, disabled: false };
      default:
        return { label: 'Allow location & continue', onPress: detect, disabled: false };
    }
  })();

  return (
    <Screen scroll>
      <StepDots step={2} />
      <View style={styles.header}>
        <Text variant="label" color="brand">
          Prayer times, exact.
        </Text>
        <Text variant="hero">{`Where are\nyou, ${name}?`}</Text>
        <Text variant="lead" color="muted">
          We use your location only to calculate your five daily prayer times.
        </Text>
      </View>
      <View style={styles.card}>
        <LocationCard
          title={place ? formatPlace(place) : 'Your location'}
          subtitle={SUBTITLES[status]}
          times={times}
        />
      </View>
      <View style={styles.note}>
        <Bell size={20} color={colors.ink.muted} strokeWidth={1.5} />
        <Text variant="small" color="muted" style={styles.noteText}>
          An alarm rings at each prayer and stops only when you show proof you prayed.
        </Text>
      </View>
      <Button label={primary.label} onPress={primary.onPress} disabled={primary.disabled} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 32, gap: 12 },
  card: { marginTop: 20 },
  note: { marginTop: 24, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  noteText: { flex: 1 },
  button: { marginTop: 32 },
});
