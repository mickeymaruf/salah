import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays, now, toDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import type { Settings } from '@/shared/state/settings';
import { getRange } from '@/features/prayer-times/data/prayerLog';
import { alarmChannel, ensureChannels, hasCustomSounds, REMINDER_CHANNEL, soundFile } from './channels';
import { hasNotificationPermission } from './permission';
import { ANDROID_BUDGET, DAYS_AHEAD, IOS_BUDGET, planAlarms, prayedKey, type PlannedAlarm } from './schedule';

function toRequest(alarm: PlannedAlarm, settings: Settings): Notifications.NotificationRequestInput {
  const isReminder = alarm.kind === 'reminder';
  const sound = isReminder || !hasCustomSounds ? 'default' : soundFile(settings.alarmSound);
  return {
    identifier: alarm.id,
    content: {
      title: alarm.title,
      body: alarm.body,
      sound,
      data: { kind: alarm.kind, prayer: alarm.prayer, date: alarm.date },
      ...(Platform.OS === 'android' && !isReminder ? { sticky: true, autoDismiss: false } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: alarm.fireAt,
      channelId: isReminder ? REMINDER_CHANNEL : alarmChannel(settings.alarmSound),
    },
  };
}

async function run(profile: Profile, settings: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await hasNotificationPermission())) return;
  await ensureChannels();

  const from = now();
  const logged = await getRange(toDateKey(from), toDateKey(addDays(from, DAYS_AHEAD)));
  // Only a prayed row silences a prayer's alarms. Marking it missed does not.
  const prayed = new Set(
    logged.filter((entry) => entry.outcome === 'prayed').map((entry) => prayedKey(entry.date, entry.prayer)),
  );
  const plan = planAlarms({
    profile,
    settings,
    from,
    prayed,
    budget: Platform.OS === 'ios' ? IOS_BUDGET : ANDROID_BUDGET,
  });
  await Promise.all(plan.map((alarm) => Notifications.scheduleNotificationAsync(toRequest(alarm, settings))));
}

// Runs are chained so two quick triggers (a completion and a settings change) never interleave
// their cancel-then-schedule steps.
let queue: Promise<void> = Promise.resolve();

export function syncAlarms(profile: Profile, settings: Settings): Promise<void> {
  queue = queue.then(() => run(profile, settings)).catch(() => undefined);
  return queue;
}
