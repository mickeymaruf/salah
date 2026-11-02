import { Directory, File, Paths } from 'expo-file-system';
import type { PrayerName } from '@/features/prayer-times/calculate';

// The camera writes to the cache, which the OS may clear. Proofs are copied to the document directory.
// If copying fails the cache uri is kept: the prayer must still be recorded.
export function saveProof(date: string, prayer: PrayerName, cacheUri: string): string {
  try {
    const folder = new Directory(Paths.document, 'proofs');
    folder.create({ idempotent: true, intermediates: true });
    const target = new File(folder, `${date}-${prayer}.jpg`);
    new File(cacheUri).copy(target);
    return target.uri;
  } catch {
    return cacheUri;
  }
}
