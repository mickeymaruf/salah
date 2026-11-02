# Limitations

## Tooling in the build environment

- The Expo API and `figma.com` asset hosts were not reachable while building.
  `npx expo install` and parts of `npx expo-doctor` need the Expo API, so package
  versions were taken from `node_modules/expo/bundledNativeModules.json`.
- Figma asset downloads (logo SVG) were blocked. The logo mark is redrawn in code
  from the Figma screenshot. See `docs/DECISIONS.md`.
- Nothing was run on a device or emulator.

## Location and time zones

- Prayer times are absolute instants shown in the device time zone. They are correct only when the
  device is in the time zone of the saved location. After travelling, refresh the location in Settings.
- If reverse geocoding fails (offline), the city is shown as rounded coordinates.
- Onboarding cannot continue without location permission. Manual city entry is on the roadmap.

## Today

- A prayer whose time has passed without a log row counts as missed immediately. There is no grace window.
  The user can still mark it prayed through proof, which turns it into prayed.
