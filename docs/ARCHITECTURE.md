# Architecture

## Layers

```
app/ (routes)  ->  src/features/<name>/ (screens, hooks, logic)  ->  src/shared/ (ui, theme, db, lib)
```

Route files only import a screen from a feature and render it.
Logic lives in plain functions so Jest can test it without React.

## Data flow (target design)

```
profile (AsyncStorage) --> prayer-times (adhan) --> today's 5 times
                                  |                        |
                                  v                        v
                         notifications (7 days)     Today screen
                                  |                        ^
                       tap -> /alarm -> /proof ----------> prayer_log (SQLite)
                                                           |
                                                           v
                                                 Progress (year query)
```

Prayer times are looked up from monthly tables downloaded from the Aladhan API (cached in AsyncStorage) and fall back
to the `adhan` calculation. They are not part of the prayer log.
A prayer is prayed or missed when a log row says so (`outcome`), unmarked when its time passed without a row,
upcoming otherwise. Missed is stored, as a row with `outcome = 'missed'`.

This document is extended as each feature lands.

## Routing and the guard

`app/_layout.tsx` loads fonts and hydrates the profile store before rendering any route.
`Stack.Protected` exposes `(onboarding)` when there is no profile and `(tabs)` when there is one.
`app/index.tsx` redirects to the right side. Saving a profile flips the guard.

## Shared state

`src/shared/state/` holds the zustand stores for profile (and later settings). They are used by
onboarding, prayer-times and settings, so they are shared rather than owned by one feature.

## Manual prayer times

`getDayTimes` = `getAutomaticTimes` (API table or `adhan`) with `profile.manualTimes` applied by `applyManualTimes`.
Every reader goes through it. Settings writes the profile; `useAlarmSync` depends on the profile, so alarms are rebuilt.
During onboarding the profile does not exist yet, so `onboarding/draftStore.ts` holds the detected place and the edits.

## Catch-up on open

`useCatchUp` (called in `app/_layout.tsx`) runs at every app open. It builds the queue with `buildCatchUpQueue` from the same
`getDayTimes` and log rows the other screens use, puts it in `catchUpStore` and pushes `/catch-up`. Answers go through `useSaveChoice`, so
the optimistic log store updates Today and Progress at once.

## Today screen

`useTodayPrayers` returns today's times, the five states and the prayer window in progress (`getPrayerWindow`, which also looks at yesterday's Isha and tomorrow's Fajr). `PrayerPill` calls `useSaveChoice`, the same path as the log sheet and Catch-up, so every screen sees the mark at once.

Components are presentational and take those values as props.

## Prayer log

`getDb()` opens `salah.db` once and applies `MIGRATIONS` in order, tracked by `PRAGMA user_version`.
Screens never hold log data globally. `usePrayedOn(date)` queries the day and runs again when the
`revision` in `prayerLogStore` changes, which happens after every `mark`.

## Alarm and notification flow

```
profile + settings + log --> planAlarms (pure) --> scheduleNotificationAsync x N
                                                          |
   notification fires -> tap (or foreground receive) -> useNotificationRouting
                                                          |
                                                    /alarm?prayer&date --> sound loop
                                                          |
                                         Take photo -> /proof -> markPrayed -> log revision++
                                                                                    |
                                                              useAlarmSync reschedules without that prayer
```

`planAlarms` keeps every prayer alarm for the 7 days and fills the remaining budget with reminders and
follow-ups, soonest first. The budget is 60 on iOS (the OS keeps 64) and 250 on Android.

## Proof flow

`AlarmScreen -> /proof (CameraView) -> takePictureAsync -> registerLiveCapture -> verifier.verify ->
saveProof (copy to documents) -> prayerLogStore.mark -> /verified -> Done -> dismissTo(/today)`.
The alarm screen stays mounted under the proof screens. It stops its own sound when the day log shows the prayer
as prayed, and leaves when it regains focus.

## Progress data

```
getYear(year) --entries--> buildYear(entries, today's live states, start date) --> 12 x 28..31 DayCell
                                                                                      |
                                                              computeStats  <---------+---> YearGrid, DayDetail
```

`useYearProgress` re-queries when the log revision changes. `useTodayPrayers` keeps its `states` object stable
between clock ticks so the grid is not rebuilt every 10 seconds.

## Instant updates

`prayerLogStore.mark` and `unmark` first put the change in `overrides`, which `useDayLog` and `useYearProgress` layer
over the database result (`optimistic.ts`). Screens update in the same frame. The write then runs, and a failed write
is rolled back. The revision bump after the write triggers a re-query that agrees with the overrides.
