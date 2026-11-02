import type { CalculationMethodId } from '@/shared/state/profile';
import { PRAYER_NAMES, type CalculationInput, type DayTimes } from '../calculate';

// Method ids from https://aladhan.com/prayer-times-api
const METHOD_IDS: Record<CalculationMethodId, number> = {
  Karachi: 1,
  NorthAmerica: 2,
  MuslimWorldLeague: 3,
  UmmAlQura: 4,
  Egyptian: 5,
  Tehran: 7,
  Kuwait: 9,
  Qatar: 10,
  Singapore: 11,
  Turkey: 13,
  MoonsightingCommittee: 15,
  Dubai: 16,
};

const KEYS: Record<keyof DayTimes, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

// `month` is 1-12. Times come back in the time zone of the coordinates.
export function buildCalendarUrl(input: CalculationInput, year: number, month: number): string {
  const school = input.asrMethod === 'hanafi' ? 1 : 0;
  const query = `latitude=${input.latitude}&longitude=${input.longitude}&method=${METHOD_IDS[input.calculationMethod]}&school=${school}`;
  return `https://api.aladhan.com/v1/calendar/${year}/${month}?${query}`;
}

function parseClock(value: unknown): { hours: number; minutes: number } | null {
  // Values look like "04:54 (+06)".
  const match = typeof value === 'string' ? /(\d{1,2}):(\d{2})/.exec(value) : null;
  return match ? { hours: Number(match[1]), minutes: Number(match[2]) } : null;
}

// Returns times by local date key, or null if the response is not what we expect.
// A day whose times are not in order is rejected, so a bad response never replaces the offline calculation.
export function parseCalendar(json: unknown): Record<string, DayTimes> | null {
  const data = (json as { data?: unknown } | null)?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const days: Record<string, DayTimes> = {};
  for (const item of data) {
    const gregorian = item?.date?.gregorian?.date;
    const parts = typeof gregorian === 'string' ? gregorian.split('-').map(Number) : [];
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const [day, month, year] = parts;

    const times = {} as DayTimes;
    for (const name of PRAYER_NAMES) {
      const clock = parseClock(item?.timings?.[KEYS[name]]);
      if (!clock) return null;
      times[name] = new Date(year, month - 1, day, clock.hours, clock.minutes);
    }
    const instants = PRAYER_NAMES.map((name) => times[name].getTime());
    if (instants.some((value, i) => i > 0 && value <= instants[i - 1])) return null;

    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days[key] = times;
  }
  return days;
}

export async function fetchMonth(
  input: CalculationInput,
  year: number,
  month: number,
): Promise<Record<string, DayTimes> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(buildCalendarUrl(input, year, month), { signal: controller.signal });
    return response.ok ? parseCalendar(await response.json()) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
