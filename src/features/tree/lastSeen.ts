import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseSnapshot, type TreeSnapshot } from './snapshot';

const STORAGE_KEY = 'salah.tree.lastSeen';

export async function loadSnapshot(): Promise<TreeSnapshot | null> {
  try {
    return parseSnapshot(await AsyncStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export async function saveSnapshot(snapshot: TreeSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // A failed write only means the next open compares against an older tree.
  }
}
