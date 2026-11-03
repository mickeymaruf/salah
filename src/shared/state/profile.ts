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

// Hand-set times, "HH:mm" in 24 hours. A prayer with no entry uses the calculated time.
export type ManualTimes = Partial<Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', string>>;

const MANUAL_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const CLOCK_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface Profile {
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  calculationMethod: CalculationMethodId;
  asrMethod: AsrMethod;
  manualTimes?: ManualTimes;
  // First day of tracking (YYYY-MM-DD). Days before it are not counted as missed.
  startedOn?: string;
}

export const DEFAULT_CALCULATION_METHOD: CalculationMethodId = 'Karachi';
export const DEFAULT_ASR_METHOD: AsrMethod = 'standard';

// Countries where the Hanafi school (later Asr) is the norm.
const HANAFI_COUNTRIES = ['bangladesh', 'pakistan', 'india', 'afghanistan', 'turkey', 'türkiye', 'uzbekistan', 'tajikistan'];

export function defaultAsrFor(country: string): AsrMethod {
  return HANAFI_COUNTRIES.includes(country.trim().toLowerCase()) ? 'hanafi' : DEFAULT_ASR_METHOD;
}

function isManualTimes(value: unknown): value is ManualTimes {
  if (typeof value !== 'object' || value === null) return false;
  return Object.entries(value).every(
    ([key, time]) =>
      (MANUAL_KEYS as readonly string[]).includes(key) && typeof time === 'string' && CLOCK_PATTERN.test(time),
  );
}

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
    if (!valid) return null;
    // A damaged edit list must not cost the user their whole profile: fall back to automatic times.
    const { manualTimes, ...rest } = value as Profile;
    return isManualTimes(manualTimes) && Object.keys(manualTimes).length > 0 ? { ...rest, manualTimes } : (rest as Profile);
  } catch {
    return null;
  }
}
