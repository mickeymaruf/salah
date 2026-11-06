import {
  buildConfetti,
  FAN_DEGREES,
  GRAVITY,
  MAX_DISTANCE,
  MIN_DISTANCE,
  NORMAL_PIECES,
  pieceCount,
  piecePosition,
} from './confetti';

// A small repeatable random source.
function seeded(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

const COLOURS = ['#a', '#b', '#c'];

describe('confetti', () => {
  it('uses 30 to 36 pieces, twice that for the last prayer of the day', () => {
    for (let seed = 1; seed < 40; seed++) {
      const normal = pieceCount(false, seeded(seed));
      expect(normal).toBeGreaterThanOrEqual(NORMAL_PIECES.min);
      expect(normal).toBeLessThanOrEqual(NORMAL_PIECES.max);
      expect(pieceCount(true, seeded(seed))).toBe(normal * 2);
    }
  });

  it('fans upward over 150 degrees and flies 35 to 130 px', () => {
    const pieces = buildConfetti(36, COLOURS, seeded(7));
    expect(pieces).toHaveLength(36);
    const limit = Math.tan(((90 - FAN_DEGREES / 2) * Math.PI) / 180);
    for (const piece of pieces) {
      const distance = Math.hypot(piece.dx, piece.dy);
      expect(distance).toBeGreaterThanOrEqual(MIN_DISTANCE - 0.001);
      expect(distance).toBeLessThanOrEqual(MAX_DISTANCE + 0.001);
      // Up is negative y, and no piece goes lower than 15 degrees above the horizontal.
      expect(piece.dy).toBeLessThan(0);
      expect(-piece.dy / Math.abs(piece.dx)).toBeGreaterThanOrEqual(limit - 0.001);
    }
  });

  it('spreads pieces to both sides and cycles through the colours', () => {
    const pieces = buildConfetti(36, COLOURS, seeded(3));
    expect(pieces.some((piece) => piece.dx < 0)).toBe(true);
    expect(pieces.some((piece) => piece.dx > 0)).toBe(true);
    expect(new Set(pieces.map((piece) => piece.colour)).size).toBe(COLOURS.length);
  });

  it('starts at the centre and ends pulled down by gravity', () => {
    const piece = buildConfetti(1, COLOURS, seeded(5))[0];
    expect(piecePosition(piece, 0)).toEqual({ x: 0, y: 0 });
    const end = piecePosition(piece, 1);
    expect(end.x).toBeCloseTo(piece.dx);
    expect(end.y).toBeCloseTo(piece.dy + GRAVITY);
  });
});
