import { applyOverrides, overrideKey } from './optimistic';
import type { PrayerLogEntry } from './prayerLog';

const entry = (date: string, prayer: PrayerLogEntry['prayer'], proofUri: string | null = null): PrayerLogEntry => ({
  date,
  prayer,
  outcome: 'prayed',
  completedAt: '2026-10-26T01:00:00.000Z',
  proofUri,
});

const all = () => true;

describe('applyOverrides', () => {
  it('adds a pending prayed entry', () => {
    const pending = entry('2026-10-26', 'fajr');
    const result = applyOverrides([], { [overrideKey('2026-10-26', 'fajr')]: pending }, all);
    expect(result).toEqual([pending]);
  });

  it('removes an entry with a pending null', () => {
    const stored = [entry('2026-10-26', 'fajr'), entry('2026-10-26', 'dhuhr')];
    const result = applyOverrides(stored, { [overrideKey('2026-10-26', 'fajr')]: null }, all);
    expect(result.map((e) => e.prayer)).toEqual(['dhuhr']);
  });

  it('replaces a stored entry and keeps results ordered by date', () => {
    const stored = [entry('2026-10-27', 'fajr'), entry('2026-10-25', 'asr')];
    const pending = entry('2026-10-25', 'asr', 'file:///p.jpg');
    const result = applyOverrides(stored, { [overrideKey('2026-10-25', 'asr')]: pending }, all);
    expect(result.map((e) => e.date)).toEqual(['2026-10-25', '2026-10-27']);
    expect(result[0].proofUri).toBe('file:///p.jpg');
  });

  it('ignores overrides outside the queried range', () => {
    const outside = entry('2025-01-01', 'fajr');
    const result = applyOverrides([], { [overrideKey('2025-01-01', 'fajr')]: outside }, (date) =>
      date.startsWith('2026'),
    );
    expect(result).toEqual([]);
  });
});
