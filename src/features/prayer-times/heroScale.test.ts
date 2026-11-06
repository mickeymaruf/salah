import { heroHeight, heroScale } from './heroScale';

describe('heroScale', () => {
  it('is 1 at the Figma width', () => {
    expect(heroScale(390)).toBe(1);
  });

  it('grows with a wider screen', () => {
    expect(heroScale(480)).toBeCloseTo(480 / 390, 5);
  });

  it('stays within limits', () => {
    expect(heroScale(1000)).toBe(1.4);
    expect(heroScale(200)).toBe(0.85);
  });

  it('falls back to 1 for a bad width', () => {
    expect(heroScale(0)).toBe(1);
    expect(heroScale(Number.NaN)).toBe(1);
  });
});

describe('heroHeight', () => {
  it('leaves 26 px between the greeting and the ring at the Figma width', () => {
    expect(heroHeight(390)).toBe(229);
  });

  it('grows by the ring radius only', () => {
    expect(heroHeight(480) - heroHeight(390)).toBe(Math.round(160 * (480 / 390)) - 160);
  });
});
