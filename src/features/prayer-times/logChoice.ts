import { formatDayMonth, formatShortDate, formatTime, parseDateKey } from '@/shared/lib/date';

export type LogChoice = 'prayed' | 'missed';

type Status = 'prayed' | 'missed' | 'upcoming' | 'untracked';

// A prayer whose time has not come cannot be missed yet. Everything else can be logged either way.
export function availableChoices(status: Status): LogChoice[] {
  return status === 'upcoming' ? ['prayed'] : ['prayed', 'missed'];
}

// Logging a forgotten prayer is the common case, so Prayed is preselected. Only an existing miss
// preselects Missed, which makes Save a no-op until the user changes it.
export function initialChoice(status: Status, preferCurrent: boolean): LogChoice {
  return preferCurrent && status === 'missed' ? 'missed' : 'prayed';
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
