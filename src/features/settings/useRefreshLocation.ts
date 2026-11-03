import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useProfileStore } from '@/shared/state/profileStore';
import { detectLocation } from '@/features/prayer-times/location';
import { hasManualTimes, placeChanged } from '@/features/prayer-times/manualTimes';

export function useRefreshLocation() {
  const profile = useProfileStore((state) => state.profile);
  const update = useProfileStore((state) => state.update);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (busy) return;
    setBusy(true);
    const result = await detectLocation();
    setBusy(false);

    if (result.kind === 'ok') {
      const { place } = result;
      if (profile && hasManualTimes(profile.manualTimes) && placeChanged(profile, place)) {
        // Hand-set times belong to the old place. Resetting is the default and the last (confirm) button.
        Alert.alert(
          'Location changed',
          `Keep the prayer times you edited, or use the automatic times for ${place.city}?`,
          [
            { text: 'Keep my times', onPress: () => update(place) },
            { text: 'Reset to automatic', onPress: () => update({ ...place, manualTimes: undefined }) },
          ],
          { cancelable: false },
        );
        return;
      }
      await update(place);
    } else if (result.kind === 'denied' && !result.canAskAgain) {
      Alert.alert('Location is off', 'Allow location for Salah in your phone settings to update your prayer times.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings() },
      ]);
    } else {
      Alert.alert('Could not update location', 'Check that location is on and try again.');
    }
  };

  return { refresh, busy };
}
