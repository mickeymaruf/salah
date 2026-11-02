// Append only. The index in this array plus one is the schema version stored in PRAGMA user_version.
export const MIGRATIONS: readonly string[] = [
  `CREATE TABLE prayer_log (
     date TEXT NOT NULL,
     prayer TEXT NOT NULL CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
     completed_at TEXT NOT NULL,
     proof_uri TEXT,
     PRIMARY KEY (date, prayer)
   )`,
];
