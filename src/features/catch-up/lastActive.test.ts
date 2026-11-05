import { parseLastActive } from './lastActive';

describe('parseLastActive', () => {
  it('reads a stored ISO date', () => {
    expect(parseLastActive('2026-11-05T08:00:00.000Z')?.toISOString()).toBe('2026-11-05T08:00:00.000Z');
  });

  it('treats missing or damaged values as no earlier use', () => {
    expect(parseLastActive(null)).toBeNull();
    expect(parseLastActive('')).toBeNull();
    expect(parseLastActive('yesterday')).toBeNull();
  });
});
