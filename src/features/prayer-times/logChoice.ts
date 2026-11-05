import { formatDayMonth, formatShortDate, formatTime, parseDateKey } from '@/shared/lib/date';

export type LogChoice = 'prayed' | 'missed';

export type LogStatus = 'prayed' | 'missed' | 'unmarked' | 'upcoming' | 'untracked';
type Status = LogStatus;

// A prayer whose time has not come cannot be logged at all, neither prayed nor missed.
export function canLog(status: Status): boolean {
  return status !== 'upcoming';
}

export function availableChoices(status: Status): LogChoice[] {
  return canLog(status) ? ['prayed', 'missed'] : [];
}

// The sheet opens on what the user chose before, so reopening a missed prayer shows Missed.
// A prayer with no choice yet opens with nothing selected.
export function initialChoice(status: Status): LogChoice | null {
  return status === 'prayed' || status === 'missed' ? status : null;
}

// Only a prayer with a choice can be cleared back to unmarked.
export function canClear(status: Status): boolean {
  return status === 'prayed' || status === 'missed';
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
