import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from './permission';

export type NotificationStatus = 'unknown' | 'granted' | 'denied';

// Re-checks when the app returns to the foreground, because the user may have changed it in system settings.
export function useNotificationStatus() {
  const [status, setStatus] = useState<NotificationStatus>('unknown');
  const [canAskAgain, setCanAskAgain] = useState(true);

  useEffect(() => {
    const check = () =>
      Notifications.getPermissionsAsync()
        .then((permission) => {
          setStatus(permission.granted ? 'granted' : 'denied');
          setCanAskAgain(permission.canAskAgain);
        })
        .catch(() => undefined);
    check();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => sub.remove();
  }, []);

  // Ask if the system still allows it, otherwise send the user to the system settings.
  const fix = async () => {
    if (canAskAgain) {
      const granted = await requestNotificationPermission();
      setStatus(granted ? 'granted' : 'denied');
    } else {
      await Linking.openSettings();
    }
  };

  return { status, fix };
}
