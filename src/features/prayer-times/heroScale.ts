// Figma draws the Today frame 390 px wide. On a wider or narrower screen the hero (ring, banner height, picture, sparkles) grows or shrinks with the width, so the
// ring keeps the same share of the screen and the same distance from its edges. The text keeps its own sizes.
export const FIGMA_WIDTH = 390;
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.4;

export function heroScale(width: number): number {
  if (!Number.isFinite(width) || width <= 0) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / FIGMA_WIDTH));
}

export const RING_RADIUS = 160;
// The visible gap between the bottom of the greeting and the top of the ring. The gap between the date text and the first pill is the same (`PrayerSheet`).
export const SECTION_GAP = 32;
// Below the status bar: the greeting starts 13 px down and is 28 px high; the top ring dot sticks out 1.75 px above the arc.
const GREETING_BOTTOM = 41;
const RING_DOT_OVERHANG = 1.75;

// Height of the hero below the status bar. The ring rests on the sheet, so this keeps a fixed gap under the greeting at any width.
export function heroHeight(width: number): number {
  return Math.round(RING_RADIUS * heroScale(width) + GREETING_BOTTOM + SECTION_GAP + RING_DOT_OVERHANG);
}
