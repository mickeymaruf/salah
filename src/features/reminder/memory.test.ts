import { parseMemory, pruneAnchors } from './memory';
import { askTargetFromData } from './notificationData';

describe('parseMemory', () => {
  it('returns an empty memory for nothing or garbage', () => {
    for (const raw of [null, '', 'nope', '5', 'null']) {
      expect(parseMemory(raw)).toEqual({ anchors: {}, lastVerseId: null, since: null });
    }
  });

  it('keeps valid fields and drops invalid ones', () => {
    const raw = JSON.stringify({ anchors: { a: '2026-11-10T10:00:00.000Z', b: 'bad', c: 4 }, lastVerseId: '2:277', since: 'bad' });
    expect(parseMemory(raw)).toEqual({ anchors: { a: '2026-11-10T10:00:00.000Z' }, lastVerseId: '2:277', since: null });
  });
});

describe('pruneAnchors', () => {
  it('drops answers older than the memory window', () => {
    const anchors = { old: '2026-11-01T10:00:00.000Z', fresh: '2026-11-10T10:00:00.000Z' };
    expect(pruneAnchors(anchors, new Date('2026-11-10T12:00:00.000Z'))).toEqual({ fresh: '2026-11-10T10:00:00.000Z' });
  });
});

describe('askTargetFromData', () => {
  it('reads an ask', () => {
    expect(askTargetFromData({ kind: 'ask', prayer: 'asr', date: '2026-11-10', first: true })).toEqual({ prayer: 'asr', date: '2026-11-10', first: true });
    expect(askTargetFromData({ kind: 'ask', prayer: 'asr', date: '2026-11-10' })?.first).toBe(false);
  });

  it('ignores heads-ups and malformed data', () => {
    expect(askTargetFromData({ kind: 'headsup', prayer: 'asr', date: '2026-11-10' })).toBeNull();
    expect(askTargetFromData({ kind: 'ask', prayer: 'witr', date: '2026-11-10' })).toBeNull();
    expect(askTargetFromData(null)).toBeNull();
  });
});
