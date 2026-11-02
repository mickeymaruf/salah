# Salah

A prayer tracker for Muslims, built with Expo (React Native, TypeScript).
It computes the five daily prayer times on the device and alarms at each one.
The alarm stops only after the user shows proof of prayer with a live photo.
A year view shows how consistent the user has been.

## Requirements

- Node 22.5 or newer (the schema test uses the built-in `node:sqlite`), npm 10 or newer.
- Expo Go (SDK 58) on a phone, or an Android emulator / iOS simulator.
- A development build for the optional ML Kit photo check (see below).

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. No API keys or backend are needed.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (expo config) |
| `npm test` | Jest (`jest-expo`), pure logic only |
| `node scripts/generate-icons.js` | Redraw app, splash and notification icons from `src/shared/ui/logo.json` |
| `node scripts/generate-sounds.js` | Regenerate the alarm tones in `assets/sounds/` |

## Folder map

```
app/                 Expo Router routes (thin, they compose feature screens)
src/features/        One folder per feature (onboarding, prayer-times, alarm, proof, progress, settings)
src/shared/ui/       Button, Card, Screen, Text, Toggle
src/shared/theme/    Colors, spacing, radii, type styles (the only place for hex values)
src/shared/lib/      Date helpers (all "today" logic goes through date.ts)
src/shared/db/       SQLite open and migrations
docs/                Architecture, decisions, roadmap, limitations, features
```

## Tests

```bash
npm test
```

Tests cover pure functions only: date helpers, prayer scheduling, progress stats.

## Development build

Expo Go cannot load custom native modules. Features that need one fall back
automatically (see `docs/LIMITATIONS.md`). To build a development client:

```bash
npx expo prebuild
npx expo run:android      # or run:ios on macOS
npx expo start --dev-client
```

Or with EAS: `npx eas-cli@latest build --profile development --platform android`.

## More

Start with `AGENTS.md` and `docs/ROADMAP.md`.
