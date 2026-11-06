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
}

export interface WidgetState {
  // "2 of 5": the prayers marked today, prayed or missed.
  counter: string;
  card: WidgetCard;
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

// The front card: the oldest unanswered prayer, else the next upcoming one, else tomorrow's Fajr.
export function buildWidgetState({ at, today, tomorrow, outcomes }: WidgetInput): WidgetState {
  const counter = `${PRAYER_NAMES.filter((name) => outcomes.has(name)).length} of 5`;
  const todayKey = toDateKey(at);

  const [asked] = widgetQueue(today, outcomes, at);
  if (asked) {
    return {
      counter,
      card: {
        mode: 'question',
        prayer: asked,
        dayKey: todayKey,
        lead: 'Did you pray',
        name: `${PRAYER_LABELS[asked]}?`,
        time: formatTime(today[asked]),
        countdown: '',
      },
    };
  }

  const upcoming = PRAYER_NAMES.find((name) => !outcomes.has(name) && today[name].getTime() > at.getTime());
  const next = upcoming ?? 'fajr';
  const time = upcoming ? today[upcoming] : tomorrow.fajr;
  const nextDay = new Date(at.getFullYear(), at.getMonth(), at.getDate() + 1);
  return {
    counter,
    card: {
      mode: 'next',
      prayer: next,
      dayKey: upcoming ? todayKey : toDateKey(nextDay),
      lead: 'Next prayer',
      name: PRAYER_LABELS[next],
      time: formatTime(time),
      countdown: formatCountdown(time.getTime() - at.getTime()),
    },
  };
}

// When the widget must be drawn again without any log change: the next prayer time, or the next minute while a countdown is on show.
export function nextRefreshAt(state: WidgetState, today: DayTimes, tomorrow: DayTimes, at: Date): Date {
  const minute = new Date(at.getTime() + 60_000 - (at.getTime() % 60_000));
  const upcoming = [...PRAYER_NAMES.map((name) => today[name]), tomorrow.fajr].find((time) => time.getTime() > at.getTime());
  if (state.card.mode === 'next') return upcoming && upcoming.getTime() < minute.getTime() ? upcoming : minute;
  return upcoming ?? minute;
}
