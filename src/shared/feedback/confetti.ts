// Plain maths for the confetti burst, so it can be tested without a screen.

export type PieceShape = 'dot' | 'block' | 'strip';

export interface PieceSize {
  width: number;
  height: number;
  radius: number;
}

// 6 px dots, 6 x 11 px rounded rectangles and 3 x 13 px thin strips.
export const SHAPES: Record<PieceShape, PieceSize> = {
  dot: { width: 6, height: 6, radius: 3 },
  block: { width: 6, height: 11, radius: 2 },
  strip: { width: 3, height: 13, radius: 1.5 },
};
const SHAPE_ORDER: readonly PieceShape[] = ['dot', 'block', 'strip'];

export const NORMAL_PIECES = { min: 30, max: 36 } as const;
export const NORMAL_MS = 1000;
// The fifth prayer of the day: twice the pieces for a little longer.
export const BIG_MS = 1400;
// The fan spreads over 150 degrees around straight up.
export const FAN_DEGREES = 150;
export const MIN_DISTANCE = 35;
export const MAX_DISTANCE = 130;
// How far a piece sinks by the end because of gravity.
export const GRAVITY = 46;
// Fade starts after this share of the time, so the burst is clearly visible first.
export const FADE_START = 0.1;

export interface ConfettiPiece {
  shape: PieceShape;
  colour: string;
  // Where the piece would end without gravity, from the burst's centre.
  dx: number;
  dy: number;
  // Total turn over the burst, in degrees.
  spin: number;
}

export function pieceCount(big: boolean, random: () => number): number {
  const base = NORMAL_PIECES.min + Math.floor(random() * (NORMAL_PIECES.max - NORMAL_PIECES.min + 1));
  return big ? base * 2 : base;
}

// Pieces are spread evenly over the fan with a little jitter, so no gap opens in it. `colours` is cycled through.
export function buildConfetti(count: number, colours: readonly string[], random: () => number): ConfettiPiece[] {
  const start = 90 - FAN_DEGREES / 2;
  return Array.from({ length: count }, (_, i) => {
    const degrees = start + (FAN_DEGREES * (i + random())) / count;
    const radians = (degrees * Math.PI) / 180;
    const distance = MIN_DISTANCE + random() * (MAX_DISTANCE - MIN_DISTANCE);
    return {
      shape: SHAPE_ORDER[Math.floor(random() * SHAPE_ORDER.length)],
      colour: colours[Math.floor(random() * colours.length)],
      dx: Math.cos(radians) * distance,
      // Screen y grows downward, so up is negative.
      dy: -Math.sin(radians) * distance,
      spin: (random() - 0.5) * 360,
    };
  });
}

// Position at `u` (0 to 1) through the burst: it flies out quickly and slows, while gravity pulls it down ever faster.
export function piecePosition(piece: ConfettiPiece, u: number): { x: number; y: number } {
  const out = 1 - Math.pow(1 - u, 3);
  return { x: piece.dx * out, y: piece.dy * out + GRAVITY * u * u };
}
