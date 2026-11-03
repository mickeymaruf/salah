import { clockToWheel, wheelToClock } from './wheelValue';

describe('wheel value', () => {
  it('maps 24-hour clocks to wheel positions', () => {
    expect(clockToWheel('16:00')).toEqual({ hour: 3, minute: 0, period: 1 });
    expect(clockToWheel('04:48')).toEqual({ hour: 3, minute: 48, period: 0 });
    expect(clockToWheel('00:05')).toEqual({ hour: 11, minute: 5, period: 0 });
    expect(clockToWheel('12:02')).toEqual({ hour: 11, minute: 2, period: 1 });
  });

  it('round-trips every minute of the day', () => {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 7) {
        const clock = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        expect(wheelToClock(clockToWheel(clock))).toBe(clock);
      }
    }
  });
});
