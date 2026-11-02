# Limitations

## Tooling in the build environment

- The Expo API and `figma.com` asset hosts were not reachable while building.
  `npx expo install` and parts of `npx expo-doctor` need the Expo API, so package
  versions were taken from `node_modules/expo/bundledNativeModules.json`.
- Figma asset downloads (logo SVG) were blocked. The logo mark is redrawn in code
  from the Figma screenshot. See `docs/DECISIONS.md`.
- Nothing was run on a device or emulator.
