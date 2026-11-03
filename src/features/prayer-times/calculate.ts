import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan';
import { toDateKey } from '@/shared/lib/date';
import type { AsrMethod, CalculationMethodId, ManualTimes } from '@/shared/state/profile';
import { lookupTimes } from './data/timesMemory';
import { applyManualTimes } from './manualTimes';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_NAMES: readonly PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export type DayTimes = Record<PrayerName, Date>;

export interface CalculationInput {
  latitude: number;
  longitude: number;
  calculationMethod: CalculationMethodId;
  asrMethod: AsrMethod;
  manualTimes?: ManualTimes;
}

// Times from the API when this month was downloaded, otherwise the on-device calculation.
// Hand-set times replace those per prayer. Every screen and the alarm planner read times through here.
export function getDayTimes(input: CalculationInput, date: Date): DayTimes {
  return applyManualTimes(getAutomaticTimes(input, date), input.manualTimes, date);
}

export function getAutomaticTimes(input: CalculationInput, date: Date): DayTimes {
  return lookupTimes(input, toDateKey(date)) ?? calculateDayTimes(input, date);
}

// The calendar day comes from the local date of `date`; adhan returns absolute instants.
export function calculateDayTimes(input: CalculationInput, date: Date): DayTimes {
  const coordinates = new Coordinates(input.latitude, input.longitude);
  const params = CalculationMethod[input.calculationMethod]();
  params.madhab = input.asrMethod === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  const times = new PrayerTimes(coordinates, date, params);
  return {
    fajr: times.fajr,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}
