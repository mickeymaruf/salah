# Decisions

Format: date, title, context, decision, consequence.

## 2026-11-02 Stack

- Context: offline prayer tracker, no backend, must run in Expo Go.
- Decision: Expo SDK 58, TypeScript strict, Expo Router, plain `StyleSheet`, zustand
  for profile and settings, `expo-sqlite` for the prayer log, AsyncStorage for profile and
  settings, `adhan` for times, `expo-notifications` for alarms, `expo-camera` for proof.
- Consequence: no network dependency at runtime. Native-only features need fallbacks in Expo Go.

## 2026-11-02 Routes live in root `app/`

- Context: Expo's template guidance suggests `src/app/`. The project brief fixes `app/` at the root.
- Decision: use root `app/` for routes and `src/` for features and shared code. Alias `@/` points to `src/`.
- Consequence: Expo Router finds `app/` automatically because `src/app/` does not exist.

## 2026-11-02 Alarm design

- Context: iOS has no alarm API for normal apps. Android full-screen alarms need native code.
- Decision: schedule local notifications for the next 7 days, plus up to 5 follow-ups every
  3 minutes per prayer. Cancel follow-ups when the prayer is verified. The alarm screen loops sound while open.
- Consequence: the alarm is persistent but not unstoppable. See `docs/LIMITATIONS.md`.

## 2026-11-02 Proof verification

- Context: on-device image labeling needs a native module, which Expo Go lacks.
- Decision: `ProofVerifier` interface with two implementations. `liveCaptureVerifier` is the default
  (live camera photo only, no gallery). `mlKitVerifier` is used only when the native module exists.
- Consequence: v1 proves a photo was taken, not what it shows.

## 2026-11-02 Dates

- Context: day boundaries must follow the device's local date and be testable.
- Decision: all "now" and "today" logic goes through `src/shared/lib/date.ts` with an injectable clock.
- Consequence: tests set a fixed clock. Date keys are local `YYYY-MM-DD`, never UTC.

## 2026-11-02 Package versions without the Expo API

- Context: `npx expo install` could not reach the Expo API from the build environment.
- Decision: install with `npm install` using versions from `expo/bundledNativeModules.json`.
- Consequence: `react-dom@19.3.0` is pinned to satisfy a peer dependency of Expo Router. Run
  `npx expo install --check` on a networked machine to confirm versions.

## 2026-11-02 Design tokens

- Context: Figma variables were read from frame code. Values match the fallback token set in the brief.
- Decision: tokens live in `src/shared/theme/`. Extra camera colors (`#0A0D0B`, `#29332E`, `#121714`,
  `#1A211C`) are taken from the Proof camera and Verified frames.
- Consequence: components never contain hex values.
  Figma file: https://www.figma.com/design/TjJtgEU8HFJ3FEVaLqtNQX/

## 2026-11-02 Profile state lives in `src/shared/state/`

- Context: onboarding writes the profile, prayer-times and settings read it.
- Decision: zustand stores for profile (and later settings) sit in `src/shared/state/`, with pure
  parsing in `profile.ts` so it can be tested without AsyncStorage.
- Consequence: features import the store from shared, never from each other.

## 2026-11-02 Onboarding location is two taps

- Context: Figma shows the detected city and times on the same screen as the permission button.
- Decision: the first tap requests permission and detects. The card then shows the city and times and
  the button becomes "Continue". If permission was already granted, detection starts on mount.
- Consequence: the user sees their times before committing. Denied and blocked states show a retry or an
  "Open settings" button.

## 2026-11-02 Typed routes off

- Context: typed routes need generated `.expo/types`, which break `tsc` on a fresh clone before `expo start`.
- Decision: leave `experiments.typedRoutes` off.
- Consequence: hrefs are plain strings.
