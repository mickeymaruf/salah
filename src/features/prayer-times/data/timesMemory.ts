import type { CalculationInput, DayTimes } from '../calculate';

const memory = new Map<string, DayTimes>();

// Rounded so GPS jitter does not trigger a new download. Two decimals is about 1 km.
export function tableKey(input: CalculationInput): string {
  return `${input.latitude.toFixed(2)},${input.longitude.toFixed(2)},${input.calculationMethod},${input.asrMethod}`;
}

export function lookupTimes(input: CalculationInput, dateKey: string): DayTimes | null {
  return memory.get(`${tableKey(input)}|${dateKey}`) ?? null;
}

export function rememberTimes(input: CalculationInput, table: Record<string, DayTimes>): void {
  for (const [dateKey, times] of Object.entries(table)) memory.set(`${tableKey(input)}|${dateKey}`, times);
}
