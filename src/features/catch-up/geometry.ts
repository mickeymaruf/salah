export type Side = 'left' | 'right';

// Each answer shape is half an ellipse standing on its screen edge, so a full ellipse is centred on that edge.
// Together they form ")(" and touch at the middle. These helpers work in the half-width box that holds one shape:
// (0,0) is its top-left corner and the screen edge is its left side for 'left'... see `edgeX`.
export function edgeX(side: Side, boxWidth: number): number {
  return side === 'left' ? 0 : boxWidth;
}

// True when a point inside a shape's box lies within its ellipse. `tolerance` widens the ellipse a little so
// a thumb near the curve still counts.
export function insideHalfEllipse(side: Side, x: number, y: number, boxWidth: number, boxHeight: number, tolerance = 1.1): boolean {
  const dx = (x - edgeX(side, boxWidth)) / (boxWidth * tolerance);
  const dy = (y - boxHeight / 2) / ((boxHeight / 2) * tolerance);
  return dx * dx + dy * dy <= 1;
}

// SVG path of the half ellipse, drawn inside its box: pinched to a point at the top and bottom of the screen edge.
export function halfEllipsePath(side: Side, boxWidth: number, boxHeight: number): string {
  const x = edgeX(side, boxWidth);
  const sweep = side === 'left' ? 1 : 0;
  return `M ${x} 0 A ${boxWidth} ${boxHeight / 2} 0 0 ${sweep} ${x} ${boxHeight} Z`;
}

// How far a shape must be scaled (about its anchor on the screen edge) for its ellipse to cover the whole screen.
// The farthest corners are a full screen width away horizontally and as far as the anchor is from the top or bottom.
export function coverScale(boxHeight: number, anchorY: number, screenHeight: number): number {
  const farthest = Math.max(anchorY, screenHeight - anchorY);
  return Math.sqrt(4 + ((2 * farthest) / boxHeight) ** 2) * 1.03;
}

// Scaling happens about a view's centre. Moving the view by this much while scaling by `scale` keeps the point on the
// screen edge where it was, so the shape grows or shrinks from its edge.
export function anchorShift(side: Side, boxWidth: number, scale: number): number {
  const centre = boxWidth / 2;
  return (edgeX(side, boxWidth) - centre) * (1 - scale);
}
