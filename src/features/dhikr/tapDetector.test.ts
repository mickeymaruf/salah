import { detectTaps, INITIAL_DETECTOR, MAX_SAMPLE_GAP_MS, TAP_REFRACTORY_MS, TAP_THRESHOLDS, unpackSamples } from './tapDetector';

const G = 9.81;

// A phone lying still, read every 5 ms, with a spike of `size` m/s2 on z at each time in `taps`.
function flatSamples(startMs: number, count: number, spikes: Record<number, number> = {}): number[] {
  const flat: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = startMs + i * 5;
    flat.push(t, 0.01 * Math.sin(i), 0.01 * Math.cos(i), G + (spikes[t] ?? 0));
  }
  return flat;
}

describe('unpackSamples', () => {
  it('reads time, x, y, z in fours and ignores a partial sample', () => {
    expect(unpackSamples([1, 2, 3, 4, 5, 6, 7, 8, 9, 9])).toEqual([
      { t: 1, x: 2, y: 3, z: 4 },
      { t: 5, x: 6, y: 7, z: 8 },
    ]);
  });
});

describe('detectTaps', () => {
  it('counts nothing for a phone lying still', () => {
    expect(detectTaps(INITIAL_DETECTOR, flatSamples(0, 400), 'high').taps).toBe(0);
  });

  it('counts a spike above the threshold as one tap', () => {
    expect(detectTaps(INITIAL_DETECTOR, flatSamples(0, 100, { 100: 1.5 }), 'medium').taps).toBe(1);
  });

  it('counts a tap only if it passes the threshold of the chosen sensitivity', () => {
    const batch = flatSamples(0, 100, { 100: 0.8 });
    expect(detectTaps(INITIAL_DETECTOR, batch, 'high').taps).toBe(1);
    expect(detectTaps(INITIAL_DETECTOR, batch, 'medium').taps).toBe(0);
    expect(detectTaps(INITIAL_DETECTOR, batch, 'low').taps).toBe(0);
    expect(TAP_THRESHOLDS.high).toBeLessThan(TAP_THRESHOLDS.medium);
    expect(TAP_THRESHOLDS.medium).toBeLessThan(TAP_THRESHOLDS.low);
  });

  it('counts the ringing after one tap as the same tap', () => {
    const spikes = { 100: 3, 105: -3, 110: 2, 115: -2, 120: 1.5 };
    expect(detectTaps(INITIAL_DETECTOR, flatSamples(0, 100, spikes), 'medium').taps).toBe(1);
  });

  it('counts separate taps that are further apart than the refractory time', () => {
    const second = 100 + TAP_REFRACTORY_MS + 50;
    expect(detectTaps(INITIAL_DETECTOR, flatSamples(0, 200, { 100: 3, [second]: 3 }), 'medium').taps).toBe(2);
  });

  it('keeps counting across batches, with the refractory time carried over', () => {
    const first = detectTaps(INITIAL_DETECTOR, flatSamples(0, 21, { 100: 3 }), 'medium');
    expect(first.taps).toBe(1);
    const same = detectTaps(first.state, flatSamples(105, 10, { 110: 3 }), 'medium');
    expect(same.taps).toBe(0);
    const later = detectTaps(same.state, flatSamples(400, 10, { 405: 3 }), 'medium');
    expect(later.taps).toBe(1);
  });

  it('ignores a jump across a gap in the samples, such as a pause', () => {
    const before = flatSamples(0, 5);
    const after = [5 * 5 + MAX_SAMPLE_GAP_MS + 1, 0, 0, G + 5];
    expect(detectTaps(INITIAL_DETECTOR, [...before, ...after], 'high').taps).toBe(0);
  });

  it('survives the clock going backwards', () => {
    const result = detectTaps({ previous: { t: 1000, x: 0, y: 0, z: G }, lastTapAt: 1000 }, [500, 0, 0, G, 505, 0, 0, G + 3], 'medium');
    expect(result.taps).toBe(1);
  });

  it('counts twenty taps made a quarter of a second apart', () => {
    const spikes: Record<number, number> = {};
    for (let i = 0; i < 20; i++) spikes[100 + i * 250] = 2;
    expect(detectTaps(INITIAL_DETECTOR, flatSamples(0, 1100, spikes), 'medium').taps).toBe(20);
  });
});
