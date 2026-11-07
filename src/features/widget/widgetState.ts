import { formatCountdown, formatTime, toDateKey } from '@/shared/lib/date';
import { PRAYER_LABELS, PRAYER_NAMES, type DayTimes, type PrayerName } from '@/features/prayer-times/calculate';
import type { Outcome } from '@/features/prayer-times/data/prayerLog';

// What the front card shows. "question" is an unmarked prayer whose time has passed; "next" is the upcoming prayer.
export type WidgetCardMode = 'question' | 'next';

export interface WidgetCard {
  mode: WidgetCardMode;
  prayer: PrayerName;
  // The local date the prayer belongs to. It is tomorrow when the front card is tomorrow's Fajr. Tapping Missed or Prayed logs against it.
  dayKey: string;
  lead: string;
  // "Fajr?" in the question state, "Fajr" in the next state.
  name: string;
  // The prayer time, for example "4:48 AM".
  time: string;
  // "in 1h 12m" in the next state, empty in the question state.
  countdown: string;
  // The ids of the Missed and Prayed buttons (see `answerTarget`). Null in the next state, which has no buttons.
  targets: { missed: string; prayed: string } | null;
}

export interface WidgetState {
  // Every question still waiting, oldest first. The widget shows the first one, and a tap on Missed or Prayed drops it inside the widget at once, so the next one is
  // already there and the answer never waits for the app.
  queue: WidgetCard[];
  // What the front card shows when the queue is empty: the next prayer, or tomorrow's Fajr.
  next: WidgetCard;
}

interface WidgetInput {
  at: Date;
  today: DayTimes;
  tomorrow: DayTimes;
  // What the log holds for today, by prayer.
  outcomes: ReadonlyMap<PrayerName, Outcome>;
}

// Today's prayers whose time has passed and that are not marked yet, oldest first.
export function widgetQueue(today: DayTimes, outcomes: ReadonlyMap<PrayerName, Outcome>, at: Date): PrayerName[] {
  return PRAYER_NAMES.filter((name) => !outcomes.has(name) && today[name].getTime() <= at.getTime());
}

// The queue of questions plus the card to show once it is empty.
export function buildWidgetState({ at, today, tomorrow, outcomes }: WidgetInput): WidgetState {
  const todayKey = toDateKey(at);
  const queue = widgetQueue(today, outcomes, at).map(
    (prayer): WidgetCard => ({
      mode: 'question',
      prayer,
      dayKey: todayKey,
      lead: 'Did you pray',
      name: `${PRAYER_LABELS[prayer]}?`,
      time: formatTime(today[prayer]),
      countdown: '',
      targets: { missed: answerTarget('missed', todayKey, prayer), prayed: answerTarget('prayed', todayKey, prayer) },
    }),
  );

  const upcoming = PRAYER_NAMES.find((name) => !outcomes.has(name) && today[name].getTime() > at.getTime());
  const next = upcoming ?? 'fajr';
  const time = upcoming ? today[upcoming] : tomorrow.fajr;
  const nextDay = new Date(at.getFullYear(), at.getMonth(), at.getDate() + 1);
  return {
    queue,
    next: {
      mode: 'next',
      prayer: next,
      dayKey: upcoming ? todayKey : toDateKey(nextDay),
      lead: 'Next prayer',
      name: PRAYER_LABELS[next],
      time: formatTime(time),
      countdown: formatCountdown(time.getTime() - at.getTime()),
      targets: null,
    },
  };
}

// The id a tap on Missed or Prayed carries, so the app logs exactly the prayer the widget showed even if two taps come close together.
export function answerTarget(choice: 'missed' | 'prayed', dayKey: string, prayer: PrayerName): string {
  return `${choice}:${dayKey}:${prayer}`;
}

export interface WidgetAnswer {
  choice: 'missed' | 'prayed';
  dayKey: string;
  prayer: PrayerName;
}

export function parseAnswerTarget(target: string): WidgetAnswer | null {
  const [choice, dayKey, prayer] = target.split(':');
  if (choice !== 'missed' && choice !== 'prayed') return null;
  if (!dayKey || !PRAYER_NAMES.some((name) => name === prayer)) return null;
  return { choice, dayKey, prayer: prayer as PrayerName };
}

// When the widget must be drawn again without any log change: the next prayer time, or the next minute while a countdown is on show.
export function nextRefreshAt(state: WidgetState, today: DayTimes, tomorrow: DayTimes, at: Date): Date {
  const minute = new Date(at.getTime() + 60_000 - (at.getTime() % 60_000));
  const upcoming = [...PRAYER_NAMES.map((name) => today[name]), tomorrow.fajr].find((time) => time.getTime() > at.getTime());
  if (state.queue.length === 0) return upcoming && upcoming.getTime() < minute.getTime() ? upcoming : minute;
  return upcoming ?? minute;
}
