import { colors } from '@/shared/theme';
import { darkPalette, lightPalette } from './palette';

describe('widget palette', () => {
  it('uses the same keys in light and dark', () => {
    expect(Object.keys(darkPalette)).toEqual(Object.keys(lightPalette));
  });

  it('turns the text light and the Prayed label dark in dark mode', () => {
    expect(lightPalette.primary).toBe(colors.ink.primary);
    expect(darkPalette.primary).toBe(colors.brand.onDark);
    expect(darkPalette.prayedLabel).toBe(colors.brand.greenDark);
  });
});
