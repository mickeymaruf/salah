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
  },
  // Prayer pill fills on Today (Figma 3 · Today): brand/green 30% and state/missed 40% over white, and ink/muted 14% over white.
  pill: {
    prayed: '#BCCAC5',
    missed: '#EBC7C0',
    current: '#EFEEED',
  },
  // The timeline halo around the current prayer (brand/green at 20%).
  halo: 'rgba(31,77,63,0.2)',
  // Confetti pieces when a prayer is marked as prayed (Figma 18007:14).
  confetti: ['#1F4D3F', '#6FA58B', '#C9A54A', '#D9826B', '#A9CDB8'],
  // The year chart on Progress (Figma 18035:59): brighter than brand/green and state/missed. Upcoming is heat/0 at 55% over white.
  chart: {
    prayed: '#1B6B33',
    missed: '#E4583C',
    upcoming: '#F5F2EE',
  },
  heat: ['#ECE8E0', '#C7D8CA', '#94B6A0', '#57856E', '#336654', '#1F4D3F'],
  // Concentric rings on the alarm screen, outer to inner.
  ring: ['rgba(243,241,234,0.14)', 'rgba(243,241,234,0.3)', 'rgba(243,241,234,0.5)'],
  // Dimmed backdrop behind bottom sheets (brand/greenDark at 40%).
  backdrop: 'rgba(16,36,30,0.4)',
  // Dark scrim behind the calendar sheet (42%).
  scrimCalendar: 'rgba(15,20,18,0.42)',
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
  | 'onDark'
  | 'missed';

export const textColors: Record<TextColor, string> = {
  primary: colors.ink.primary,
  muted: colors.ink.muted,
  brand: colors.brand.green,
  onDark: colors.brand.onDark,
  missed: colors.state.missed,
};
