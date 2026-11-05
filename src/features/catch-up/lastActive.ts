import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'salah.lastActive';

// Stored text is untrusted: anything that is not a valid date counts as "no earlier use".
export function parseLastActive(raw: string | null): Date | null {
  if (!raw) return null;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? new Date(time) : null;
}

export async function loadLastActive(): Promise<Date | null> {
  try {
    return parseLastActive(await AsyncStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export async function saveLastActive(at: Date): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, at.toISOString());
  } catch {
    // A missed write only means the next open may not prompt. Nothing to recover.
  }
}
