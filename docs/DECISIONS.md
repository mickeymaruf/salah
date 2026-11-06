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

## 2026-11-02 Figma layout kept over safe-area padding

- Context: earlier screens added 8 px under the status bar. The Figma bodies start right under it.
- Decision: remove the extra padding and let each screen's own top row provide spacing as in Figma.
- Consequence: spacing under the status bar now follows the design on every device.

## 2026-11-02 Muted color kept despite contrast

- Context: the brief says to extract real values from Figma and also asks for readable contrast.
- Decision: keep the Figma value and document the ratio.
- Consequence: a known accessibility gap with a roadmap item. It is a one-token change in `colors.ts`.

## 2026-11-02 Prayer times from the Aladhan API, with offline fallback

- Context: the first version used only the on-device `adhan` calculation. The user wanted a live, widely used source.
  The calculation is not static data (it is astronomical, per date), but a published API is easier to compare with
  other apps. The change also reverses the earlier "no network" stance for this one purpose.
- Decision: `api.aladhan.com/v1/calendar/{year}/{month}` is called for this month and the next with the profile's
  coordinates, calculation method and Asr school. Tables are cached in AsyncStorage per month, so later launches work
  offline. If a table is missing (first launch offline, API down, malformed response) `adhan` calculates the times.
- Consequence: no API key. With the same method and school the API and `adhan` use the same formulas, so times should
  agree within a minute or two. Method and Asr choices in Settings pick a different table. The API call sends only
  latitude, longitude, method and school.

## 2026-11-02 Hanafi Asr by default in Bangladesh and similar countries

- Context: Standard Asr in Natore is about 3:00 pm and Hanafi about 3:47 pm. Bangladesh follows the Hanafi school.
- Decision: onboarding picks Hanafi for Bangladesh, Pakistan, India, Afghanistan, Turkey, Uzbekistan and Tajikistan.
- Consequence: existing profiles keep their saved value. Change it in Settings, Asr calculation.

## 2026-11-02 Manual logging: Missed deletes the row

- Context: the brief says missed prayers are derived and never stored. The Figma flow lets the user choose Missed.
- Decision: Prayed writes a row with no photo. Missed deletes the row. Photo is the difference between outlined and filled.
- Consequence: no schema change. A prayer cannot be marked Missed before its time. Choosing Missed for an
  unlogged past prayer changes nothing, which matches how it is already shown.

## 2026-11-02 Which choice is preselected

- Context: Figma frame 10 preselects Prayed (today, unlogged) and frame 11 preselects Missed (a past day).
- Decision: Today always preselects Prayed. Progress preselects the current state when it is missed, otherwise Prayed.
- Consequence: logging a forgotten prayer is one tap plus Save; editing a miss shows it as it is.

## 2026-11-02 Only unlogged rows open the sheet on Today

- Context: the flow note says "tap any prayer that isn't logged".
- Decision: prayed rows on Today are not tappable. Editing a logged prayer is done from Progress.
- Consequence: no accidental changes on the main screen.

## 2026-11-02 Optimistic log updates

- Context: waiting for the database write and a re-query made a saved prayer appear after a visible delay.
- Decision: the store applies the change immediately and writes behind it, rolling back on failure.
  The sheet closes without waiting, and saving the state a prayer already has is skipped.
- Consequence: the UI is instant. If a write fails the screen briefly shows the change and then reverts.

## 2026-11-02 Missed shows a cross on Today

- Context: Today used an empty terracotta ring for missed prayers, which did not look like a choice the user made.
- Decision: missed prayers show a filled terracotta circle with a cross, like the day card.
- Consequence: Today and Progress use the same mark for missed.

## 2026-11-02 One check style, current state preselected

- Context: the outlined check for hand-logged prayers was confusing in use, and reopening a missed prayer showed Prayed selected.
- Decision: all prayed prayers show a filled check. The sheet opens on the prayer's current state. The today bar
  shows missed prayers in red.
- Consequence: the log no longer drives any visual difference between photo and manual entries. The `proof_uri` column is
  still stored. This overrides the outlined-check part of the Figma flow note.

## 2026-11-02 Swipeable tabs

- Context: the user wants to swipe between Today and Progress as well as tap, and have both feel instant.
- Decision: use Expo Router's built-in top tabs (pager) with the bar at the bottom, animation off for taps, lazy with a one-page preload.
- Consequence: adds `react-native-pager-view`, which is included in Expo Go.

## 2026-11-02 Dev seed removed

- Context: the brief asked for a `__DEV__` seed to preview the chart. The user did not want the dev links on the screen.
- Decision: removed the seed, its test and the store's `invalidate`.
- Consequence: the chart can only be previewed with real or hand-logged data.

## 2026-11-02 Day bar segments overlap by 1 px

- Context: five segments of 3.8 px left a faint light line between them on some screens.
- Decision: each segment is positioned absolutely and extends 1 px under the next one.
- Consequence: no seams. Colors still change at the same boundaries.

## 2026-11-03 Manual prayer times are fixed clock times in the profile

- Context: calculated times can differ from the local masjid by a few minutes, and the app has no per-region method.
- Decision: one optional override per prayer, stored in the profile as "HH:mm", applied inside `getDayTimes` on top of the
  API or `adhan` time. Saving a time equal to the calculated minute removes the override. Screens follow Figma
  `2b`, `2c` and `8b` (file Mft9G21t5JL72MOzbkuGo3). Settings has no Save button, as in `8b`; onboarding has one, as in `2b`.
- Consequence: one place decides the time, so nothing else needs to know about edits. An edit is the same clock time every
  day, so it will drift from a masjid timetable through the year (see `docs/LIMITATIONS.md`). Changing the city asks to keep or reset.

## 2026-11-03 Log sheet saves on tap

- Context: choosing Prayed or Missed and then tapping Save was an extra step.
- Decision: tapping an option saves it and closes the sheet. The Save button was removed. Tapping the option that is already true just closes it.
- Consequence: one tap per change. A mistaken tap is fixed by reopening the sheet. This overrides the Save button in the Figma log sheet.

## 2026-11-03 EAS build profiles

- Context: Expo Go needs a running dev server and cannot play custom alarm sounds, so daily use needs a standalone build.
- Decision: `eas.json` has `development` (dev client APK), `preview` (internal APK, used by `npm run build:apk`) and `production`
  (Android App Bundle, auto-incremented). Versions are kept remotely by EAS.
- Consequence: the first build asks for an Expo login and runs `eas init`, which adds `projectId` to `app.json`. The build was not run from
  the sandbox. A standalone build includes the ML Kit native module, so the photo check becomes active (it is off in Expo Go).

## 2026-11-05 Day navigation replaces tab swiping

- Context: the user wanted to move between days on Progress by arrows and swipes, which clashed with swiping between tabs.
- Decision: tab swiping is off (`swipeEnabled: false`). The day card on Progress has arrows and a horizontal swipe. The tab bar content
  is 62 px (was 54) and reads the bottom inset itself.
- Consequence: the pager stays only to keep instant tab switches. Dropping it would mean replacing the navigator.

## 2026-11-05 Future prayers cannot be logged

- Context: an upcoming prayer could be marked prayed from the Progress day card and from the Today list.
- Decision: upcoming prayers are not tappable anywhere and the log sheet offers no choice for them. This overrides the earlier
  rule that Prayed was allowed before the time.
- Consequence: marks made earlier on a future prayer stay until changed to Missed in the Progress day card.

## 2026-11-05 Missed is a choice, not a default

- Context: the user did not want a prayer shown as missed just because nothing was logged. Unmarked should stay empty.
- Decision: `prayer_log` gets an `outcome` column (migration 2, 'prayed' or 'missed', existing rows 'prayed'). A passed prayer with no row is
  `unmarked` (empty circle). Stats and the percentage count only marked prayers. The log sheet gets "Clear mark" to go back to unmarked.
  Alarms and follow-ups still stop only for a prayed row. This replaces the rule that past unlogged prayers count as missed.
- Consequence: history before this change that showed red from nothing now shows empty, and the missed count and percentage change.
  Rows removed earlier by choosing Missed cannot be recovered as missed.

## 2026-11-05 Next prayer is grey, not green

- Context: a green ring with a dot on the next prayer looked like a completed one.
- Decision: the next prayer row has the pale grey highlight (`heat[0]`) and an empty ring with a darker outline.
- Consequence: green now only means prayed.

## 2026-11-05 Catch-up prompt

- Context: the user wanted a full-screen "Did you pray?" prompt on opening the app after a gap (Figma "Proposals · D. Catch-up on open").
- Decision: "unlogged" means no row in `prayer_log`, so a prayer already marked missed is not asked again. "Open" means a cold start or a return
  to the foreground. The queue is limited to the
  last 7 days (`MAX_DAYS_BACK`), because a long absence would otherwise produce hundreds of cards. The Log sheet is unchanged.
- Where the written brief and the Figma frame differ, the brief won: the question reads "Did you pray?" above the prayer name, while Figma P-D1
  puts it below the time. The full-screen result also shows the prayer name under "Prayed" or "Missed", as in Figma P-D3 and P-D5.
- Added `expo-haptics` (version from `bundledNativeModules.json`) for the light tap, `state.missedSoft` (#F2DBD6 from Figma P-D5) as a colour
  token, and the `giant`, `choice` and `ask` type variants.
- Consequence: dragging uses `PanResponder` and `Animated` (no gesture-handler or reanimated is installed). The tap target for each answer is its
  ellipse, not the whole half of the screen.

## 2026-11-05 Catch-up asks on every open

- Context: the first version waited for 4+ hours idle or a new day. The user tested it by clearing marks and reopening, saw nothing, and
  said it should ask immediately and on every reopen while a passed prayer is unmarked.
- Decision: removed the idle and new-day condition and the stored last-use time. Every open with an unlogged passed prayer shows the prompt.
  Opening the app because onboarding just finished does not count as an open.
- Consequence: someone who closes the prompt with the back button is asked again on the next open. Briefly leaving and returning to the app
  also asks again. A user who onboards in the afternoon is asked about that morning's prayers at the next open.

## 2026-11-05 Today rows are editable once marked; calmer Catch-up animation

- Context: prayed rows on Today did nothing when tapped, so a mistaken mark could only be fixed from Progress. The Catch-up colour growth felt abrupt.
- Decision: every Today row whose time has come opens the log sheet, whatever its state (the sheet offers Prayed, Missed and Clear mark).
  Catch-up timings were slowed: grow 350 to 600 ms, result fade 150 to 300 ms, hold 400 to 600 ms, dissolve 250 to 450 ms, with a gentler curve
  (cubic-bezier 0.33, 0, 0.2, 1). This replaces the 350 ms ease-out in the original brief.
- Consequence: one answer now takes about 2 seconds from tap to the next question.

## 2026-11-05 Today redesign and where the brief and the app disagree

- Context: the user asked for a redesigned Today screen and a Catch-up prompt, listing Figma frames and saying Figma wins over the text. Some of the
  text repeated earlier requirements that the user had since changed, so those were kept as the user last decided them.
- Decision (kept from the user's later requests, not the text): Catch-up shows on every open while a passed prayer is unmarked, not only after 4 hours
  or a new day; tapping a marked pill on Today opens the log sheet, which now has no Save button (a choice saves on tap) and has Clear mark.
- Decision (Figma over text): Catch-up reads name, time, then "Did you pray?" (P-D1); the hero countdown is 16 px, not 15; the ring ends rest on the sheet.
  The pill fills are the Figma values (#BCCAC5, #EFEEED) and the missed fill is the 40% terracotta calculation (#EBC7C0), since Figma draws it as a circle.
- Decision: the Today screen no longer shows the day bar or "N of 5 prayed today"; the old list, next-prayer block and day bar components were removed.
  `getNextPrayer` was removed with them. The Verified screen takes its "Next" line from the prayer window.
- Decision: the hero picture cannot be downloaded from the build environment, so the user supplied the Figma image. `assets/images/today-hero.png` is that
  picture run through `scripts/prepare-hero.js` (saturation x0.45, contrast -5%). The hero text uses Figma's line heights (48, 27, 19) so Android lays it out the same.
- Consequence: the Catch-up animation timings stay at the slower values the user asked for earlier, not the 350 ms in the brief.
- Decision: the pop sound has its own setting, `markSound` ("Sound when marking a prayer", default on), because the app had no general sound switch to
  respect. It only controls the pop; confetti and haptics always play. The pop is a synthesised tone (`scripts/make-pop.js`), like the alarm tones.
- Decision: Catch-up on open is switched off (`CATCH_UP_ENABLED = false`) because Today's one-tap buttons and date arrows now cover logging past prayers.
  The code stays so it can be turned back on or removed later.
- Decision: the date picker is a custom month grid in its own bottom sheet, not the native picker, to match the Figma look. The device's first weekday comes
  from `expo-localization` (added at the version in `bundledNativeModules.json`). Future days are unreachable by the picker and by the next arrow.
- Decision: the app font is DM Sans (Regular, Medium, Semi Bold from `@expo-google-fonts/dm-sans`), replacing Inter and then Plus Jakarta Sans, everywhere. The user chose
  it from the Figma variants "3 · Today · Plus Jakarta Sans / DM Sans / Manrope / Outfit" (the DM Sans one is 18019:271, same layout, only the font differs). All text
  takes its family from the `fontFamily` tokens in `src/shared/theme/typography.ts`, so there is one place to change it. The fixed line heights set in the hero were left
  as they are.
- Decision: the app font is Plus Jakarta Sans (Regular, Medium, Semi Bold from `@expo-google-fonts/plus-jakarta-sans`), replacing DM Sans, everywhere, on the user's
  latest request. Every text style takes its family from the `fontFamily` tokens in `src/shared/theme/typography.ts`. Its letters are a little wider than DM Sans, so
  check long names and the fixed-height hero lines on a device.
- Decision: Catch-up on open is deleted (`src/features/catch-up/`, `app/catch-up.tsx`, its hook in `app/_layout.tsx`, and the text styles and colour only it used), at the
  user's request, because it is no longer needed. The earlier Catch-up entries above stay as history. Today's one-tap buttons and date picker are how past prayers get logged.
- Decision: the Today ✕ and ✓ buttons use the original 3D pictures from Figma, not a redraw. The user supplied the Illustrator SVGs, which only wrap one 1024 px PNG each, so
  `scripts/prepare-buttons.js` extracts and crops that PNG into 1x, 2x and 3x files instead of embedding 1 MB SVGs in the app.
- Decision: the Today pills keep the app's roomier size (76 px high, 12 px gaps, 16 px button insets, name 18 px, time 15 px) over Figma's 64 px, at the user's request. The 26 px gap under the date row, the 3D buttons and the hero sizes still follow Figma.
- Decision: the Today ✕ and ✓ buttons use the 3D pictures again, at the user's request, replacing the flat tinted tiles tried from Figma frame 18047:13. This supersedes that entry's reversal; the pictures and `scripts/prepare-buttons.js` are in use again.
- Decision: the Today hero (ring, hero height, picture, sparkles) scales with the screen width relative to Figma's 390 px frame (`heroScale`, 0.85 to 1.4), because on the user's wider Poco F1 the fixed 320 px ring looked small and too far from the edges. Text stays at Figma's sizes. Check on the device.
- Decision: the Today hero is shorter: the gap between the greeting and the ring is 26 px, equal to the gap under the date row (was about 43 px), at the user's request. The hero height is now the ring radius plus a fixed amount (`heroHeight`) instead of a scaled 246 px.
- Decision: the Today prayer sheet's top corners are 32 px (`radii.sheet`), up from Figma's 20, at the user's request ("more cornered"). Change the token to adjust.
