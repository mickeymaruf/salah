import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useProfileStore } from '@/shared/state/profileStore';
import { detectLocation } from '@/features/prayer-times/location';

export function useRefreshLocation() {
  const update = useProfileStore((state) => state.update);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (busy) return;
    setBusy(true);
    const result = await detectLocation();
    setBusy(false);

    if (result.kind === 'ok') {
      await update(result.place);
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
