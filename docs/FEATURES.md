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
