# Features

Shipped features, what they do, who owns the code, how to extend them.

## Scaffold

- Owns: `app/_layout.tsx`, `src/shared/theme/`, `src/shared/ui/`, `src/shared/lib/date.ts`.
- Theme: all colors, spacing, radii and type styles. Add a token there before using it.
- UI: `Screen`, `Text`, `Button`, `Card`, `Toggle`. Extend by adding props, not new wrappers.
- Date: `now()` reads an injectable clock. Use `setClock` in tests.

## Onboarding

- What: name screen, then location screen. Location permission is requested once, the city is
  reverse-geocoded, and the five times for today are shown before the user continues.
  The profile is saved to AsyncStorage and the user lands on Today.
- Owns: `src/features/onboarding/` (screens, `useLocationStep`), `src/features/prayer-times/calculate.ts`
  and `location.ts`, `src/shared/state/profile.ts` and `profileStore.ts`, `app/(onboarding)/`, `app/_layout.tsx`.
- Route guard: `Stack.Protected` in `app/_layout.tsx`. No profile means onboarding only. A profile means the app only.
- Extend: add a profile field in `profile.ts` (type and `parseProfile`), then edit it from Settings.
  Permission states are `idle`, `detecting`, `ready`, `denied`, `blocked`, `error` in `useLocationStep`.

## Prayer times and Today

- What: computes today's five times offline and shows the next prayer, a live countdown,
  a 5-segment day bar and the prayer list. The user icon opens Settings.
- Owns: `src/features/prayer-times/` (`calculate.ts`, `schedule.ts`, `useTodayPrayers.ts`,
  `TodayScreen.tsx`, `components/`), `src/shared/lib/useNow.ts`, `app/(tabs)/`.
- Rules in `schedule.ts`: prayed if logged, missed if the time passed without a log, otherwise upcoming.
  The next prayer is the first one strictly in the future, or tomorrow's Fajr after Isha.
- Extend: a new calculation option goes in `calculate.ts` and `src/shared/state/profile.ts`.
  `useTodayPrayers(profile, prayed)` takes the set of prayed names from the log.

## Prayer log (SQLite)

- What: stores one row per completed prayer. Missed prayers are derived, never stored.
- Owns: `src/shared/db/` (`database.ts` opens one connection and runs migrations, `migrations.ts`),
  `src/features/prayer-times/data/` (`prayerLog.ts` queries, `prayerLogStore.ts` revision counter,
  `usePrayedOn.ts` hook).
- API: `markPrayed(date, prayer, proofUri)` keeps the first completion. `getDay`, `getRange`, `getYear(year)`.
  Writes go through `usePrayerLogStore().mark(...)` so open screens re-query.
- Extend: append a SQL string to `MIGRATIONS`. Never edit an existing entry.

## Alarm

- What: schedules local notifications for each prayer for 7 days, with a reminder before and up to 5
  follow-ups every 3 minutes. Tapping a prayer or follow-up opens `/alarm`, a full-screen dark screen that
  loops a sound until the prayer is marked. With "Require photo proof" on, the only action is "Take photo".
  With it off, the action is "Mark as prayed".
- Owns: `src/features/alarm/` (`schedule.ts` planner, `scheduler.ts` native scheduling, `channels.ts`,
  `permission.ts`, `useAlarmSync.ts`, `useNotificationRouting.ts`, `useAlarmSound.ts`, `AlarmScreen.tsx`),
  `src/shared/state/settings.ts` and `settingsStore.ts`, `assets/sounds/`, `scripts/generate-sounds.js`, `app/alarm.tsx`.
- When it syncs: app start, profile or settings change, every log write, every return to the foreground.
  Each sync cancels everything and schedules again. Ids are `<date>-<prayer>-<kind><n>`.
- Extend: change counts or spacing in `schedule.ts` (`DAYS_AHEAD`, `FOLLOW_UP_COUNT`, `FOLLOW_UP_MINUTES`).
  Add a sound by adding it to `generate-sounds.js`, `ALARM_SOUNDS`, `SOURCES` in `useAlarmSound.ts`, and the
  `sounds` list of the notifications plugin in `app.json`.

## Proof

- What: the live camera screen (`/proof`), a verifier, and the confirmation screen (`/verified`).
  A photo taken in the session is accepted, copied to the document directory, and the prayer is logged
  with its path. Logging bumps the log revision, which reschedules alarms without that prayer and stops the
  alarm sound. "Done" returns to Today.
- Owns: `src/features/proof/` (`verifier.ts`, `proofStorage.ts`, `useProofSubmit.ts`, `ProofCameraScreen.tsx`,
  `VerifiedScreen.tsx`, `components/`), `app/proof.tsx`, `app/verified.tsx`.
- The interface: `ProofVerifier.verify(photoUri) => { ok, label? }`. `getVerifier()` picks the implementation.
- No gallery access exists anywhere. The camera screen registers each capture with `registerLiveCapture`,
  and `liveCaptureVerifier` accepts only registered URIs.
- Extend: add a verifier and return it from `getVerifier()`. A rejected photo shows a retry hint on the camera screen.

## Progress

- What: one screen for the whole year. 12 month rows by up to 31 day columns, each day a bar of 5 segments
  (Fajr on top): green prayed, terracotta missed, pale upcoming. The grid scrolls horizontally with a thin custom
  scrollbar and opens with today at the right edge. Month letters stay fixed on the left. Tapping a day shows its
  five prayers in the detail card. Above the grid: percent kept, prayed, missed, best streak.
- Owns: `src/features/progress/` (`model.ts` builds the grid, `stats.ts`, `useYearProgress.ts`,
  `ProgressScreen.tsx`, `components/`), `app/(tabs)/progress.tsx`.
- Data: one query for the year (`getYear`). Past days need no prayer times: not logged means missed. Only today
  uses the clock. Days before the start date are "untracked": drawn pale and excluded from every number.
  The start date is `profile.startedOn`, or the first logged day if that is earlier.
- Stats count prayed and missed prayers whose time passed. Best streak is the longest run of consecutive days with
  all five prayed.
- Extend: a new state needs a color in `DayBar.tsx`, a case in `model.ts`, and a mark in `DayDetail.tsx`.

## Settings

- What: reached from the user icon on Today and Progress. Profile card with name edit. Prayer times: refresh
  location, calculation method, Asr method. Alarm: sound (plays a 2.5 s preview), require photo proof,
  reminder before. About: Privacy and Help pages (static text).
- Owns: `src/features/settings/` (`SettingsScreen.tsx`, `options.ts` labels, `useRefreshLocation.ts`,
  `components/`, `PrivacyScreen.tsx`, `HelpScreen.tsx`), `src/shared/ui/ScreenHeader.tsx`,
  `src/features/alarm/previewSound.ts`, `app/settings.tsx`, `app/privacy.tsx`, `app/help.tsx`.
- Every change writes to a zustand store. `useAlarmSync` sees the new profile or settings and reschedules, and
  Today and Progress recompute from the new profile.
- Extend: add a row in `SettingsScreen.tsx`. For a list of choices add a label map to `options.ts` and an `OptionSheet`.

## Splash and branding

- What: a native splash (dark green with the mark and two rings) that hands over to an in-app splash with the
  "Salah" wordmark and the tagline, held for at least 0.9 s. App icon, Android adaptive and monochrome icons,
  notification icon and favicon are drawn from the same logo geometry.
- Owns: `src/shared/ui/logo.json` (geometry), `LogoMark.tsx`, `SplashView.tsx`, `scripts/generate-icons.js`,
  `assets/*.png`, the splash and notification entries in `app.json`, the splash hold in `app/_layout.tsx`.
- Extend: change the shape in `logo.json`, then run `node scripts/generate-icons.js` to rewrite every PNG.
  The adaptive icon background is a color in `app.json`, so there is no background image.

## ML Kit verifier

- What: on-device image labeling. A live photo is accepted when ML Kit returns a label such as Carpet, Floor,
  Room, Mosque, Place of worship, Rug or Mat with confidence 0.5 or more. The label appears on the verified screen
  ("Carpet detected"). Without the native module the live-capture verifier is used.
- Owns: `src/features/proof/mlKit.ts` (module detection), `mlKitVerifier.ts` (composition and fallback),
  `mlKitLabels.ts` (label matching), `getVerifier()` in `verifier.ts`.
- Order of checks: live-capture first, then labels. If the labeler throws, the live result stands.
- Extend: edit `KEYWORDS` and `MIN_CONFIDENCE` in `mlKitLabels.ts`. Another model goes behind the same `ImageLabeler` type.

## Polish

- Notifications denied: Today shows an "Alarms are off" notice that asks again or opens system settings.
  Settings has a "Notifications" row with the same behavior. The status is re-checked when the app returns to the foreground.
- Permission states elsewhere: location (denied, blocked, error) in onboarding and Settings, camera (allow or open settings).
- Empty states: Progress shows a dash and "Pray today to start your year" before anything is tracked.
- Errors: `ErrorBoundary` from Expo Router on the root layout, and `app/+not-found.tsx` sends unknown links to `/`.
- Layout: top padding follows the safe area exactly as in the Figma frames. The tab bar is 54 plus the bottom inset.
  Prayer rows use a minimum height so large system text grows them. Display texts cap font scaling at 1.1, others at 1.4.

## Prayer time source

- What: `getDayTimes` returns times from the downloaded monthly table when there is one, otherwise from `adhan`.
  `useTimesSync` (started in `app/_layout.tsx`) loads this and next month on launch, profile change and foreground.
  A new table bumps `useTimesStore.revision`, which recomputes Today, Progress and the alarm schedule.
- Owns: `src/features/prayer-times/data/` (`aladhan.ts` URL and parsing, `timesMemory.ts` lookup,
  `timesCache.ts` storage and download, `useTimesSync.ts`), `calculateDayTimes` and `getDayTimes` in `calculate.ts`.
- Extend: another provider needs a URL builder and a parser that returns `Record<dateKey, DayTimes>`.

## Manual logging

- What: one bottom sheet (`LogPrayerSheet`) with Prayed or Missed. Tapping one saves it and closes the sheet (no Save button). Tapping Prayed on a prayed prayer undoes it. Two entry points:
  Today (tap a prayer row that is not prayed) and Progress (tap a day in the chart, then a prayer in the day card).
  Past days can be edited with no limit on how far back. Future days cannot.
- Rules (`logChoice.ts`): Prayed is stored as a log row without a photo. Missed removes the row, because missed is
  derived. A prayer whose time has not come cannot be marked Missed. Existing photo-verified rows are kept when
  Prayed is saved again.
- Marks: every prayed prayer shows a filled green check, whether it was logged by hand or verified with a photo.
  Missed shows a filled terracotta cross. The outlined check from the Figma flow was dropped on request, along with
  the explanatory note in the sheet.
- The sheet opens on the prayer's current state, so a missed prayer opens with Missed selected.
- Owns: `src/features/prayer-times/components/LogPrayerSheet.tsx`, `logChoice.ts`, `data/useSaveChoice.ts`,
  `removePrayed` and `unmark` in the log, `manual` on `DayCell` in `src/features/progress/model.ts`.
- Hint under the day card: "Tap a prayer to mark it done or missed".

## Bottom sheets

- `BottomSheet` in `src/shared/ui/BottomSheet.tsx` is the one sheet used by the log-a-prayer sheet and the two
  Settings pickers. It is translucent under the status bar and navigation bar, so its scrim covers the whole
  window on any device. The scrim sits behind the sheet, so the rounded 32 px top corners show dimmed content, not
  the page. Mount it to open. Its children receive `close`, which slides the sheet out (200 ms) before the parent unmounts it;
  opening takes 280 ms. One native-driven value moves the sheet by its measured height and fades the scrim.

## Tab swiping

- Today and Progress are pages of one pager (`expo-router/js-top-tabs`, `react-native-pager-view`). Swipe sideways or tap
  the bottom bar. Taps switch with no animation and the neighbouring page is rendered ahead, so both feel instant.
- Owns: `app/(tabs)/_layout.tsx`, `src/shared/ui/TabBar.tsx` (the bar, drawn like the Figma tab bar).
- Needs both `react-native-tab-view` and `react-native-pager-view`. Expo Router loads the first one inside a try/catch, so a
  missing package builds fine and only fails when the app starts. Check with `npx expo export --no-bytecode` and search the bundle.
- On Progress, dragging on the year chart scrolls the chart. Drag anywhere else to swipe back to Today.

## Manual prayer times

- What: times are always calculated from the location. If they do not match the local masjid, the user can set any of
  the five by hand. No switch, no per-masjid choice, no Adhan or Jama'ah times. A prayer with no edit keeps its calculated time.
- Where: Location step of onboarding (small "Edit times" link on the card, opens "Adjust your times" with a Save times
  button) and Settings, Prayer times, "Edit prayer times" (Automatic or Custom, opens "Edit times"). Tapping a time opens
  a sheet with an hour, minute and AM/PM wheel. Both screens have "Reset to automatic times".
- Settings applies each edit when Done is tapped (Figma 8b has no Save button). Onboarding keeps edits until Save times.
- Edits are stored as `profile.manualTimes` (`{ fajr: "04:55" }`, 24-hour clock). `getDayTimes` applies them, so Today, the
  countdown, the day bar, Progress and the alarm planner all use them. Saving rewrites the profile, which reschedules every alarm.
- Times must stay in order (Fajr, Dhuhr, Asr, Maghrib, Isha). An out-of-order pick is refused with a message.
- Changing the location from Settings to a different city asks whether to keep the edits or reset them. Reset is the default.
- Owns: `src/features/adjust-times/` (screens, wheel, sheet), `src/features/prayer-times/manualTimes.ts` (pure logic),
  `src/features/onboarding/draftStore.ts`.
