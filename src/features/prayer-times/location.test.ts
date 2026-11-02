import { describePlace, formatPlace } from './location';

const coords = { latitude: 23.8103, longitude: 90.4125 };

describe('describePlace', () => {
  it('prefers the city', () => {
    const place = describePlace(coords, { city: 'Dhaka', region: 'Dhaka Division', country: 'Bangladesh' });
    expect(place).toMatchObject({ city: 'Dhaka', country: 'Bangladesh' });
  });

  it('falls back through subregion, district and region', () => {
    expect(describePlace(coords, { subregion: 'Kamrangirchar', region: 'Dhaka' }).city).toBe('Kamrangirchar');
    expect(describePlace(coords, { region: 'Dhaka' }).city).toBe('Dhaka');
  });

  it('uses rounded coordinates when there is no address', () => {
    expect(describePlace(coords, null)).toMatchObject({ city: '23.81, 90.41', country: '' });
  });
});

describe('formatPlace', () => {
  it('omits an empty country', () => {
    expect(formatPlace({ city: 'Dhaka', country: 'Bangladesh' })).toBe('Dhaka, Bangladesh');
    expect(formatPlace({ city: '23.81, 90.41', country: '' })).toBe('23.81, 90.41');
  });
});
