import { anchorShift, coverScale, edgeX, halfEllipsePath, insideHalfEllipse } from './geometry';

describe('insideHalfEllipse', () => {
  const w = 195;
  const h = 614;

  it('is inside at the middle of the bulge and at the screen edge', () => {
    expect(insideHalfEllipse('left', w - 5, h / 2, w, h)).toBe(true);
    expect(insideHalfEllipse('left', 2, h / 2, w, h)).toBe(true);
    expect(insideHalfEllipse('right', 5, h / 2, w, h)).toBe(true);
  });

  it('is outside in the blank corners', () => {
    expect(insideHalfEllipse('left', w - 5, 5, w, h)).toBe(false);
    expect(insideHalfEllipse('left', w - 5, h - 5, w, h)).toBe(false);
    expect(insideHalfEllipse('right', 5, 5, w, h)).toBe(false);
  });

  it('is mirrored for the right shape', () => {
    expect(insideHalfEllipse('right', 20, h / 2 + 100, w, h)).toBe(insideHalfEllipse('left', w - 20, h / 2 + 100, w, h));
  });
});

describe('halfEllipsePath', () => {
  it('starts and ends on the screen edge, at the top and the bottom', () => {
    expect(halfEllipsePath('left', 195, 614)).toBe('M 0 0 A 195 307 0 0 1 0 614 Z');
    expect(halfEllipsePath('right', 195, 614)).toBe('M 195 0 A 195 307 0 0 0 195 614 Z');
  });
});

describe('coverScale', () => {
  it('is big enough that the scaled ellipse reaches every corner', () => {
    const w = 195;
    const boxHeight = 614;
    const screenHeight = 844;
    const anchorY = 230 + boxHeight / 2;
    const s = coverScale(boxHeight, anchorY, screenHeight);
    // The farthest corner is a full screen width (2 * w) away sideways and `farthest` away vertically,
    // measured against the scaled radii (w sideways, half the box height vertically).
    const dx = (2 * w) / (s * w);
    const dy = Math.max(anchorY, screenHeight - anchorY) / ((s * boxHeight) / 2);
    expect(dx * dx + dy * dy).toBeLessThan(1);
  });
});

describe('anchorShift', () => {
  it('keeps the screen edge fixed while scaling', () => {
    const w = 195;
    for (const side of ['left', 'right'] as const) {
      for (const scale of [0, 0.5, 1, 2.5]) {
        const centre = w / 2;
        const edge = edgeX(side, w);
        const moved = centre + scale * (edge - centre) + anchorShift(side, w, scale);
        expect(moved).toBeCloseTo(edge);
      }
    }
  });
});
