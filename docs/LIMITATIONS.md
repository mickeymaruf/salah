# Limitations

## Tooling in the build environment

- The Expo API and `figma.com` asset hosts were not reachable while building.
  `npx expo install` and parts of `npx expo-doctor` need the Expo API, so package
  versions were taken from `node_modules/expo/bundledNativeModules.json`.
- Figma asset downloads (logo SVG) were blocked. The logo mark is redrawn in code
  from the Figma screenshot. See `docs/DECISIONS.md`.
- Nothing was run on a device or emulator.

## Location and time zones

- Prayer times are absolute instants shown in the device time zone. They are correct only when the
  device is in the time zone of the saved location. After travelling, refresh the location in Settings.
- If reverse geocoding fails (offline), the city is shown as rounded coordinates.
- Onboarding cannot continue without location permission. Manual city entry is on the roadmap.

## Today

- A prayer whose time has passed without a log row counts as missed immediately. There is no grace window.
  The user can still mark it prayed through proof, which turns it into prayed.

## Alarm

- iOS has no alarm API for normal apps. Alarms are local notifications. They respect the silent switch,
  Focus modes and Do Not Disturb. Notification sounds are capped at 30 seconds, the tones here are 4 seconds.
  The user can swipe them away. The alarm screen with its looping sound only appears after a tap or
  while the app is open.
- iOS keeps at most 64 pending local notifications. The planner keeps all 35 prayer alarms for 7 days and
  spends the remaining budget on reminders and follow-ups, soonest first. Follow-ups for later days appear as the
  window slides forward each time the app opens. If the app is not opened for several days, only the main
  prayer alarms remain.
- Android uses a high-importance channel with the alarm audio usage. It still cannot show a full-screen
  alarm over the lock screen without native code (a full-screen intent). On Android 12+ exact alarms need the
  "Alarms & reminders" permission (`SCHEDULE_EXACT_ALARM`), which Android 14 does not grant by default.
  Without it notifications can arrive a few minutes late. Aggressive battery managers on some phones
  delay or drop them.
- The alarm screen blocks the Android back button and swipe-to-dismiss while it is open. Closing the app
  stops the sound; the follow-up notifications still fire. The escape hatch is turning off "Require photo proof".
- Expo Go: custom notification sounds and the notification color need a development build (config plugin).
  In Expo Go the system default sound is used. Local notifications themselves work.
- The sounds are short synthesized tones made by `scripts/generate-sounds.js`. No adhan recording is
  bundled because no licensed audio could be obtained offline. The Figma frame shows "Adhan" as the default
  sound. Drop a recording into `assets/sounds/` and register it as described in `docs/FEATURES.md`.
- The alarm opens even when the prayer is long past, as long as it has not been marked.

## Proof

- The default verifier proves that a photo was taken with the in-app camera during this session. It does not
  check what the photo shows. Pointing the camera at a wall passes. The ML Kit verifier (dev build only)
  narrows this but is still a heuristic.
- A camera denied permanently leads to an "Open settings" button. Without the camera the alarm cannot be silenced,
  except by turning off "Require photo proof".
- Proof photos are stored in the app document directory and never uploaded. Uninstalling the app deletes them.
- The verified screen shows the proof photo from the log. If the file copy failed, the cache path is used and the
  OS may clear it later.
