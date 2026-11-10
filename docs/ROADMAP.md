# Roadmap

Status: done, next, todo.

| # | Feature | Status |
|---|---|---|
| 0 | Scaffold: Expo, strict TS, Router, theme, base UI, Jest | done |
| 1 | Onboarding: name, location, profile, route guard | done |
| 2 | Prayer times and Today screen | done |
| 3 | SQLite prayer log | done |
| 4 | Alarm: notifications, alarm screen, sound | done |
| 5 | Proof: camera, live-capture verifier, verified screen | done |
| 6 | Progress: year grid, stats, day detail | done |
| 7 | Settings | done |
| 8 | Splash and branding | done |
| 9 | ML Kit verifier (dev build only) | done |
| 10 | Polish pass | done |
| 11 | Manual prayer times | done |
| 12 | Catch-up on open | removed |
| 13 | Home screen widget (Android, dev build) | done, not run on a device |
| 14 | Tree screen and Tree tab | done, not run on a device |
| 15 | Proof flow switched off behind a flag | done |
| 16 | Silent prayer-time reminder flow (screens 4, 5, 6, 6b) | done, not run on a device |
| 17 | Dhikr counter, list and deeds | done, not run on a device |
| 18 | Dhikr counting with the screen off (Android, experimental) | built, to be tested on the phone |

## Later

- Screen-off counting: tune the tap thresholds from real tests, maybe a short calibration step; a design for where to switch it on and off

- Dhikr: a real entry point (the design does not show one). Today the screens open from a temporary "Dhikr" row in Settings, About. Remove it when the entry point exists.
- Dhikr: verify every reward value, then set `verified` in `src/features/dhikr/config.ts`.
- Dhikr: a reward-source / hadith sheet (it was taken off the counter on purpose); haptics on a tap (open question).

- Reminder: verify the verses and translations with a scholar; decide when the asking stops; flag a log entry as "from reminder"; a native iOS or Android surface that shows the ask over the lock screen without a tap

- Manual city entry when location is denied
- Per-day or seasonal manual times (edits are one fixed time today)
- Darker muted text color (contrast, see `docs/LIMITATIONS.md`)
- Visual check of every screen against Figma on a device
- Reduce-motion support for the alarm pulse
- Android full-screen alarm intent (needs native code)
- Widget: a native refresh at each prayer time and every minute so it stays right while the app is stopped; an iOS widget
- Qibla direction
- Dark mode
- Backup and sync
- Localization (Arabic, Bengali, Urdu, Turkish)
