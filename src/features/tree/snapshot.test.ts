import { parseSnapshot } from './snapshot';

describe('parseSnapshot', () => {
  it('reads a stored snapshot', () => {
    expect(parseSnapshot('{"fullness":0.7,"perfectDays":28,"streak":7}')).toEqual({ fullness: 0.7, perfectDays: 28, streak: 7 });
  });
  it('returns null for missing or broken values', () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot('nope')).toBeNull();
    expect(parseSnapshot('{"fullness":2,"perfectDays":1,"streak":1}')).toBeNull();
    expect(parseSnapshot('{"fullness":0.5,"perfectDays":-1,"streak":1}')).toBeNull();
    expect(parseSnapshot('{"fullness":0.5}')).toBeNull();
  });
});
