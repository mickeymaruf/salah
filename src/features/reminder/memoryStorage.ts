import AsyncStorage from '@react-native-async-storage/async-storage';
import { now } from '@/shared/lib/date';
import { EMPTY_MEMORY, parseMemory, pruneAnchors, type ReminderMemory } from './memory';

const KEY = 'salah.reminder';

export async function loadMemory(): Promise<ReminderMemory> {
  try {
    return parseMemory(await AsyncStorage.getItem(KEY));
  } catch {
    return EMPTY_MEMORY;
  }
}

// Read, change, write, one at a time, so two answers in a row cannot overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

function update(change: (memory: ReminderMemory) => ReminderMemory): Promise<ReminderMemory> {
  const next = queue.then(async () => {
    const updated = change(await loadMemory());
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...updated, anchors: pruneAnchors(updated.anchors, now()) }));
    return updated;
  });
  queue = next.catch(() => undefined);
  return next;
}

export function recordAnswer(key: string): Promise<ReminderMemory> {
  return update((memory) => ({ ...memory, anchors: { ...memory.anchors, [key]: now().toISOString() } }));
}

export function rememberVerse(id: string): Promise<ReminderMemory> {
  return update((memory) => ({ ...memory, lastVerseId: id }));
}

export function ensureSince(): Promise<ReminderMemory> {
  return update((memory) => (memory.since ? memory : { ...memory, since: now().toISOString() }));
}
