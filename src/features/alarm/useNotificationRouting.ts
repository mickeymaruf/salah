import { useEffect, useRef } from 'react';
import { router, usePathname } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { proofFlowEnabled } from '@/shared/lib/features';
import { askTargetFromData, type AskTarget } from '@/features/reminder/notificationData';
import { alarmTargetFromData, type AlarmTarget } from './notificationData';

Notifications.setNotificationHandler({
  // Nothing here ever plays a sound: the person may already be praying. In the foreground an ask opens its own
  // screen, so the system banner would double up.
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const opensScreen = askTargetFromData(data) !== null || alarmTargetFromData(data) !== null;
    return {
      shouldShowBanner: !opensScreen,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

function openAsk({ prayer, date, first }: AskTarget): void {
  router.push({ pathname: '/remind', params: { prayer, date, first: first ? '1' : '0' } });
}

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
    const data = response.notification.request.content.data;
    const ask = askTargetFromData(data);
    if (ask) openAsk(ask);
    else {
      const target = alarmTargetFromData(data);
      if (target) openAlarm(target);
    }
  }, [enabled, response, pathname]);

  useEffect(() => {
    if (!enabled) return;
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      const ask = askTargetFromData(data);
      const target = alarmTargetFromData(data);
      const onAlarmFlow = ['/alarm', '/proof', '/remind'].includes(pathnameRef.current);
      if (onAlarmFlow) return;
      if (ask) openAsk(ask);
      else if (target) openAlarm(target);
    });
    return () => sub.remove();
  }, [enabled]);
}
