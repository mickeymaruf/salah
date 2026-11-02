import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
} as const;

type Style = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

// Sizes, line heights and tracking are taken from the Figma frames.
export const typography = {
  clock: { fontFamily: fontFamily.semiBold, fontSize: 88, letterSpacing: -3.52 },
  display: { fontFamily: fontFamily.semiBold, fontSize: 56, letterSpacing: -1.68 },
  splash: { fontFamily: fontFamily.semiBold, fontSize: 40, letterSpacing: -1.2 },
  hero: { fontFamily: fontFamily.semiBold, fontSize: 36, lineHeight: 42, letterSpacing: -0.72 },
  confirm: { fontFamily: fontFamily.semiBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.64 },
  input: { fontFamily: fontFamily.medium, fontSize: 32 },
  stat: { fontFamily: fontFamily.semiBold, fontSize: 44, letterSpacing: -1.32 },
  heading: { fontFamily: fontFamily.semiBold, fontSize: 26, letterSpacing: -0.39 },
  alarmName: { fontFamily: fontFamily.medium, fontSize: 28, letterSpacing: -0.28 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 20, letterSpacing: -0.2 },
  prompt: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 28 },
  time: { fontFamily: fontFamily.regular, fontSize: 20 },
  button: { fontFamily: fontFamily.semiBold, fontSize: 17 },
  bodyStrong: { fontFamily: fontFamily.semiBold, fontSize: 17 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 17 },
  body: { fontFamily: fontFamily.regular, fontSize: 17 },
  lead: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  row: { fontFamily: fontFamily.regular, fontSize: 16 },
  rowStrong: { fontFamily: fontFamily.semiBold, fontSize: 16 },
  label: { fontFamily: fontFamily.medium, fontSize: 15 },
  small: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13 },
  tab: { fontFamily: fontFamily.semiBold, fontSize: 12 },
  overline: { fontFamily: fontFamily.semiBold, fontSize: 12, letterSpacing: 1.2 },
} satisfies Record<string, Style>;

export type TypeVariant = keyof typeof typography;
