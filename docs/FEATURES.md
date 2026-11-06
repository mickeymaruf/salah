# Features

Shipped features, what they do, who owns the code, how to extend them.

## Scaffold

- Owns: `app/_layout.tsx`, `src/shared/theme/`, `src/shared/ui/`, `src/shared/lib/date.ts`.
- Theme: all colors, spacing, radii and type styles. Add a token there before using it.
- UI: `Screen`, `Text`, `Button`, `Card`, `Toggle`. Extend by adding props, not new wrappers.
- Date: `now()` reads an injectable clock. Use `setClock` in tests.

## Onboarding

- What: name screen, then location screen. Location permission is requested once, the city is
  reverse-geocoded, and the five times for today are shown before the user continues.
  The profile is saved to AsyncStorage and the user lands on Today.
- Owns: `src/features/onboarding/` (screens, `useLocationStep`), `src/features/prayer-times/calculate.ts`
  and `location.ts`, `src/shared/state/profile.ts` and `profileStore.ts`, `app/(onboarding)/`, `app/_layout.tsx`.
- Route guard: `Stack.Protected` in `app/_layout.tsx`. No profile means onboarding only. A profile means the app only.
- Extend: add a profile field in `profile.ts` (type and `parseProfile`), then edit it from Settings.
  Permission states are `idle`, `detecting`, `ready`, `denied`, `blocked`, `error` in `useLocationStep`.

## Prayer times and Today

- What: computes today's five times offline (or from the Aladhan table) and shows them on the redesigned Today screen. Figma: file
  Kte116ut3xe8wHx5PLDZJT (earlier copies: OgLgPUUPDO1UindTOIu39O), frame "3 · Today" (14017:14), "Storyboard · marking a prayer" (14018:20)
  and "Confetti · on tick" (18007:14).
- Hero: a misty mosque picture behind the top, "Assalamu alaikum, <name>" (22 px Semi Bold, one line, no date) at the left and the user button
  at the right, two faint sparkles (the top one is 32 px, Figma has 38). The prayer in progress sits inside a half circle of 3.5 px dots about 9 px apart: green for the part of the
  window that has passed, pale grey for the rest, a green end dot with a 3 px white border. Inside: the prayer name (40 px), a live countdown to
  the next prayer (32 px, as a clock, "01:12:06", "00:42:06", "00:00:06", seconds in muted grey, updated every second) and "until Maghrib". At 0 the name and
  countdown move to the next prayer. The text block sits at the bottom of the hero, so it clears the sheet whatever the font's line height.
- Sheet: white, full width, top corners 20 px. The top row is the date navigator (12 px from the top of the sheet; the first pill starts 26 px below it,
  Figma 14030:14): a 40 px arrow on each side and the long date with "Today",
  "Yesterday" or "3 days ago" under it. The arrows go back a year and stop at today: a future day cannot be reached, because a prayer that has not
  come cannot be logged. A past day is edited like today (✓ / ✕ / marked fill, and the log sheet on a marked pill). The hero always shows the real
  current prayer, whatever day the list shows.
- Date picker: tapping the date opens a calendar bottom sheet (`CalendarSheet.tsx`, pure grid maths in `calendar.ts`). It is a plain month grid,
  because the native Android picker is a dialog that cannot be styled this way. Figma 18011:272: scrim 42%, white sheet with 24 px top corners and
  a soft shadow, a 40 x 4 grabber, about 420 px high. Header: month and year (20 px Semi Bold), then a 76 x 40 "Today" button (bg/base fill, 12 px
  radius, 14 px Medium green label) and the 40 px previous and next month buttons 8 px apart (next stops at the current month, previous at a year
  back). Weekday letters (12 px Medium) sit at y 86 and the day rows are 58 px apart. Weekday letters start on the device's first weekday (`expo-localization`, Sunday when unknown). 40 px round day cells: the
  selected day is a green circle with a white number, today a thin green ring, days after today at 55% and not selectable, no dots or marks.
  The Today button selects today. It opens on the shown date's month with that day selected; tapping a day selects it, then after 150 ms shows that
  day on Today and closes. Swiping down, the scrim and the back button close it without changing the date. Slides up in 320 ms (ease-out) and back
  in 240 ms; with reduce motion it fades. Each day is a button labelled like "Monday 26 October", with its selected state announced. The arrows
  beside the date and the calendar share one picked day, so they stay in sync.
  Left of the pills (x = 24) a timeline runs: green dots and green line for prayers whose time has passed, a larger haloed dot for the one in progress
  (only when the list shows today and that prayer started today), hollow dots on the grey line for those to come (`timeline.ts`).
- Pills: 322 px wide (48 px from the left to leave room for the timeline, 20 from the right), 76 px high, 12 px apart, 16 radius, the first one 26 px below the date
  row (as in Figma), 34 px of space under the last. The name (18 px Semi Bold) and time (15 px) start at 84 px, 24 px once marked, and are centred vertically. The buttons
  are 16 px from each edge. This is the roomier size the user calls "our padding"; Figma 14017:14 has 64 px pills with 8 px gaps, and the app deliberately differs. The
  tab bar's inactive label is Medium weight; the active one is Semi Bold. The pill size has been 66, 76 and 64 px as the user and Figma changed: 76 px is current.
- Sheet: the prayer sheet has 20 px top corners (`radii.sheet`, as in Figma).
- Pill: each button is a round 38 px picture, the 3D cross (orange-red) or check (dark green) from Figma (14034:15 and 14034:31), inside a 44 px touch area, 16 px from the pill's edge. The Illustrator export is a 38 px SVG that only wraps one 1024 px PNG (150% of the button, shifted 25%), so the app uses that PNG cropped as the SVG shows it and shipped at 1x, 2x and 3x (`assets/images/button-missed.png` and `button-prayed.png`, made by `node scripts/prepare-buttons.js Missed_button.svg Prayed_button.svg`). Faint icons of the prayer
  sit behind (sunrise, sun, cloud-sun, sunset, moon; green once the time has come, grey before). The prayer in progress has a warm grey fill. Prayers not yet due are dimmed and do nothing.
- Marking: one tap on the check or cross, saved at once, with a light haptic. A circle in the final fill colour starts at the middle of the tapped
  button, reaches just past the far corner (`markGeometry.ts`) and grows in scale only, 0 to 1 in 520 ms (cubic-bezier 0.45, 0, 0.2, 1). Over the
  same time the buttons fade and shrink (180 ms from 0 ms) and the name and time slide to 24 px from the left (320 ms from 120 ms, ease-out).
  When the circle has covered the pill, the pill takes that colour as its real background and the circle is removed in the same frame, so the swap
  is invisible: the animation values are reset only after the filled pill has been drawn, never in the finish callback. Prayed is brand/green 30% over white, missed is terracotta 40%. Other pills stay tappable while one plays. With reduce motion on, a
  150 ms cross-fade to the final colour. Tapping a marked pill opens the log sheet to change or clear the mark (the user chose to keep it).
- Confetti and sound (only for a check): a burst from the middle of the check button, 30 to 36 pieces (6 px dots, 6x11 px blocks, 3x13 px strips in the
  five Figma colours) fanning up over 150 degrees, flying 35 to 130 px with spin and gravity and fading in about 1 s, drawn in a touch-transparent
  layer above the list with transform and opacity only (`src/shared/feedback/`). When the check completes a day (the other four already prayed) there
  are twice the pieces and it lasts 1.4 s. With reduce motion on, one soft green pulse replaces the confetti. A soft pop (`assets/sounds/pop.wav`, made by
  `node scripts/make-pop.js`, preloaded) plays with every check, follows the silent switch and the Settings switch "Sound when marking a prayer";
  confetti and the light haptic play whether sound is on or off. A cross has no confetti and no sound.
- Owns: `src/features/prayer-times/` (`calculate.ts`, `schedule.ts`, `window.ts` for the prayer in progress and the ring maths,
  `dayNav.ts`, `calendar.ts`, `firstWeekday.ts` and `timeline.ts` for the date arrows, the calendar and the timeline, `useTodayView.ts`, `TodayScreen.tsx`, `components/`: `TodayHero`,
  `HeroBackdrop`, `PrayerSheet`, `DateNavigator`, `ArrowButton`, `CalendarSheet`, `Timeline`, `PrayerPill`, `ChoiceButton`, `PrayerParticles`), `src/shared/lib/useNow.ts`, `app/(tabs)/`.
- Hero scaling: Figma's Today frame is 390 px wide. The hero height is `heroHeight`: the ring radius plus a fixed amount, so the visible gap under the greeting is always 32 px (`SECTION_GAP`). The gap from the date text to the first pill is the same 32 px (first pill 27 px below the date row, whose text ends about 5 px above the row's bottom). `heroScale.ts` (width / 390, limited to 0.85 to 1.4) scales the ring radius, the hero height, the picture and the sparkles, so a wider phone keeps the ring's share of the screen and its distance from the edges. Text sizes and the 24 px side insets do not scale.
- Hero picture: `assets/images/today-hero.png`, made by `node scripts/prepare-hero.js <figma export>` (saturation x0.45, contrast -5%). Without
  an argument the script draws a plain stand-in. The current file is the real picture for Figma node 14018:15, supplied by the user.
- Rules in `schedule.ts`: the user's choice (prayed or missed) wins. With no choice, a passed time is unmarked (an empty circle, never
  counted as missed) and a future time is upcoming.
- Extend: a new calculation option goes in `calculate.ts` and `src/shared/state/profile.ts`.

## Prayer log (SQLite)

- What: stores one row per completed prayer. Missed prayers are derived, never stored.
- Owns: `src/shared/db/` (`database.ts` opens one connection and runs migrations, `migrations.ts`),
  `src/features/prayer-times/data/` (`prayerLog.ts` queries, `prayerLogStore.ts` revision counter,
  `usePrayedOn.ts` hook).
- API: `markPrayed(date, prayer, proofUri)` keeps the first completion. `getDay`, `getRange`, `getYear(year)`.
  Writes go through `usePrayerLogStore().mark(...)` so open screens re-query.
- Extend: append a SQL string to `MIGRATIONS`. Never edit an existing entry.

## Alarm

- What: schedules local notifications for each prayer for 7 days, with a reminder before and up to 5
  follow-ups every 3 minutes. Tapping a prayer or follow-up opens `/alarm`, a full-screen dark screen that
  loops a sound until the prayer is marked. With "Require photo proof" on, the only action is "Take photo".
  With it off, the action is "Mark as prayed".
- Owns: `src/features/alarm/` (`schedule.ts` planner, `scheduler.ts` native scheduling, `channels.ts`,
  `permission.ts`, `useAlarmSync.ts`, `useNotificationRouting.ts`, `useAlarmSound.ts`, `AlarmScreen.tsx`),
  `src/shared/state/settings.ts` and `settingsStore.ts`, `assets/sounds/`, `scripts/generate-sounds.js`, `app/alarm.tsx`.
- When it syncs: app start, profile or settings change, every log write, every return to the foreground.
  Each sync cancels everything and schedules again. Ids are `<date>-<prayer>-<kind><n>`.
- Extend: change counts or spacing in `schedule.ts` (`DAYS_AHEAD`, `FOLLOW_UP_COUNT`, `FOLLOW_UP_MINUTES`).
  Add a sound by adding it to `generate-sounds.js`, `ALARM_SOUNDS`, `SOURCES` in `useAlarmSound.ts`, and the
  `sounds` list of the notifications plugin in `app.json`.

## Proof

- What: the live camera screen (`/proof`), a verifier, and the confirmation screen (`/verified`).
  A photo taken in the session is accepted, copied to the document directory, and the prayer is logged
  with its path. Logging bumps the log revision, which reschedules alarms without that prayer and stops the
  alarm sound. "Done" returns to Today.
- Owns: `src/features/proof/` (`verifier.ts`, `proofStorage.ts`, `useProofSubmit.ts`, `ProofCameraScreen.tsx`,
  `VerifiedScreen.tsx`, `components/`), `app/proof.tsx`, `app/verified.tsx`.
- The interface: `ProofVerifier.verify(photoUri) => { ok, label? }`. `getVerifier()` picks the implementation.
- No gallery access exists anywhere. The camera screen registers each capture with `registerLiveCapture`,
  and `liveCaptureVerifier` accepts only registered URIs.
- Extend: add a verifier and return it from `getVerifier()`. A rejected photo shows a retry hint on the camera screen.

## Progress

- What: one screen for the whole year (Figma 18035:16, "P-D3 · Year · 3D icons", second version). A "Your year / 2026" header with the user button. Three round white pills
  (32 px corners) with 40 px 3D icons: Prayed (3D check), Missed (3D cross, red number) and Streak (3D flame, best streak in days). Pictures: `assets/images/stat-prayed.png`, `stat-missed.png` and `stat-streak.png`, the whole 3D picture with its shadow (made by
  `node scripts/prepare-stat-icons.js prayed=Prayed_button.svg missed=Missed_button.svg streak=Icon.svg`). Today's round buttons use a tighter crop of the same art.
  Below, the year chart in a card: day numbers 1 to 31 above the columns (the selected day's number is dark, they scroll with the grid), then 12 month rows by up to 31 day columns, each day a bar of 5 segments of 5.4 px (27 px high, Fajr on top): green prayed (`chart.prayed` #1B6B33), red-orange missed (`chart.missed` #E4583C), pale upcoming (`chart.upcoming`). The scrollbar track is `line.soft`. The grid
  scrolls horizontally with a thin custom scrollbar and opens with today at the right edge. Month letters stay fixed on the left. Tapping a day shows its five prayers in the day card
  (20 px corners): previous and next arrows around the date, "4 of 5 prayed", and five 28 px round 3D marks (the Today button pictures) with the prayer names (a missed prayer's name is red; a prayer not yet marked is an empty ring). Swiping the card also moves to the next or previous day.
  There is no percent card, legend or hint line: the second Figma version dropped them. The arrows and day numbers are the app's own and were added to Figma later.
- Owns: `src/features/progress/` (`model.ts` builds the grid, `stats.ts`, `useYearProgress.ts`,
  `ProgressScreen.tsx`, `components/`), `app/(tabs)/progress.tsx`.
- Data: one query for the year (`getYear`). Past days need no prayer times: no row means unmarked. Only today
  uses the clock. Days before the start date are "untracked": drawn pale and excluded from every number.
  The start date is `profile.startedOn`, or the first logged day if that is earlier.
- Stats count prayers the user marked prayed or missed. Unmarked ones are left out of the percentage. Best streak is the longest run of consecutive days with
  all five prayed.
- Extend: a new state needs a color in `DayBar.tsx`, a case in `model.ts`, and a mark in `DayDetail.tsx`. The pills are `components/StatPills.tsx`.

## Settings

- What: reached from the user icon on Today and Progress. Profile card with name edit. Prayer times: refresh
  location, calculation method, Asr method. Alarm: sound (plays a 2.5 s preview), require photo proof, a switch for the soft pop when a prayer is marked as prayed,
  reminder before. About: Privacy and Help pages (static text).
- Owns: `src/features/settings/` (`SettingsScreen.tsx`, `options.ts` labels, `useRefreshLocation.ts`,
  `components/`, `PrivacyScreen.tsx`, `HelpScreen.tsx`), `src/shared/ui/ScreenHeader.tsx`,
  `src/features/alarm/previewSound.ts`, `app/settings.tsx`, `app/privacy.tsx`, `app/help.tsx`.
- Every change writes to a zustand store. `useAlarmSync` sees the new profile or settings and reschedules, and
  Today and Progress recompute from the new profile.
- Extend: add a row in `SettingsScreen.tsx`. For a list of choices add a label map to `options.ts` and an `OptionSheet`.

## Splash and branding

- What: a native splash (dark green with the mark and two rings) that hands over to an in-app splash with the
  "Salah" wordmark and the tagline, held for at least 0.9 s. App icon, Android adaptive and monochrome icons,
  notification icon and favicon are drawn from the same logo geometry.
- Owns: `src/shared/ui/logo.json` (geometry), `LogoMark.tsx`, `SplashView.tsx`, `scripts/generate-icons.js`,
  `assets/*.png`, the splash and notification entries in `app.json`, the splash hold in `app/_layout.tsx`.
- Extend: change the shape in `logo.json`, then run `node scripts/generate-icons.js` to rewrite every PNG.
  The adaptive icon background is a color in `app.json`, so there is no background image.

## ML Kit verifier

- What: on-device image labeling. A live photo is accepted when ML Kit returns a label such as Carpet, Floor,
  Room, Mosque, Place of worship, Rug or Mat with confidence 0.5 or more. The label appears on the verified screen
  ("Carpet detected"). Without the native module the live-capture verifier is used.
- Owns: `src/features/proof/mlKit.ts` (module detection), `mlKitVerifier.ts` (composition and fallback),
  `mlKitLabels.ts` (label matching), `getVerifier()` in `verifier.ts`.
- Order of checks: live-capture first, then labels. If the labeler throws, the live result stands.
- Extend: edit `KEYWORDS` and `MIN_CONFIDENCE` in `mlKitLabels.ts`. Another model goes behind the same `ImageLabeler` type.

## Polish

- Notifications denied: Today shows an "Alarms are off" notice that asks again or opens system settings.
  Settings has a "Notifications" row with the same behavior. The status is re-checked when the app returns to the foreground.
- Permission states elsewhere: location (denied, blocked, error) in onboarding and Settings, camera (allow or open settings).
- Empty states: Progress shows a dash and "Pray today to start your year" before anything is tracked.
- Errors: `ErrorBoundary` from Expo Router on the root layout, and `app/+not-found.tsx` sends unknown links to `/`.
- Layout: top padding follows the safe area exactly as in the Figma frames. The tab bar is 54 plus the bottom inset.
  Prayer rows use a minimum height so large system text grows them. Display texts cap font scaling at 1.1, others at 1.4.

## Prayer time source

- What: `getDayTimes` returns times from the downloaded monthly table when there is one, otherwise from `adhan`.
  `useTimesSync` (started in `app/_layout.tsx`) loads this and next month on launch, profile change and foreground.
  A new table bumps `useTimesStore.revision`, which recomputes Today, Progress and the alarm schedule.
- Owns: `src/features/prayer-times/data/` (`aladhan.ts` URL and parsing, `timesMemory.ts` lookup,
  `timesCache.ts` storage and download, `useTimesSync.ts`), `calculateDayTimes` and `getDayTimes` in `calculate.ts`.
- Extend: another provider needs a URL builder and a parser that returns `Record<dateKey, DayTimes>`.

## Manual logging

- What: one bottom sheet (`LogPrayerSheet`) with Prayed or Missed. Tapping one saves it and closes the sheet (no Save button). Two entry points:
  Today (tap a marked pill; unmarked pills use their own check and cross buttons) and Progress (tap a day in the chart, then a prayer in the day card).
  Past days can be edited with no limit on how far back. Future days cannot.
- Rules (`logChoice.ts`): both choices are stored in `prayer_log.outcome` ('prayed' or 'missed'). Prayed has no photo when
  chosen by hand. A prayer with no row is unmarked and shows an empty circle. "Clear mark" in the sheet returns a marked
  prayer to unmarked. A prayer whose time has not come cannot be marked at all. Existing photo-verified rows are kept when
  Prayed is saved again.
- Marks: every prayed prayer shows a filled green check, whether it was logged by hand or verified with a photo.
  Missed shows a filled terracotta cross. The outlined check from the Figma flow was dropped on request, along with
  the explanatory note in the sheet.
- The sheet opens on the choice made before (nothing selected for an unmarked prayer).
- Owns: `src/features/prayer-times/components/LogPrayerSheet.tsx`, `logChoice.ts`, `data/useSaveChoice.ts`,
  `markPrayed`, `markMissed` and `clearMark` in the log, `manual` on `DayCell` in `src/features/progress/model.ts`.
- Hint under the day card: "Tap a prayer to mark it done or missed".

## Bottom sheets

- `BottomSheet` in `src/shared/ui/BottomSheet.tsx` is the one sheet used by the log-a-prayer sheet and the two
  Settings pickers. It is translucent under the status bar and navigation bar, so its scrim covers the whole
  window on any device. The scrim sits behind the sheet, so the rounded 32 px top corners show dimmed content, not
  the page. Mount it to open. Its children receive `close`, which slides the sheet out (200 ms) before the parent unmounts it;
  opening takes 280 ms. One native-driven value moves the sheet by its measured height and fades the scrim.

## Tab swiping

- Today and Progress are pages of one pager (`expo-router/js-top-tabs`, `react-native-pager-view`). Swiping between them is
  off; tap the bottom bar. Taps switch with no animation and the neighbouring page is rendered ahead, so both feel instant.
- The bar adds the system navigation bar height (the bottom safe-area inset) below itself, so it sits above a three-button or
  gesture bar and sits at the very bottom on phones without one. Its content area is 62 px, 8 more than Figma, for icon spacing.
- Owns: `app/(tabs)/_layout.tsx`, `src/shared/ui/TabBar.tsx` (the bar, drawn like the Figma tab bar).
- Needs both `react-native-tab-view` and `react-native-pager-view`. Expo Router loads the first one inside a try/catch, so a
  missing package builds fine and only fails when the app starts. Check with `npx expo export --no-bytecode` and search the bundle.
- Changing day slides the date, summary and prayers in from the side they came from (240 ms, native-driven, arrows stay put).
- On Progress the day card has previous and next arrows, and swiping the card left or right moves to the next or previous day
  of the year (`adjacentDate` in `model.ts`, `useHorizontalSwipe.ts`). The year chart scrolls to keep the selected day in view.
- Prayers whose time has not come cannot be marked, on Today or on Progress (`canLog` in `logChoice.ts`). A prayer that was
  already marked can still be changed to Missed, which removes the mark.

## Manual prayer times

- What: times are always calculated from the location. If they do not match the local masjid, the user can set any of
  the five by hand. No switch, no per-masjid choice, no Adhan or Jama'ah times. A prayer with no edit keeps its calculated time.
- Where: Location step of onboarding (small "Edit times" link on the card, opens "Adjust your times" with a Save times
  button) and Settings, Prayer times, "Edit prayer times" (Automatic or Custom, opens "Edit times"). Tapping a time opens
  a sheet with an hour, minute and AM/PM wheel. Both screens have "Reset to automatic times".
- Settings applies each edit when Done is tapped (Figma 8b has no Save button). Onboarding keeps edits until Save times.
- Edits are stored as `profile.manualTimes` (`{ fajr: "04:55" }`, 24-hour clock). `getDayTimes` applies them, so Today, the
  countdown, the day bar, Progress and the alarm planner all use them. Saving rewrites the profile, which reschedules every alarm.
- Times must stay in order (Fajr, Dhuhr, Asr, Maghrib, Isha). An out-of-order pick is refused with a message.
- Changing the location from Settings to a different city asks whether to keep the edits or reset them. Reset is the default.
- Owns: `src/features/adjust-times/` (screens, wheel, sheet), `src/features/prayer-times/manualTimes.ts` (pure logic),
  `src/features/onboarding/draftStore.ts`.

## Home screen widget (Android, development or standalone build only)

- What: one widget, "Salah" (Figma 6020:272, 18078:119 and 18078:154). A header ("Today", "N of 5"), then a stack of three white cards. The front card asks "Did you pray <Prayer>?" about the
  oldest prayer whose time has passed and that is not marked, with Missed and Prayed buttons and the prayer time. When nothing is waiting it shows "Next prayer <Prayer>" with a time bar
  (the time and "in 1h 12m"). After Isha is marked it shows tomorrow's Fajr. The two cards behind it peek 14 and 28 px and are 85% and 60% white.
- Owns: `src/features/widget/`: `widgetState.ts` (the queue, the front card, the counter, the countdown text and the next refresh time: plain functions, tested), `palette.ts` (light and dark
  colours from the theme, passed to the widget as props), `salahWidget.tsx` (the layout, written with Expo UI components and run by the widget in its own runtime), `widgetBridge.ts` (loads
  the widget only when its native module exists, copies the pictures to the widgets directory), `WidgetSync.tsx` (mounted in `app/_layout.tsx`: redraws the widget on every log change, at every
  prayer time and every minute, and writes a tapped answer to the log with `useSaveChoice`, the same call as Today). `app.json` registers it with the `expo-widgets` plugin (`enableAndroid`).
- Pictures: `assets/images/widget-<prayer>.png`, round 3D prayer icons (`node scripts/prepare-widget-icons.js fajr=Fajr.png ...`, from the Figma Asset images 18039:13 to 18039:17, zoomed 1.3x),
  and the existing `button-prayed.png` and `button-missed.png` for the tick and cross.
- Dark mode: same layout. Cards use `camera.photoBackground`, the time bar `camera.gradientBottom`, the border `camera.gradientTop`, text `brand.onDark`, and the Prayed button turns light.
- Not verified: nothing here ran on a device or emulator. Checked: types, lint, tests, the Android bundle, `expo prebuild` (it generates the provider and resources) and the widget layout compiling
  into the layout registry. See `docs/LIMITATIONS.md` for what differs from Figma and from the brief.

