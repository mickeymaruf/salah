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

- Nothing on Today has been checked on a device.
- The pill's missed fill (#EBC7C0) is calculated from the brief (terracotta 40% over white); Figma draws it only as a circle.
- The prayer sheet scrolls on small screens. The sparkles are positioned for a 390 px wide screen.

- A prayer whose time has passed without a choice stays unmarked. It is not counted as missed, so the percentage kept only reflects what was marked.
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

## Progress

- Each day bar is 14 px wide, below the 44 px touch target guideline. This is the design: 365 bars must fit in
  one chart. Every bar has an accessibility label with its date and count.
- Days before the first use are not counted as missed. The start date is stored when onboarding finishes. Profiles
  saved before this field existed fall back to the first logged day, or to today.
- The chart was not rendered on a device or emulator. Layout numbers (14 px bars, 3 px gaps, 19 px rows) come from
  the Figma frame.

## Settings

- Changing the calculation method or location changes today's times immediately. Logged prayers are kept as they are.
- "Location" refreshes on tap without a confirmation step. It overwrites the saved coordinates and city.
- The Help screen has no feedback channel because the project has no contact address. Add one in `HelpScreen.tsx`.
- The name can be edited. The photo avatar is the first letter of the name.

## Branding

- `sharp` is a dev dependency used only by `scripts/generate-icons.js`. It is not in the app bundle.
- The icon files were checked as images, not on a device or in a store listing. Android adaptive masks differ by
  launcher; the mark stays inside the safe zone.

## ML Kit verifier

- Needs a development build. The package is a legacy `NativeModules` bridge module. React Native 0.88 runs only the
  new architecture and loads such modules through its interop layer. This was not built or run here. If the
  module fails to load, `getVerifier()` returns the live-capture verifier and the app keeps working.
- ML Kit's base model has about 400 labels and has no "prayer mat" label. The check accepts rug-like or room-like
  labels, so a rug, a carpet, a floor or a room all pass. A photo of an unrelated carpet passes too.
- Labeling runs on the device. No photo leaves the phone.

## Accessibility and visual checks

- Muted text (`ink/muted` #8A867D on `bg/base` #F7F5F0) has a contrast ratio of about 3.3:1, below the 4.5:1 WCAG AA
  level for small text. The color comes from the Figma file and was kept. Darkening it is on the roadmap.
- Layout values were taken from the Figma frames and the code was type-checked and bundled. No screen was rendered on a
  device, emulator or simulator, so no screen was compared with its Figma frame by eye. The icons and splash image were
  rendered and looked at.
- Expo Go on Android prints a warning when `expo-notifications` loads (remote push was removed from Expo Go).
  Local notifications are what this app uses and are not affected.

## Prayer time source

- The Aladhan API was not reachable from the build environment, so the download, parsing against a live response and
  the comparison with `adhan` were not run. Parsing is tested against a sample shaped like the documented response.
- The API returns times in the time zone of the coordinates and the app reads them as device local time. Both match
  only when the phone is in the same time zone as the saved location.
- Start times are shown, not mosque (jamaat) times. Mosque times are set locally and are usually later.
- Tables are cached by month. Changing location by more than about 1 km, the method or the Asr school downloads a new table.

## Manual logging

- A prayer logged by hand looks the same as a photo-verified one. Only the stored photo path differs.
- Logging a prayer on a day before the first use moves the start date back to that day. Every day from there to the
  first use are unmarked and left out of the percentage.
- Choosing Missed on a photo-verified prayer replaces its log row, and so does Clear mark. The photo file stays in the app storage.
- The sheet was built from the Figma frames and type-checked. It was not rendered on a device.

## Manual prayer times

- An edit is one fixed clock time for every day. Calculated times move by a minute or so each day, so edit again when the
  masjid changes its timetable. Seasonal or per-day timetables and jamaat times are not supported.
- Edits are in the phone's clock. If the phone is in a different time zone from the saved location, the edited time is
  read as phone time.
- Edits are stored only on the device (no backup).
- Not yet checked on a device: the wheel feel, the sheet over the Adjust times screen, and the Figma match.

## Standalone build

- `eas.json` and the build steps in the README were written without access to Expo's servers. No build was run, so the first
  build may need adjustments (for example a new `eas-cli` prompt, or a native module that fails to compile).
- The first standalone build activates the ML Kit photo check, which has not been run on a device. If it wrongly rejects a
  genuine photo, turn off "Require photo proof" in Settings, or report it so the labels can be loosened.
- Alarm sounds, the notification color and the notification icon only apply in a standalone or development build.

## Home screen widget

Built with `expo-widgets` (Android Glance, Expo UI components). Needs a development or standalone build; in Expo Go and on iOS the app runs as before and the widget is absent. Not run on a device.

Differs from the Figma frames and the brief:

- **Taps are written only while the app is running.** A tap on Missed or Prayed reaches the app as an event, and `WidgetSync` writes it to the log. If Android has stopped the app's JavaScript, the tap is not
  written and the widget does not change. `expo-widgets` has no way to run the write without the app. Doing it properly needs a small native receiver that writes to the SQLite log directly.
- **No transition.** Android widgets cannot animate content. The front card does not slide or fade, the cards behind do not move or scale, and no new card fades in. The widget just redraws with the new
  front card. iOS has a content transition, but the iOS widget is not set up.
- **No shadows.** The widget layout supports only size, padding, background colour and corner radius. The front card and the two cards behind have no shadow.
- **System font.** The widget cannot load Plus Jakarta Sans (text takes only a weight and a size). It uses the system font at weights 500 and 600.
- **Width follows the launcher.** The widget is 4 cells wide (at least 250 dp), not exactly 342 pt. The cards and the time bar fill the width. Missed and Prayed are fixed at 148 dp each because the layout has no
  weights, so on a widget narrower than 342 dp they can be clipped.
- **Header text sizes.** The brief says 15 and 15; the first Figma frame has 14 and 13. The brief was followed.
- **Right-aligned items** (the counter, the question's time, the countdown) sit in a full-width box on top of the left content, because the layout has no spacer weights.
- Widget support in `expo-widgets` for Android is marked as opt-in (`enableAndroid`) and is expected to change.

