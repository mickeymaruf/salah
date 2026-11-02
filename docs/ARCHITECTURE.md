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
