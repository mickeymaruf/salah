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

Scan the QR code with Expo Go. No API keys or backend are needed. Prayer times come from the public
Aladhan API and are cached per month; offline, the app calculates them on the device.

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
src/shared/ui/       Button, Card, Screen, ScreenHeader, Text, Toggle, UserButton, LogoMark, SplashView
src/shared/theme/    Colors, spacing, radii, type styles (the only place for hex values)
src/shared/lib/      Date helpers (all "today" logic goes through date.ts), useNow
src/shared/state/    Profile and settings stores (zustand + AsyncStorage)
scripts/             Icon and sound generators
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
automatically (see `docs/LIMITATIONS.md`). Two things only work in a development build:

- The ML Kit photo check (`@react-native-ml-kit/image-labeling`).
- Custom alarm sounds in notifications and the notification icon color.

Build a development client locally (Android needs the Android SDK, iOS needs a Mac with Xcode):

```bash
npx expo prebuild
npx expo run:android      # or: npx expo run:ios
```

After the first build, start the dev server for the installed client:

```bash
npx expo start --dev-client
```

Or build in the cloud with EAS (requires an Expo account):

```bash
npx eas-cli@latest build --profile development --platform android
```

`ios/` and `android/` are generated and ignored by git. Re-run `npx expo prebuild --clean`
after changing `app.json` plugins.

To confirm the ML Kit check is active, take a photo of a wall: it is rejected, and a photo of a rug or
floor is accepted with a label such as "Carpet detected". In Expo Go any live photo is accepted.

## Install on your phone (standalone APK)

Expo Go needs your computer running. For daily use, build an APK that runs on its own. You need a free
Expo account (https://expo.dev/signup). Run these once from the project folder:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npm run build:apk
```

`init` links the project to your account and adds a `projectId` to `app.json`; commit that change. The build runs in
Expo's cloud for 10 to 20 minutes and ends with a link and a QR code. Open the link on the phone, download the
`.apk`, and allow "Install unknown apps" for your browser when Android asks. Then:

1. Allow notifications and location.
2. Turn on "Alarms & reminders" for Salah, and exclude it from battery optimisation (see `docs/LIMITATIONS.md`).

To update, pull the latest code, run `npm run build:apk` again and install the new `.apk` over the old one. Your data
stays, because the package name is the same and the build is signed with the same key (EAS keeps it for you).
Profiles live in `eas.json`: `preview` is the installable APK, `development` is a dev client, `production`
is a Play Store bundle.

## More

Start with `AGENTS.md` and `docs/ROADMAP.md`.
