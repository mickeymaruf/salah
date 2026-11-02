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
