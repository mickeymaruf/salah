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

Prayer times are never stored. They are recomputed from the profile and a date.
A prayer is prayed when a log row exists, missed when its time passed without a row,
upcoming otherwise. Missed rows are not stored.

This document is extended as each feature lands.

## Routing and the guard

`app/_layout.tsx` loads fonts and hydrates the profile store before rendering any route.
`Stack.Protected` exposes `(onboarding)` when there is no profile and `(tabs)` when there is one.
`app/index.tsx` redirects to the right side. Saving a profile flips the guard.

## Shared state

`src/shared/state/` holds the zustand stores for profile (and later settings). They are used by
onboarding, prayer-times and settings, so they are shared rather than owned by one feature.

## Today screen

`useTodayPrayers` combines the profile, the clock (`useNow`, 10 s tick and on foreground) and the set of
prayed names. It returns times, per-prayer states, the next prayer and the countdown. Components are
presentational and take those values as props.

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
