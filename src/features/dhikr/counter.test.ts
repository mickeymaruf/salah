import { registerTap } from './counter';

describe('registerTap', () => {
  it('adds one recitation per tap', () => {
    let state = { day: '2026-10-26', count: 0 };
    for (let i = 0; i < 5; i++) state = registerTap(state, '2026-10-26').next;
    expect(state).toEqual({ day: '2026-10-26', count: 5 });
  });

  it('has no limit', () => {
    expect(registerTap({ day: '2026-10-26', count: 99999 }, '2026-10-26').next.count).toBe(100000);
  });

  it('returns the old day to save when midnight passes, and starts the new day at 1', () => {
    const result = registerTap({ day: '2026-10-26', count: 41 }, '2026-10-27');
    expect(result.closed).toEqual({ day: '2026-10-26', count: 41 });
    expect(result.next).toEqual({ day: '2026-10-27', count: 1 });
  });

  it('returns nothing to save on the same day', () => {
    expect(registerTap({ day: '2026-10-26', count: 1 }, '2026-10-26').closed).toBeNull();
  });
});
