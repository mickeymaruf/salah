// What the card and the tree showed the last time the Tree screen finished drawing.
export interface TreeSnapshot {
  fullness: number;
  perfectDays: number;
  streak: number;
}

export const EMPTY_SNAPSHOT: TreeSnapshot = { fullness: 0, perfectDays: 0, streak: 0 };

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

// Null when nothing valid is stored, which the screen treats as the first ever open.
export function parseSnapshot(raw: string | null): TreeSnapshot | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { fullness, perfectDays, streak } = value as Record<string, unknown>;
    if (typeof fullness !== 'number' || !(fullness >= 0 && fullness <= 1)) return null;
    if (!isCount(perfectDays) || !isCount(streak)) return null;
    return { fullness, perfectDays, streak };
  } catch {
    return null;
  }
}
