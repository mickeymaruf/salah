#!/usr/bin/env bash
# Runs inside the emulator job. Installs the APK, gives the app a profile (so it skips onboarding), starts it, and checks that it handed the home screen widget its data
# without an error and copied the widget pictures. Everything it saw goes to ./report, and the job fails if the widget did not get its data.
set -u
APK="$1"
PKG=app.salah.prayertracker
mkdir -p report

adb install -r "$APK" > report/install.txt 2>&1 || { cat report/install.txt; exit 1; }
adb root > /dev/null; sleep 3
adb shell pm grant "$PKG" android.permission.POST_NOTIFICATIONS > /dev/null 2>&1

start() { adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 > /dev/null 2>&1; }

# First start creates the storage file. Then the profile is written into it.
adb logcat -c
start; sleep 20
adb shell am force-stop "$PKG"; sleep 2
DB=/data/data/$PKG/databases/RKStorage
adb pull "$DB" report/RKStorage > /dev/null 2>&1
PROFILE='{"name":"CI","latitude":23.8103,"longitude":90.4125,"city":"Dhaka","country":"Bangladesh","calculationMethod":"Karachi","asrMethod":"hanafi"}'
sqlite3 report/RKStorage "INSERT OR REPLACE INTO catalystLocalStorage (key, value) VALUES ('salah.profile', '$PROFILE');"
adb push report/RKStorage "$DB" > /dev/null
OWNER=$(adb shell stat -c %u:%g "/data/data/$PKG")
adb shell chown "$OWNER" "$DB"; adb shell restorecon "$DB" > /dev/null 2>&1

# Second start has a profile, so the app reaches the screens that keep the widget up to date.
adb logcat -c
start; sleep 45
adb exec-out screencap -p > report/screen.png
adb logcat -d > report/logcat.txt
PREFS=/data/data/$PKG/shared_prefs/expo.modules.widgets.xml
adb shell cat "$PREFS" > report/widget-prefs.xml 2>&1
adb shell ls -la "/data/data/$PKG/files/ExpoWidgets" > report/widget-files.txt 2>&1

echo "=== widget pictures ==="; wc -l < report/widget-files.txt
echo "=== widget prefs (first 1500 chars) ==="; head -c 1500 report/widget-prefs.xml; echo
echo "=== app errors in the log ==="
grep -E "AndroidRuntime|FATAL|ReactNativeJS.*(Error|error)|ExpoWidgets|SalahPrayerLog" report/logcat.txt | tail -40

STATUS=0
if ! grep -q "__expo_widgets_SalahWidget_props" report/widget-prefs.xml; then echo "FAIL: the app never gave the widget any data"; STATUS=1
elif grep -q "&quot;error&quot;" report/widget-prefs.xml; then echo "FAIL: the widget was given an error instead of data"; STATUS=1
elif ! grep -q "queue" report/widget-prefs.xml; then echo "FAIL: the widget data has no queue"; STATUS=1
else echo "OK: the widget has its data"; fi
FILES=$(grep -c "widget-" report/widget-files.txt)
echo "widget pictures copied: $FILES"
[ "$FILES" -ge 27 ] || { echo "FAIL: expected 27 widget pictures"; STATUS=1; }
exit $STATUS
