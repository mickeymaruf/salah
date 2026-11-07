import { colors } from '@/shared/theme';

// Text colours the widget draws with. The widget layout runs in its own small JavaScript runtime and cannot import the app's theme, so the app passes these in as props.
// The fills, borders and shadows are pictures (see `scripts/prepare-widget-shapes.js`), because older Android versions cannot round or outline a widget view.
export interface WidgetPalette {
  primary: string;
  muted: string;
  // The label on the Prayed button, drawn over its fill.
  prayedLabel: string;
}

export const lightPalette: WidgetPalette = {
  primary: colors.ink.primary,
  muted: colors.ink.muted,
  prayedLabel: colors.bg.surface,
};

// Dark mode is not designed. The layout is the same; the cards take the app's dark camera surfaces, text takes the on-dark colour and the Prayed button turns light.
export const darkPalette: WidgetPalette = {
  primary: colors.brand.onDark,
  muted: colors.ink.muted,
  prayedLabel: colors.brand.greenDark,
};
