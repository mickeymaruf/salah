import { darkPalette, lightPalette } from './palette';

describe('widget palette', () => {
  it('puts the two back cards at 85% and 60% of the surface colour', () => {
    expect(lightPalette.surface85).toBe('#FFFFFFD9');
    expect(lightPalette.surface60).toBe('#FFFFFF99');
  });

  it('uses the same keys in light and dark', () => {
    expect(Object.keys(darkPalette)).toEqual(Object.keys(lightPalette));
  });
});
