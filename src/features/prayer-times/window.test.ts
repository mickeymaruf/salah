import type { DayTimes } from './calculate';
import { arcPoint, getPrayerWindow, halfCircleLength, halfCirclePath, ringDotCount, ringDots } from './window';

const day = (d: number): DayTimes => ({
  fajr: new Date(2026, 9, d, 4, 48),
  dhuhr: new Date(2026, 9, d, 12, 2),
  asr: new Date(2026, 9, d, 15, 42),
  maghrib: new Date(2026, 9, d, 17, 21),
  isha: new Date(2026, 9, d, 18, 40),
});
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);

describe('getPrayerWindow', () => {
  it('is the prayer in progress, up to the next one', () => {
    const window = getPrayerWindow(day(25), day(26), day(27), at(26, 16));
    expect(window.name).toBe('asr');
    expect(window.nextName).toBe('maghrib');
    expect(window.start).toEqual(at(26, 15, 42));
    expect(window.end).toEqual(at(26, 17, 21));
  });

  it('starts a window exactly at its time', () => {
    expect(getPrayerWindow(day(25), day(26), day(27), at(26, 12, 2)).name).toBe('dhuhr');
  });

  it('is yesterday\'s Isha before Fajr', () => {
    const window = getPrayerWindow(day(25), day(26), day(27), at(26, 2));
    expect(window.name).toBe('isha');
    expect(window.start).toEqual(at(25, 18, 40));
    expect(window.end).toEqual(at(26, 4, 48));
    expect(window.nextName).toBe('fajr');
  });

  it('runs Isha to tomorrow\'s Fajr in the evening', () => {
    const window = getPrayerWindow(day(25), day(26), day(27), at(26, 21));
    expect(window.name).toBe('isha');
    expect(window.end).toEqual(at(27, 4, 48));
  });

  it('reports how far through the window it is', () => {
    const window = getPrayerWindow(day(25), day(26), day(27), at(26, 16, 31));
    // 49 of 99 minutes.
    expect(window.progress).toBeCloseTo(49 / 99, 3);
    expect(getPrayerWindow(day(25), day(26), day(27), at(26, 12, 2)).progress).toBe(0);
  });
});

describe('arcPoint', () => {
  it('runs from the left end, over the top, to the right end', () => {
    expect(arcPoint(0, 100, 200, 50)).toEqual({ x: 50, y: 200 });
    const top = arcPoint(0.5, 100, 200, 50);
    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(150);
    const end = arcPoint(1, 100, 200, 50);
    expect(end.x).toBeCloseTo(150);
    expect(end.y).toBeCloseTo(200);
  });
});

describe('half circle', () => {
  it('draws the upper half', () => {
    expect(halfCirclePath(180, 190, 160)).toBe('M 20 190 A 160 160 0 0 1 340 190');
    expect(halfCircleLength(160)).toBeCloseTo(502.65, 1);
  });
});

describe('ring dots', () => {
  it('spaces about 9 px apart on a radius of 160, counting both ends', () => {
    expect(ringDotCount(160, 9)).toBe(57);
  });

  it('starts at the left end and finishes at the right end of the half circle', () => {
    const dots = ringDots(5, 100, 100, 50);
    expect(dots).toHaveLength(5);
    expect(dots[0].x).toBeCloseTo(50);
    expect(dots[0].y).toBeCloseTo(100);
    expect(dots[2].x).toBeCloseTo(100);
    expect(dots[2].y).toBeCloseTo(50);
    expect(dots[4].x).toBeCloseTo(150);
    expect(dots[4].at).toBe(1);
  });
});
