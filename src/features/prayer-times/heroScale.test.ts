import { heroScale } from './heroScale';

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
