// Figma draws the Today frame 390 px wide. On a wider or narrower screen the hero (ring, banner height, picture, sparkles) grows or shrinks with the width, so the
// ring keeps the same share of the screen and the same distance from its edges. The text keeps its own sizes.
export const FIGMA_WIDTH = 390;
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.4;

export function heroScale(width: number): number {
  if (!Number.isFinite(width) || width <= 0) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / FIGMA_WIDTH));
}
