// Append only. The index in this array plus one is the schema version stored in PRAGMA user_version.
export const MIGRATIONS: readonly string[] = [
  `CREATE TABLE prayer_log (
     date TEXT NOT NULL,
     prayer TEXT NOT NULL CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
     completed_at TEXT NOT NULL,
     proof_uri TEXT,
     PRIMARY KEY (date, prayer)
   )`,
  // Missed is now a choice the user makes, so it needs a stored value. Existing rows are all prayed.
  `ALTER TABLE prayer_log ADD COLUMN outcome TEXT NOT NULL DEFAULT 'prayed' CHECK (outcome IN ('prayed', 'missed'))`,
  // One row per dhikr per day, updated in place as the counter is tapped.
  `CREATE TABLE dhikr_log (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     dhikr_key TEXT NOT NULL,
     day TEXT NOT NULL,
     count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
     UNIQUE (dhikr_key, day)
   )`,
];
