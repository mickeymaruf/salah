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
  `ProgressScreen.tsx`, `components/`, `seed.ts` and `DevTools.tsx` for development), `app/(tabs)/progress.tsx`.
- Data: one query for the year (`getYear`). Past days need no prayer times: not logged means missed. Only today
  uses the clock. Days before the start date are "untracked": drawn pale and excluded from every number.
  The start date is `profile.startedOn`, or the first logged day if that is earlier.
- Stats count prayed and missed prayers whose time passed. Best streak is the longest run of consecutive days with
  all five prayed.
- Dev seed: in `__DEV__` builds two links under the detail card fill this year with sample data or clear the log.
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
