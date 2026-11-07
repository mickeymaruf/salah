// The statements the native widget receiver runs to save a tap on Missed or Prayed. They do what `markPrayed` and `markMissed` in
// src/features/prayer-times/data/prayerLog.ts do, without an upsert (Android 7 to 9 ship an SQLite without it). `src/features/widget/nativeAnswer.test.ts` runs them against
// the real schema, and `withWidgetAnswerReceiver.js` writes them into the Kotlin file, so the two cannot drift apart.
// `args` names the Kotlin values passed for the `?` marks, in order: the day key, the prayer, and the time as an ISO string.
const ANSWER_STATEMENTS = {
  // The first completion wins, and a row that says missed is turned into prayed.
  prayed: [
    {
      sql: "INSERT OR IGNORE INTO prayer_log (date, prayer, outcome, completed_at, proof_uri) VALUES (?, ?, 'prayed', ?, NULL)",
      args: ['date', 'prayer', 'completedAt'],
    },
    {
      sql: "UPDATE prayer_log SET outcome = 'prayed', completed_at = ?, proof_uri = NULL WHERE date = ? AND prayer = ? AND outcome = 'missed'",
      args: ['completedAt', 'date', 'prayer'],
    },
  ],
  // Choosing Missed replaces a prayed row.
  missed: [
    {
      sql: "INSERT OR REPLACE INTO prayer_log (date, prayer, outcome, completed_at, proof_uri) VALUES (?, ?, 'missed', ?, NULL)",
      args: ['date', 'prayer', 'completedAt'],
    },
  ],
};

module.exports = { ANSWER_STATEMENTS };
