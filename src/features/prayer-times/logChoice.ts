import { formatDayMonth, formatShortDate, formatTime, parseDateKey } from '@/shared/lib/date';

export type LogChoice = 'prayed' | 'missed';

type Status = 'prayed' | 'missed' | 'upcoming' | 'untracked';

// A prayer whose time has not come cannot be missed yet. Everything else can be logged either way.
export function availableChoices(status: Status): LogChoice[] {
  return status === 'upcoming' ? ['prayed'] : ['prayed', 'missed'];
}

// The sheet opens on what the prayer currently is, so reopening a missed prayer shows Missed.
// A prayer that has not started yet can only be Prayed.
export function initialChoice(status: Status): LogChoice {
  return status === 'missed' ? 'missed' : 'prayed';
}

export function sheetSubtitle(time: Date, dateKey: string, todayKey: string): string {
  const day = parseDateKey(dateKey);
  const label = dateKey === todayKey ? `Today, ${formatDayMonth(day)}` : formatShortDate(day);
  return `${formatTime(time)} · ${label}`;
}

// Only today and past days can be edited.
export function isEditableDay(dateKey: string, todayKey: string): boolean {
  return dateKey <= todayKey;
}
