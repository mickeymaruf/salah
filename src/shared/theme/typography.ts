import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
} as const;

type Style = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

// Sizes, line heights and tracking are taken from the Figma frames.
export const typography = {
  // Catch-up prompt: the prayer name, the question and the two answers.
  giant: { fontFamily: fontFamily.semiBold, fontSize: 80 },
  choice: { fontFamily: fontFamily.medium, fontSize: 56 },
  ask: { fontFamily: fontFamily.regular, fontSize: 22 },
  // Today hero and header.
  heroName: { fontFamily: fontFamily.semiBold, fontSize: 40, lineHeight: 48 },
  heroCountdown: { fontFamily: fontFamily.semiBold, fontSize: 32, lineHeight: 39 },
  greeting: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 27 },
  clock: { fontFamily: fontFamily.semiBold, fontSize: 88, letterSpacing: -3.52 },
  display: { fontFamily: fontFamily.semiBold, fontSize: 56, letterSpacing: -1.68 },
  splash: { fontFamily: fontFamily.semiBold, fontSize: 40, letterSpacing: -1.2 },
  hero: { fontFamily: fontFamily.semiBold, fontSize: 36, lineHeight: 42, letterSpacing: -0.72 },
  confirm: { fontFamily: fontFamily.semiBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.64 },
  input: { fontFamily: fontFamily.medium, fontSize: 32 },
  stat: { fontFamily: fontFamily.semiBold, fontSize: 44, letterSpacing: -1.32 },
  heading: { fontFamily: fontFamily.semiBold, fontSize: 26, letterSpacing: -0.39 },
  alarmName: { fontFamily: fontFamily.medium, fontSize: 28, letterSpacing: -0.28 },
  sheetTitle: { fontFamily: fontFamily.semiBold, fontSize: 28, letterSpacing: -0.42 },
  wheel: { fontFamily: fontFamily.semiBold, fontSize: 30 },
  wheelDim: { fontFamily: fontFamily.regular, fontSize: 22 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 20, letterSpacing: -0.2 },
  prompt: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 28 },
  time: { fontFamily: fontFamily.regular, fontSize: 20 },
  button: { fontFamily: fontFamily.semiBold, fontSize: 17 },
  bodyStrong: { fontFamily: fontFamily.semiBold, fontSize: 17 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 17 },
  body: { fontFamily: fontFamily.regular, fontSize: 17 },
  lead: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  row: { fontFamily: fontFamily.regular, fontSize: 16 },
  pillName: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 22 },
  pillTime: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 19 },
  rowStrong: { fontFamily: fontFamily.semiBold, fontSize: 16 },
  label: { fontFamily: fontFamily.medium, fontSize: 15 },
  small: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13 },
  tiny: { fontFamily: fontFamily.regular, fontSize: 12 },
  tinyMedium: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 15 },
  labelSmall: { fontFamily: fontFamily.medium, fontSize: 14 },
  tab: { fontFamily: fontFamily.semiBold, fontSize: 12 },
  overline: { fontFamily: fontFamily.semiBold, fontSize: 12, letterSpacing: 1.2 },
} satisfies Record<string, Style>;

export type TypeVariant = keyof typeof typography;
