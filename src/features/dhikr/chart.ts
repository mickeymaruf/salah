export interface Point {
  x: number;
  y: number;
}

const round = (n: number): number => Math.round(n * 100) / 100;

// A smooth line through the points. Each control point is pulled `tension` of the way along the neighbours' chord, then kept between the
// two points it joins, so a spike or a drop never makes the curve overshoot.
export function smoothPath(points: readonly Point[], tension = 0.12): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  let path = `M ${round(first.x)} ${round(first.y)}`;
  if (rest.length === 0) return path;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const low = Math.min(p1.y, p2.y);
    const high = Math.max(p1.y, p2.y);
    const clamp = (y: number) => Math.min(high, Math.max(low, y));
    const c1 = { x: p1.x + (p2.x - p0.x) * tension, y: clamp(p1.y + (p2.y - p0.y) * tension) };
    const c2 = { x: p2.x - (p3.x - p1.x) * tension, y: clamp(p2.y - (p3.y - p1.y) * tension) };
    path += ` C ${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p2.x)} ${round(p2.y)}`;
  }
  return path;
}

// Rounds up to 1, 2 or 5 times a power of ten.
export function niceStep(value: number): number {
  if (!(value > 0)) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const unit = value / power;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  return nice * power;
}

export const HEADROOM = 1.2;
export const EMPTY_MAX = 100;

export interface ChartScale {
  max: number;
  // Values of the horizontal grid lines, from 0 up.
  ticks: number[];
}

// The top of the plot is the highest day plus 20%. The grid lines sit on round numbers (0, 100, 200 for a top of 240).
export function chartScale(values: readonly (number | null)[]): ChartScale {
  const highest = Math.max(0, ...values.filter((value): value is number => value !== null));
  const max = highest > 0 ? highest * HEADROOM : EMPTY_MAX;
  const step = niceStep(max / 2.4);
  const ticks: number[] = [];
  for (let tick = 0; tick <= max; tick += step) ticks.push(tick);
  return { max, ticks };
}

export function valueY(value: number, max: number, top: number, height: number): number {
  return top + height - (Math.min(value, max) / max) * height;
}

// Points sit `width / (count - 1)` apart; a single day sits in the middle.
export function dayX(index: number, count: number, left: number, width: number): number {
  return count > 1 ? left + (index * width) / (count - 1) : left + width / 2;
}

export function formatThousands(value: number): string {
  const digits = String(Math.round(Math.abs(value)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return value < 0 ? `-${grouped}` : grouped;
}

// Sparkline points for the strip on the list: oldest day on the left, today on the right, the highest on top. A flat run draws mid-height.
export function sparklinePoints(values: readonly number[], left: number, width: number, top: number, height: number): Point[] {
  const low = Math.min(...values);
  const high = Math.max(...values);
  return values.map((value, i) => ({
    x: dayX(i, values.length, left, width),
    y: high === low ? top + height / 2 : top + height - ((value - low) / (high - low)) * height,
  }));
}
