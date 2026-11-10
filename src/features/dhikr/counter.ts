export interface CounterState {
  day: string;
  count: number;
}

// One tap adds one recitation. If the day changed since the last tap, the old day is returned as `closed` so it can be saved
// as it was, and the count starts again at 1 on the new day.
export function registerTap(state: CounterState, today: string): { next: CounterState; closed: CounterState | null } {
  if (state.day !== today) return { next: { day: today, count: 1 }, closed: state };
  return { next: { day: state.day, count: state.count + 1 }, closed: null };
}
