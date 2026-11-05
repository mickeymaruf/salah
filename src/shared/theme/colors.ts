// Values come from the Figma file (variables bg/*, ink/*, line/*, brand/*, state/*, heat/*).
export const colors = {
  bg: {
    base: '#F7F5F0',
    surface: '#FFFFFF',
    sage: '#E4EBE4',
  },
  ink: {
    primary: '#1C1B19',
    muted: '#8A867D',
  },
  line: {
    soft: '#E8E4DB',
  },
  brand: {
    green: '#1F4D3F',
    greenDark: '#10241E',
    onDark: '#F3F1EA',
  },
  state: {
    missed: '#CC7361',
    // Light terracotta for the Catch-up No panel and the full Missed screen (Figma P-D5).
    missedSoft: '#F2DBD6',
  },
  heat: ['#ECE8E0', '#C7D8CA', '#94B6A0', '#57856E', '#336654', '#1F4D3F'],
  // Concentric rings on the alarm screen, outer to inner.
  ring: ['rgba(243,241,234,0.14)', 'rgba(243,241,234,0.3)', 'rgba(243,241,234,0.5)'],
  // Dimmed backdrop behind bottom sheets (brand/greenDark at 40%).
  backdrop: 'rgba(16,36,30,0.4)',
  // Dark scrim behind the log-a-prayer sheet.
  scrim: 'rgba(15,20,18,0.45)',
  camera: {
    background: '#0A0D0B',
    gradientTop: '#29332E',
    gradientBottom: '#121714',
    photoBackground: '#1A211C',
    overlay: 'rgba(255,255,255,0.12)',
  },
} as const;

export type TextColor =
  | 'primary'
  | 'muted'
  | 'brand'
  | 'onDark';

export const textColors: Record<TextColor, string> = {
  primary: colors.ink.primary,
  muted: colors.ink.muted,
  brand: colors.brand.green,
  onDark: colors.brand.onDark,
};
