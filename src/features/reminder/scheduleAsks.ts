import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays, now, toDateKey } from '@/shared/lib/date';
import type { Profile } from '@/shared/state/profile';
import type { Settings } from '@/shared/state/settings';
import { getDayTimes } from '@/features/prayer-times/calculate';
import { getRange } from '@/features/prayer-times/data/prayerLog';
import { ensureAskChannel, ASK_CHANNEL } from './channels';
import { askKey, planAsks, type PlannedAsk } from './askPlan';
import {
  REMINDER_ANDROID_BUDGET,
  REMINDER_DAYS_AHEAD,
  REMINDER_IOS_BUDGET,
  REMINDER_STOPS_AT_NEXT_PRAYER,
} from './config';
import { loadMemory } from './memoryStorage';

// No sound anywhere: the person may already be praying. Time Sensitive lets the ask through a Focus on iPhone.
function toRequest(ask: PlannedAsk): Notifications.NotificationRequestInput {
  return {
    identifier: ask.id,
    content: {
      title: ask.title,
      body: ask.body,
      sound: false,
      interruptionLevel: 'timeSensitive',
      data: { kind: ask.kind, prayer: ask.prayer, date: ask.date, first: ask.first },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: ask.fireAt,
      channelId: ASK_CHANNEL,
    },
  };
}

// Replaces every pending notification with the current plan of asks. Runs after a mark, an answer, a settings change
// and each time the app opens.
export async function scheduleReminderAsks(profile: Profile, settings: Settings): Promise<void> {
  await ensureAskChannel();
  const from = now();
  const [logged, memory] = await Promise.all([
    getRange(toDateKey(addDays(from, -1)), toDateKey(addDays(from, REMINDER_DAYS_AHEAD))),
    loadMemory(),
  ]);
  const prayed = new Set(logged.filter((entry) => entry.outcome === 'prayed').map((entry) => askKey(entry.date, entry.prayer)));
  const plan = planAsks({
    timesOf: (day) => getDayTimes(profile, day),
    from,
    daysAhead: REMINDER_DAYS_AHEAD,
    prayed,
    anchors: memory.anchors,
    stopsAtNextPrayer: REMINDER_STOPS_AT_NEXT_PRAYER,
    headsUpMinutes: settings.reminderMinutesBefore,
    budget: Platform.OS === 'ios' ? REMINDER_IOS_BUDGET : REMINDER_ANDROID_BUDGET,
  });
  await Promise.all(plan.map((ask) => Notifications.scheduleNotificationAsync(toRequest(ask))));
}
