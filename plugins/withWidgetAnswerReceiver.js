// Saves a tap on the widget's Missed or Prayed button even when the app is not running.
//
// `expo-widgets` only passes a tap to the app's JavaScript, and Android often stops that. This plugin replaces the generated `SalahWidgetProvider` (the broadcast receiver the
// tap is sent to) with one that first writes the answer straight into the app's SQLite log, then lets `expo-widgets` carry on: it updates the widget and tells the app if it is
// running. The app then writes the same answer again, which is harmless (see the statements in `widgetAnswerSql.js`).
// The tap id is `<missed|prayed>:<day key>:<prayer>` (see `answerTarget` in src/features/widget/widgetState.ts).
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');
const { ANSWER_STATEMENTS } = require('./widgetAnswerSql');

const kotlinStatements = (list) =>
  list.map((statement) => `            db.execSQL("${statement.sql}", arrayOf<Any?>(${statement.args.join(', ')}))`).join('\n');

const provider = (pkg) => `package ${pkg}

import android.content.Context
import android.content.Intent
import expo.modules.widgets.ExpoWidgetsAppWidgetProvider

class SalahWidgetProvider : ExpoWidgetsAppWidgetProvider("SalahWidget") {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == "expo.modules.widgets.ACTION_WIDGET_INTERACTION") {
      val target = intent.getStringExtra("expo.modules.widgets.extra.TARGET")
      if (target != null) SalahPrayerLog.save(context.applicationContext, target)
    }
    super.onReceive(context, intent)
  }
}
`;

const writer = (pkg) => `package ${pkg}

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

// Writes one answer into the prayer log that the app keeps with expo-sqlite (files/SQLite/salah.db). It does nothing if the app has never created the log, and it ignores a
// tap id it does not understand.
object SalahPrayerLog {
  private val prayers = setOf("fajr", "dhuhr", "asr", "maghrib", "isha")
  private val dayKey = Regex("\\\\d{4}-\\\\d{2}-\\\\d{2}")

  fun save(context: Context, target: String) {
    val parts = target.split(":")
    if (parts.size != 3) return
    val choice = parts[0]
    val date = parts[1]
    val prayer = parts[2]
    if ((choice != "prayed" && choice != "missed") || !dayKey.matches(date) || prayer !in prayers) return
    val file = File(context.filesDir, "SQLite" + File.separator + "salah.db")
    if (!file.exists()) return
    val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
    format.timeZone = TimeZone.getTimeZone("UTC")
    val completedAt = format.format(Date())
    runCatching {
      val db = SQLiteDatabase.openDatabase(file.path, null, SQLiteDatabase.OPEN_READWRITE)
      try {
        db.beginTransaction()
        try {
          if (choice == "prayed") {
${kotlinStatements(ANSWER_STATEMENTS.prayed)}
          } else {
${kotlinStatements(ANSWER_STATEMENTS.missed)}
          }
          db.setTransactionSuccessful()
        } finally {
          db.endTransaction()
        }
      } finally {
        db.close()
      }
    }
  }
}
`;

module.exports = function withWidgetAnswerReceiver(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const pkg = modConfig.android && modConfig.android.package;
      if (!pkg) throw new Error('withWidgetAnswerReceiver needs android.package in app.json');
      const dir = path.join(modConfig.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', ...pkg.split('.'));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SalahWidgetProvider.kt'), provider(pkg));
      fs.writeFileSync(path.join(dir, 'SalahPrayerLog.kt'), writer(pkg));
      return modConfig;
    },
  ]);
};
