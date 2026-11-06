import { buttonCentreX, coverRadius } from './markGeometry';

describe('markGeometry', () => {
  it('reaches the far corner plus 2 px', () => {
    // From the middle of the left button the far corner is the bottom or top right one.
    const r = coverRadius(322, 76, 38, 38);
    expect(r).toBeCloseTo(Math.hypot(322 - 38, 38) + 2);
  });

  it('is the same for the mirrored button', () => {
    expect(coverRadius(322, 76, 322 - 38, 38)).toBeCloseTo(coverRadius(322, 76, 38, 38));
  });

  it('covers every corner of the pill', () => {
    const r = coverRadius(322, 76, 38, 38);
    for (const [x, y] of [[0, 0], [322, 0], [0, 76], [322, 76]]) {
      expect(Math.hypot(x - 38, y - 38)).toBeLessThan(r);
    }
  });

  it('finds the button centres', () => {
    expect(buttonCentreX('left', 322, 16, 44)).toBe(38);
    expect(buttonCentreX('right', 322, 16, 44)).toBe(284);
  });
});
