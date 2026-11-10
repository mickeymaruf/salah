import { DatabaseSync } from 'node:sqlite';
import { MIGRATIONS } from './migrations';

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  MIGRATIONS.forEach((sql) => db.exec(sql));
  return db;
}

const insert = 'INSERT OR IGNORE INTO prayer_log (date, prayer, completed_at, proof_uri) VALUES (?, ?, ?, ?)';
const insertOutcome =
  'INSERT OR IGNORE INTO prayer_log (date, prayer, outcome, completed_at, proof_uri) VALUES (?, ?, ?, ?, ?)';

describe('prayer_log schema', () => {
  it('keeps the first completion for a day and prayer', () => {
    const db = freshDb();
    db.prepare(insert).run('2026-10-26', 'fajr', '2026-10-26T01:00:00.000Z', 'file:///first.jpg');
    db.prepare(insert).run('2026-10-26', 'fajr', '2026-10-26T02:00:00.000Z', 'file:///second.jpg');
    const rows = db.prepare('SELECT * FROM prayer_log').all();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ proof_uri: 'file:///first.jpg' });
  });

  it('never stores unknown prayer names', () => {
    const db = freshDb();
    db.prepare(insert).run('2026-10-26', 'witr', '2026-10-26T01:00:00.000Z', null);
    expect(db.prepare('SELECT * FROM prayer_log').all()).toHaveLength(0);
  });

  it('selects a year by zero-padded date strings', () => {
    const db = freshDb();
    db.prepare(insert).run('2025-12-31', 'isha', 'x', null);
    db.prepare(insert).run('2026-01-01', 'fajr', 'x', null);
    db.prepare(insert).run('2026-12-31', 'isha', 'x', null);
    db.prepare(insert).run('2027-01-01', 'fajr', 'x', null);
    const rows = db.prepare('SELECT date FROM prayer_log WHERE date BETWEEN ? AND ? ORDER BY date').all('2026-01-01', '2026-12-31');
    expect(rows.map((r) => r.date)).toEqual(['2026-01-01', '2026-12-31']);
  });

  it('treats rows from before the outcome column as prayed', () => {
    const db = new DatabaseSync(':memory:');
    db.exec(MIGRATIONS[0]);
    db.prepare(insert).run('2026-10-26', 'fajr', 'x', null);
    db.exec(MIGRATIONS[1]);
    expect(db.prepare('SELECT outcome FROM prayer_log').all()).toEqual([{ outcome: 'prayed' }]);
  });

  it('accepts only prayed or missed as an outcome', () => {
    const db = freshDb();
    db.prepare(insertOutcome).run('2026-10-26', 'fajr', 'missed', 'x', null);
    db.prepare(insertOutcome).run('2026-10-26', 'dhuhr', 'skipped', 'x', null);
    expect(db.prepare('SELECT prayer FROM prayer_log').all()).toEqual([{ prayer: 'fajr' }]);
  });
});

describe('dhikr_log schema', () => {
  const upsert =
    'INSERT INTO dhikr_log (dhikr_key, day, count) VALUES (?, ?, ?) ON CONFLICT (dhikr_key, day) DO UPDATE SET count = excluded.count';

  it('keeps one row per dhikr per day and updates it in place', () => {
    const db = freshDb();
    db.prepare(upsert).run('subhanallah', '2026-10-26', 5);
    db.prepare(upsert).run('subhanallah', '2026-10-26', 9);
    db.prepare(upsert).run('subhanallah', '2026-10-27', 2);
    db.prepare(upsert).run('durood', '2026-10-26', 1);
    expect(db.prepare('SELECT dhikr_key, day, count FROM dhikr_log ORDER BY id').all()).toEqual([
      { dhikr_key: 'subhanallah', day: '2026-10-26', count: 9 },
      { dhikr_key: 'subhanallah', day: '2026-10-27', count: 2 },
      { dhikr_key: 'durood', day: '2026-10-26', count: 1 },
    ]);
  });

  it('refuses a negative count', () => {
    const db = freshDb();
    expect(() => db.prepare(upsert).run('durood', '2026-10-26', -1)).toThrow();
  });
});
