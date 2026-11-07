import { DatabaseSync } from 'node:sqlite';
import { ANSWER_STATEMENTS } from '../../../plugins/widgetAnswerSql';
import { MIGRATIONS } from '@/shared/db/migrations';

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  MIGRATIONS.forEach((sql) => db.exec(sql));
  return db;
}

function answer(db: DatabaseSync, choice: 'prayed' | 'missed', completedAt: string): void {
  const values = { date: '2026-11-07', prayer: 'fajr', completedAt };
  for (const statement of ANSWER_STATEMENTS[choice]) {
    db.prepare(statement.sql).run(...statement.args.map((name) => values[name]));
  }
}

const rows = (db: DatabaseSync) => db.prepare('SELECT * FROM prayer_log').all();

describe('native widget answer statements', () => {
  it('saves Prayed on an unmarked prayer', () => {
    const db = freshDb();
    answer(db, 'prayed', 't1');
    expect(rows(db)).toEqual([expect.objectContaining({ date: '2026-11-07', prayer: 'fajr', outcome: 'prayed', completed_at: 't1', proof_uri: null })]);
  });

  it('keeps the first Prayed, so a repeated tap does not rewrite the time', () => {
    const db = freshDb();
    answer(db, 'prayed', 't1');
    answer(db, 'prayed', 't2');
    expect(rows(db)).toEqual([expect.objectContaining({ outcome: 'prayed', completed_at: 't1' })]);
  });

  it('keeps a photo-verified Prayed row untouched', () => {
    const db = freshDb();
    db.prepare("INSERT INTO prayer_log (date, prayer, outcome, completed_at, proof_uri) VALUES ('2026-11-07', 'fajr', 'prayed', 't0', 'file:///proof.jpg')").run();
    answer(db, 'prayed', 't1');
    expect(rows(db)).toEqual([expect.objectContaining({ completed_at: 't0', proof_uri: 'file:///proof.jpg' })]);
  });

  it('turns a Missed row into Prayed', () => {
    const db = freshDb();
    answer(db, 'missed', 't1');
    answer(db, 'prayed', 't2');
    expect(rows(db)).toEqual([expect.objectContaining({ outcome: 'prayed', completed_at: 't2' })]);
  });

  it('saves Missed, and replaces a Prayed row', () => {
    const db = freshDb();
    answer(db, 'prayed', 't1');
    answer(db, 'missed', 't2');
    expect(rows(db)).toEqual([expect.objectContaining({ outcome: 'missed', completed_at: 't2', proof_uri: null })]);
  });
});
