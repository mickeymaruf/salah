import { REMINDER_MEMORY_DAYS } from './config';

export interface ReminderMemory {
  // askKey -> ISO time of the last "Not yet" or close.
  anchors: Record<string, string>;
  lastVerseId: string | null;
  // The first time the reminders ran. Prayers before it are never logged as missed.
  since: string | null;
}

export const EMPTY_MEMORY: ReminderMemory = { anchors: {}, lastVerseId: null, since: null };

export function parseMemory(raw: string | null): ReminderMemory {
  if (!raw) return EMPTY_MEMORY;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return EMPTY_MEMORY;
    const m = value as Record<string, unknown>;
    const anchors: Record<string, string> = {};
    if (typeof m.anchors === 'object' && m.anchors !== null) {
      for (const [key, at] of Object.entries(m.anchors)) {
        if (typeof at === 'string' && !Number.isNaN(Date.parse(at))) anchors[key] = at;
      }
    }
    return {
      anchors,
      lastVerseId: typeof m.lastVerseId === 'string' ? m.lastVerseId : null,
      since: typeof m.since === 'string' && !Number.isNaN(Date.parse(m.since)) ? m.since : null,
    };
  } catch {
    return EMPTY_MEMORY;
  }
}

// Drops answers old enough that their window is long over.
export function pruneAnchors(anchors: Record<string, string>, at: Date): Record<string, string> {
  const limit = at.getTime() - REMINDER_MEMORY_DAYS * 24 * 60 * 60_000;
  return Object.fromEntries(Object.entries(anchors).filter(([, time]) => Date.parse(time) >= limit));
}
