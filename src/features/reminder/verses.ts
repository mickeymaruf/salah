import { VERSES, type Verse, type VerseKind } from './verseData';

export type { Verse, VerseKind };

export const VERSE_LABELS: Record<VerseKind, string> = {
  reward: 'THE REWARD',
  warning: 'THE WARNING',
};

// A random verse that is never the one shown last. `random` returns a number in [0, 1).
export function pickVerse(previousId: string | null, random: () => number = Math.random, pool: readonly Verse[] = VERSES): Verse {
  const candidates = pool.filter((verse) => verse.id !== previousId);
  const list = candidates.length > 0 ? candidates : pool;
  const index = Math.min(list.length - 1, Math.floor(random() * list.length));
  return list[index];
}
