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

## 2026-11-02 Log queries live in the prayer-times feature

- Context: the brief puts only "sqlite open + migrations" in `shared/db`.
- Decision: connection and migrations stay in `shared/db`. Prayer log queries sit in
  `features/prayer-times/data` because they depend on `PrayerName`.
- Consequence: proof and progress import log functions from the prayer-times feature.

## 2026-11-02 First completion wins

- Context: a notification can be tapped twice, or proof retaken.
- Decision: `INSERT OR IGNORE` on the `(date, prayer)` key.
- Consequence: completion time and proof photo never change after the first write. SQLite also skips
  rows that violate the CHECK constraint instead of raising an error.

## 2026-11-02 Synthesized alarm sounds

- Context: no network to fetch audio and no licensed adhan recording in the repository.
- Decision: generate three 4-second tones (chime, bell, soft) with a script. Default is `chime`.
- Consequence: the alarm works offline in all environments. The Figma label "Adhan" is replaced by the tone names.

## 2026-11-02 Cancel and reschedule on every change

- Context: ids are deterministic, but cancelling individual follow-ups is fragile when settings change.
- Decision: `syncAlarms` cancels all scheduled notifications and rebuilds the plan. Runs are queued.
- Consequence: a few dozen native calls per sync. Simple and always consistent with the log and settings.

## 2026-11-02 Alarm cannot be dismissed without proof

- Context: the brief says the alarm continues until proof is shown.
- Decision: the alarm screen blocks Android back and iOS swipe-down. Sound keeps playing under the camera.
- Consequence: the only exits are proof, "Require photo proof" off, or closing the app.

## 2026-11-02 Notification permission is requested in onboarding

- Context: the alarm needs it from day one, and the onboarding copy already explains the alarm.
- Decision: ask right after location is confirmed. A refusal does not block the app.
- Consequence: a denied permission is handled in the polish pass (banner on Today and in Settings).

## 2026-11-02 "Live" means registered by the camera screen

- Context: the brief forbids gallery picking and wants a photo taken live in this session.
- Decision: no image picker is installed. The camera screen registers every URI it creates and the live verifier
  accepts only those.
- Consequence: route params and stored URIs cannot be used to fake proof. The check is app-level, not tamper-proof.

## 2026-11-02 Verified screen reads the log

- Context: the verified screen needs the completion time and the stored photo.
- Decision: it reads the day's log entry. Only the verifier label travels as a route param, because the log has no column for it.
- Consequence: the table matches the data model in the brief.

## 2026-11-02 Profile gets `startedOn`

- Context: without a start date a new user sees about 300 missed days and a near-zero percentage.
- Decision: add the optional field `startedOn` to the profile, set at the end of onboarding. Earlier days are untracked.
- Consequence: a small addition to the data model in the brief. The progress numbers describe the time the app was used.

## 2026-11-02 Past days are derived without prayer times

- Context: computing 365 days of times on every render is wasteful.
- Decision: a past day's unlogged prayers are missed. Future days are upcoming. Only today uses the live clock.
- Consequence: one SQL query plus plain arrays. A prayer on the last evening of a day cannot be wrongly "upcoming".

## 2026-11-02 Detail card follows today until a day is tapped

- Context: Figma shows a selected day (Fri, 23 Oct) but does not say how the default is chosen.
- Decision: default to today, switch to the tapped day, and outline the selected bar.
- Consequence: the card is useful on first open and stays on the tapped day after that.

## 2026-11-02 Pickers are bottom sheets

- Context: Figma shows rows with a chevron and a value but no picker design.
- Decision: rows open a bottom sheet with radio options. Name editing uses a small sheet with a text field.
- Consequence: one `OptionSheet` serves four settings. No new dependency.

## 2026-11-02 Privacy and Help text

- Context: the brief allows static text screens.
- Decision: write them from what the app does today: no account, no analytics, on-device photos.
- Consequence: the text must be updated when behavior changes, for example if a verifier ever sent data off the device.

## 2026-11-02 Logo redrawn in code

- Context: Figma asset downloads were blocked, so the logo SVG could not be fetched.
- Decision: redraw the mark (arch with a crescent) from the Figma screenshot as two SVG paths in `logo.json`.
  The crescent is a true path (outer circle minus inner circle) so it can be cut out for monochrome icons.
- Consequence: proportions match the Figma board closely, but the curves are not pixel-identical. Replace
  `logo.json` with the exported paths when the original SVG is available.

## 2026-11-02 Splash mark is centered, not the whole lockup

- Context: Figma centers mark and wordmark together. The native splash can only show an image without text.
- Decision: center the mark box on the screen in both splashes and place the wordmark below it.
- Consequence: no jump between native and in-app splash. The mark sits about 40 px above where Figma puts it.

## 2026-11-02 No background audio mode

- Context: the scaffold configured iOS background audio for the alarm.
- Decision: removed. The alarm sound plays only while the app is open; closed apps rely on notification sounds.
- Consequence: fewer App Store review questions.

## 2026-11-02 ML Kit failure never blocks a prayer

- Context: the labeler is a native module that could fail to load or crash on a device model.
- Decision: if the labeler throws, accept the photo on the live-capture result.
- Consequence: a broken model weakens the check but never traps the user in the alarm.

## 2026-11-02 Broad label list

- Context: the brief lists prayer mats, rugs, mosques, carpet, floor, room.
- Decision: match whole words from that list with confidence 0.5 or more.
- Consequence: low false rejections for real prayer spaces and a loose check overall. See `docs/LIMITATIONS.md`.
