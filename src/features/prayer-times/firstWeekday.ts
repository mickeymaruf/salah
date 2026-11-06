import { getCalendars } from 'expo-localization';

// The day the device's calendar starts its week on: 0 for Sunday up to 6 for Saturday. Sunday when the phone does not say.
export function deviceFirstWeekday(): number {
  const weekday = getCalendars()[0]?.firstWeekday;
  return typeof weekday === 'number' && weekday >= 1 && weekday <= 7 ? weekday - 1 : 0;
}
