import { DatabaseSync } from 'node:sqlite';
import { MIGRATIONS } from './migrations';

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  MIGRATIONS.forEach((sql) => db.exec(sql));
  return db;
}

const insert = 'INSERT OR IGNORE INTO prayer_log (date, prayer, completed_at, proof_uri) VALUES (?, ?, ?, ?)';

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
});
