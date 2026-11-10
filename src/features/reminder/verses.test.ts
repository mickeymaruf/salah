import { pickVerse, VERSE_LABELS } from './verses';
import { VERSES } from './verseData';

describe('verse pool', () => {
  it('holds the five agreed passages, with Arabic and English loaded from the source', () => {
    expect(VERSES.map((v) => v.id)).toEqual(['23:9-11', '2:277', '74:42-43', '107:4-5', '19:59']);
    expect(VERSES.filter((v) => v.kind === 'reward')).toHaveLength(2);
    for (const verse of VERSES) {
      expect(verse.arabic.length).toBeGreaterThan(10);
      expect(verse.translation.length).toBeGreaterThan(10);
      expect(verse.reference).toBe(`Quran ${verse.id} · Sahih International`);
      expect(verse.arabic.startsWith('۞')).toBe(false);
    }
  });

  it('labels the two kinds', () => {
    expect(VERSE_LABELS).toEqual({ reward: 'THE REWARD', warning: 'THE WARNING' });
  });
});

describe('pickVerse', () => {
  it('never returns the previous verse, whatever the random number', () => {
    for (const previous of VERSES.map((v) => v.id)) {
      for (const r of [0, 0.2, 0.5, 0.8, 0.999999]) {
        expect(pickVerse(previous, () => r).id).not.toBe(previous);
      }
    }
  });

  it('shows a different verse on each of several asks in a row', () => {
    let previous: string | null = null;
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 50; i++) {
      const verse = pickVerse(previous, random);
      expect(verse.id).not.toBe(previous);
      previous = verse.id;
    }
  });

  it('can start from nothing and reaches every verse', () => {
    const seen = new Set(VERSES.map((_, i) => pickVerse(null, () => i / VERSES.length).id));
    expect(seen.size).toBe(VERSES.length);
  });
});
