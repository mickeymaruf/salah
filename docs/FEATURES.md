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
