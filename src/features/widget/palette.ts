import { colors } from '@/shared/theme';

// Colours the widget draws with. The widget layout runs in its own small JavaScript runtime and cannot import the app's theme, so the app passes these in as props.
export interface WidgetPalette {
  surface: string;
  // The two cards behind the front one: the surface colour at 85% and 60%.
  surface85: string;
  surface60: string;
  // The time bar in the "next" state.
  base: string;
  primary: string;
  muted: string;
  line: string;
  prayedFill: string;
  prayedLabel: string;
}

function withAlpha(hex: string, alpha: number): string {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${hex}${channel}`;
}

export const lightPalette: WidgetPalette = {
  surface: colors.bg.surface,
  surface85: withAlpha(colors.bg.surface, 0.85),
  surface60: withAlpha(colors.bg.surface, 0.6),
  base: colors.bg.base,
  primary: colors.ink.primary,
  muted: colors.ink.muted,
  line: colors.line.soft,
  prayedFill: colors.ink.primary,
  prayedLabel: colors.bg.surface,
};

// Dark mode is not designed. The layout is the same; the cards take the app's dark camera surfaces, text takes the on-dark colour and the Prayed button turns light.
export const darkPalette: WidgetPalette = {
  surface: colors.camera.photoBackground,
  surface85: withAlpha(colors.camera.photoBackground, 0.85),
  surface60: withAlpha(colors.camera.photoBackground, 0.6),
  base: colors.camera.gradientBottom,
  primary: colors.brand.onDark,
  muted: colors.ink.muted,
  line: colors.camera.gradientTop,
  prayedFill: colors.brand.onDark,
  prayedLabel: colors.brand.greenDark,
};
