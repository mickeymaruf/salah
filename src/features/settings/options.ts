import type { AsrMethod, CalculationMethodId } from '@/shared/state/profile';
import type { AlarmSoundId, TapSensitivity } from '@/shared/state/settings';

export const CALCULATION_METHOD_LABELS: Record<CalculationMethodId, string> = {
  Karachi: 'Karachi',
  MuslimWorldLeague: 'Muslim World League',
  Egyptian: 'Egyptian',
  UmmAlQura: 'Umm al-Qura',
  NorthAmerica: 'North America (ISNA)',
  Dubai: 'Dubai',
  Qatar: 'Qatar',
  Kuwait: 'Kuwait',
  Singapore: 'Singapore',
  Turkey: 'Turkey (Diyanet)',
  Tehran: 'Tehran',
  MoonsightingCommittee: 'Moonsighting Committee',
};

export const ASR_METHOD_LABELS: Record<AsrMethod, string> = {
  standard: 'Standard',
  hanafi: 'Hanafi',
};

export const ALARM_SOUND_LABELS: Record<AlarmSoundId, string> = {
  chime: 'Chime',
  bell: 'Bell',
  soft: 'Soft',
};

export const TAP_SENSITIVITY_LABELS: Record<TapSensitivity, string> = {
  low: 'Low (firm taps)',
  medium: 'Medium',
  high: 'High (light taps)',
};

export function formatReminder(minutes: number): string {
  return minutes === 0 ? 'Off' : `${minutes} min`;
}

export function labelEntries<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
