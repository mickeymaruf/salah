import { useEffect, useRef } from 'react';
import { router, usePathname } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { proofFlowEnabled } from '@/shared/lib/features';
import { alarmTargetFromData, type AlarmTarget } from './notificationData';

Notifications.setNotificationHandler({
  // In the foreground an alarm opens its own screen, so the system banner and sound would double up.
  handleNotification: async (notification) => {
    const isAlarm = alarmTargetFromData(notification.request.content.data) !== null;
    return {
      shouldShowBanner: !isAlarm,
      shouldShowList: true,
      shouldPlaySound: !isAlarm,
      shouldSetBadge: false,
    };
  },
});

function openAlarm({ prayer, date }: AlarmTarget): void {
  if (!proofFlowEnabled) return;
  router.push({ pathname: '/alarm', params: { prayer, date } });
}

export function useNotificationRouting(enabled: boolean): void {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const handled = useRef<string | null>(null);
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Covers taps while running and the tap that cold-started the app.
  // On a cold start wait until the index redirect has landed, or the push would race it.
  useEffect(() => {
    if (!enabled || !response || pathname === '/') return;
    const key = `${response.notification.request.identifier}:${response.notification.date}`;
    if (handled.current === key) return;
    handled.current = key;
    const target = alarmTargetFromData(response.notification.request.content.data);
    if (target) openAlarm(target);
  }, [enabled, response, pathname]);

  useEffect(() => {
    if (!enabled) return;
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const target = alarmTargetFromData(notification.request.content.data);
      const onAlarmFlow = pathnameRef.current === '/alarm' || pathnameRef.current === '/proof';
      if (target && !onAlarmFlow) openAlarm(target);
    });
    return () => sub.remove();
  }, [enabled]);
}
