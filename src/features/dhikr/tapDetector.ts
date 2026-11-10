import type { TapSensitivity } from '@/shared/state/settings';

// A fingernail tap on the phone shows up as a sudden change in the accelerometer reading from one sample to the next. The size of that change
// (in m/s2, gravity cancels out) must pass the threshold. These numbers are a first guess to be tuned on a real phone.
export const TAP_THRESHOLDS: Record<TapSensitivity, number> = { high: 0.5, medium: 1, low: 2 };

// After a tap the phone rings for a moment. Further spikes inside this time are the same tap.
export const TAP_REFRACTORY_MS = 150;

// If samples are further apart than this (the app was paused), the change across the gap means nothing.
export const MAX_SAMPLE_GAP_MS = 100;

export interface Sample {
  t: number;
  x: number;
  y: number;
  z: number;
}

export interface DetectorState {
  previous: Sample | null;
  lastTapAt: number | null;
}

export const INITIAL_DETECTOR: DetectorState = { previous: null, lastTapAt: null };

// Samples arrive from the native side as one flat list: time (ms), x, y, z, time, x, y, z, ...
export function unpackSamples(flat: readonly number[]): Sample[] {
  const samples: Sample[] = [];
  for (let i = 0; i + 3 < flat.length; i += 4) samples.push({ t: flat[i], x: flat[i + 1], y: flat[i + 2], z: flat[i + 3] });
  return samples;
}

// Counts the taps in a batch of samples and returns the state to carry into the next batch.
export function detectTaps(state: DetectorState, flat: readonly number[], sensitivity: TapSensitivity): { state: DetectorState; taps: number } {
  const threshold = TAP_THRESHOLDS[sensitivity];
  let { previous, lastTapAt } = state;
  let taps = 0;
  for (const sample of unpackSamples(flat)) {
    if (previous && sample.t > previous.t && sample.t - previous.t <= MAX_SAMPLE_GAP_MS) {
      const change = Math.hypot(sample.x - previous.x, sample.y - previous.y, sample.z - previous.z);
      const quiet = lastTapAt === null || sample.t - lastTapAt >= TAP_REFRACTORY_MS || sample.t < lastTapAt;
      if (change >= threshold && quiet) {
        taps += 1;
        lastTapAt = sample.t;
      }
    }
    previous = sample;
  }
  return { state: { previous, lastTapAt }, taps };
}
