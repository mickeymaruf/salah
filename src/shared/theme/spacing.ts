export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screenX: 24,
} as const;

export const radii = {
  card: 24,
  cardSmall: 20,
  pill: 28,
  viewfinder: 32,
  bar: 3,
} as const;

export const sizes = {
  buttonHeight: 56,
  rowHeight: 50,
  prayerRowHeight: 56,
  iconButton: 44,
  // Tab bar height above the bottom safe-area inset. Figma: 88 = 54 + 34 on an iPhone.
  tabBarContent: 54,
} as const;
