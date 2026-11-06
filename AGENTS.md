# Working agreement

Read `docs/ROADMAP.md` first. It says what is done and what is next.
Read `docs/DECISIONS.md` before changing a stack or architecture choice.

## Stack

Expo SDK 58, TypeScript strict, Expo Router, plain `StyleSheet`, zustand (profile
and settings only), `expo-sqlite` (prayer log), AsyncStorage (profile, settings),
Aladhan API with `adhan` as offline fallback (prayer times), `expo-location`, `expo-localization` (first day of the week), `expo-notifications`,
`expo-audio`, `expo-camera`, `lucide-react-native`, Plus Jakarta Sans via `@expo-google-fonts`.
No backend, auth, analytics, i18n, Redux, or styling library. The only network call is the Aladhan times API.

## Structure

- `app/` routes only. Keep files thin: import a screen from `src/features/*`.
- `src/features/<name>/` holds screens, hooks, plain logic and tests for one feature.
- `src/shared/` holds code used by two or more features (ui, theme, db, lib).
- Business logic is plain functions with no React imports, so Jest can test it.

## Conventions

- Colors, spacing, radii and type come from `src/shared/theme`. No hex values in components.
- "Now" and "today" come from `src/shared/lib/date.ts`. Never call `new Date()` elsewhere for that.
- No `any`. No commented-out code. No TODO comments: put unfinished work in `docs/ROADMAP.md`.
- Add a helper to `shared/` only when a second feature needs it.
- Touch targets are at least 44px. Icon-only buttons have an `accessibilityLabel`.
- Install packages with `npx expo install <pkg>` when the network allows it.
  Otherwise use the version from `node_modules/expo/bundledNativeModules.json`.

## Before every commit

```bash
npx tsc --noEmit
npm run lint
npx jest
```

After dependency changes run `npx expo-doctor`. Before the final commit run
`npx expo export --platform android` and confirm it bundles.

## Commits

One commit per finished feature (code, tests, docs together).
Conventional subjects: `feat(alarm): ...`, `chore: ...`, `docs: ...`.
Body: two or three plain lines on what and why. Do not rewrite history.

## Where to find what

| Need | Look at |
|---|---|
| Design tokens | `src/shared/theme/` |
| How pieces connect | `docs/ARCHITECTURE.md` |
| Why a choice was made | `docs/DECISIONS.md` |
| Platform limits | `docs/LIMITATIONS.md` |
| What each feature owns | `docs/FEATURES.md` |
| Design source | Figma file referenced in `docs/DECISIONS.md` |
