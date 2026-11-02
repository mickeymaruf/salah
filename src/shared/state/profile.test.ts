import { parseProfile, type Profile } from './profile';

const valid: Profile = {
  name: 'Amina',
  latitude: 23.8,
  longitude: 90.4,
  city: 'Dhaka',
  country: 'Bangladesh',
  calculationMethod: 'Karachi',
  asrMethod: 'standard',
};

describe('parseProfile', () => {
  it('returns a stored profile', () => {
    expect(parseProfile(JSON.stringify(valid))).toEqual(valid);
  });

  it('returns null for missing, malformed or incomplete data', () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile('not json')).toBeNull();
    expect(parseProfile('"text"')).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, name: '' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, latitude: '23' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, asrMethod: 'maliki' }))).toBeNull();
  });
});
