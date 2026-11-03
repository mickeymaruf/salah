import { defaultAsrFor, parseProfile, type Profile } from './profile';

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

  it('accepts the optional start date', () => {
    const withStart = { ...valid, startedOn: '2026-01-01' };
    expect(parseProfile(JSON.stringify(withStart))).toEqual(withStart);
  });

  it('keeps valid manual times', () => {
    const edited = { ...valid, manualTimes: { fajr: '04:55', isha: '20:10' } };
    expect(parseProfile(JSON.stringify(edited))).toEqual(edited);
  });

  it('drops damaged manual times but keeps the profile', () => {
    expect(parseProfile(JSON.stringify({ ...valid, manualTimes: { fajr: '25:00' } }))).toEqual(valid);
    expect(parseProfile(JSON.stringify({ ...valid, manualTimes: { zuhr: '12:00' } }))).toEqual(valid);
    expect(parseProfile(JSON.stringify({ ...valid, manualTimes: 'x' }))).toEqual(valid);
    expect(parseProfile(JSON.stringify({ ...valid, manualTimes: {} }))).toEqual(valid);
  });

  it('returns null for missing, malformed or incomplete data', () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile('not json')).toBeNull();
    expect(parseProfile('"text"')).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, name: '' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, latitude: '23' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, asrMethod: 'maliki' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valid, startedOn: 20260101 }))).toBeNull();
  });
});

describe('defaultAsrFor', () => {
  it('uses Hanafi in Bangladesh and Standard elsewhere', () => {
    expect(defaultAsrFor('Bangladesh')).toBe('hanafi');
    expect(defaultAsrFor(' pakistan ')).toBe('hanafi');
    expect(defaultAsrFor('Saudi Arabia')).toBe('standard');
    expect(defaultAsrFor('')).toBe('standard');
  });
});
