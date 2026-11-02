import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui';
import { getDb } from '@/shared/db/database';
import { now } from '@/shared/lib/date';
import { usePrayerLogStore } from '@/features/prayer-times/data/prayerLogStore';
import { buildSeedRows } from './seed';

// A non-null proof makes the sample prayers show a filled (photo-verified) check.
const SAMPLE_PROOF = 'seed://sample';

async function seed(): Promise<void> {
  const db = await getDb();
  const rows = buildSeedRows(now().getFullYear(), now());
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const { date, prayer } of rows) {
      await txn.runAsync(
        'INSERT OR IGNORE INTO prayer_log (date, prayer, completed_at, proof_uri) VALUES (?, ?, ?, ?)',
        [date, prayer, `${date}T12:00:00.000Z`, SAMPLE_PROOF],
      );
    }
  });
}

async function clear(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM prayer_log');
}

// Development only. Lets the year chart be previewed without a year of use.
export function DevTools() {
  const invalidate = usePrayerLogStore((state) => state.invalidate);
  const run = (action: () => Promise<void>) => () => action().then(invalidate);

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={run(seed)} style={styles.button}>
        <Text variant="caption" color="muted">
          Dev: fill this year with sample data
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={run(clear)} style={styles.button}>
        <Text variant="caption" color="muted">
          Clear log
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  button: { minHeight: 44, justifyContent: 'center' },
});
