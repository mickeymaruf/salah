// The circle that fills a pill when it is marked starts at the middle of the tapped button and must reach the far corner.
export const COVER_MARGIN = 2;

export function coverRadius(width: number, height: number, centreX: number, centreY: number): number {
  const dx = Math.max(centreX, width - centreX);
  const dy = Math.max(centreY, height - centreY);
  return Math.hypot(dx, dy) + COVER_MARGIN;
}

// Middle of a button that sits `inset` from the pill's edge: the missed button on the left, the prayed one on the right.
export function buttonCentreX(side: 'left' | 'right', width: number, inset: number, button: number): number {
  return side === 'left' ? inset + button / 2 : width - inset - button / 2;
}
