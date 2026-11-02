export type CalculationMethodId =
  | 'Karachi'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'UmmAlQura'
  | 'NorthAmerica'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran'
  | 'MoonsightingCommittee';

export type AsrMethod = 'standard' | 'hanafi';

export interface Profile {
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  calculationMethod: CalculationMethodId;
  asrMethod: AsrMethod;
  // First day of tracking (YYYY-MM-DD). Days before it are not counted as missed.
  startedOn?: string;
}

export const DEFAULT_CALCULATION_METHOD: CalculationMethodId = 'Karachi';
export const DEFAULT_ASR_METHOD: AsrMethod = 'standard';

// Stored JSON is untrusted: an old or corrupted value must not crash the app on launch.
export function parseProfile(raw: string | null): Profile | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const p = value as Record<string, unknown>;
    const valid =
      typeof p.name === 'string' &&
      p.name.length > 0 &&
      typeof p.latitude === 'number' &&
      typeof p.longitude === 'number' &&
      typeof p.city === 'string' &&
      typeof p.country === 'string' &&
      typeof p.calculationMethod === 'string' &&
      (p.asrMethod === 'standard' || p.asrMethod === 'hanafi') &&
      (p.startedOn === undefined || typeof p.startedOn === 'string');
    return valid ? (value as Profile) : null;
  } catch {
    return null;
  }
}
