import { GRASS, type Leaf } from './leaves';

export type TreeTransition =
  | { kind: 'none' }
  | { kind: 'grow'; from: number; to: number }
  | { kind: 'fall'; from: number; to: number };

// First ever open (no last seen value) grows the tree in from nothing.
export function planTransition(lastSeen: number | null, current: number): TreeTransition {
  const from = lastSeen ?? 0;
  if (Math.abs(current - from) < 1e-9) return { kind: 'none' };
  return current > from ? { kind: 'grow', from, to: current } : { kind: 'fall', from, to: current };
}

export const HOLD_MS = 500;
export const FALL_STAGGER_MS = 900;
export const FALL_MIN_MS = 1100;
export const FALL_MAX_MS = 1800;
export const SETTLE_MS = 180;
export const GROW_STAGGER_MS = 700;
export const COUNT_MS = 400;
export const FADE_MS = 300;
// Every fall draws at most this many leaves one by one. The rest of a big fall fade out together.
export const MAX_FALLERS = 60;
export const MAX_GROW_GROUPS = 24;
export const MAX_RESTING = 34;

export interface DropSpec {
  leaf: Leaf;
  delay: number;
  duration: number;
  // Side sway in screen pixels, and spin in degrees (negative turns left).
  sway: number;
  spin: number;
  // Where it lands and how it lies, in asset units and degrees.
  landX: number;
  landY: number;
  restAngle: number;
}

export interface FallPlan {
  drops: DropSpec[];
  // Leaves beyond MAX_FALLERS: they fade out instead of falling.
  faded: Leaf[];
}

function between(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

// `leaves` must be in fall order (lowest rank first). Picks MAX_FALLERS spread evenly when there are more.
export function planFall(leaves: readonly Leaf[], rng: () => number): FallPlan {
  const count = Math.min(leaves.length, MAX_FALLERS);
  const chosen = new Set<number>();
  for (let i = 0; i < count; i++) chosen.add(Math.floor(((i + 0.5) * leaves.length) / count));
  const droppers = leaves.filter((_, i) => chosen.has(i));
  const faded = leaves.filter((_, i) => !chosen.has(i));
  const drops = droppers.map((leaf, i): DropSpec => {
    const direction = rng() < 0.5 ? -1 : 1;
    return {
      leaf,
      delay: droppers.length > 1 ? (i / (droppers.length - 1)) * FALL_STAGGER_MS : 0,
      duration: between(rng, FALL_MIN_MS, FALL_MAX_MS),
      sway: between(rng, 10, 40) * (rng() < 0.5 ? -1 : 1),
      spin: between(rng, 60, 240) * direction,
      landX: Math.min(GRASS.xMax, Math.max(GRASS.xMin, leaf.cx)),
      landY: between(rng, GRASS.yMin, GRASS.yMax),
      restAngle: between(rng, -80, 80),
    };
  });
  return { drops, faded };
}

export interface GrowGroup {
  leaves: Leaf[];
  delay: number;
}

// `leaves` must be in grow order (inner first). Up to MAX_GROW_GROUPS groups, so a big grow is not 700 animations.
export function planGrow(leaves: readonly Leaf[]): GrowGroup[] {
  const count = Math.min(leaves.length, MAX_GROW_GROUPS);
  if (count === 0) return [];
  const groups: GrowGroup[] = [];
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i * leaves.length) / count);
    const end = Math.floor(((i + 1) * leaves.length) / count);
    groups.push({ leaves: leaves.slice(start, end), delay: count > 1 ? (i / (count - 1)) * GROW_STAGGER_MS : 0 });
  }
  return groups;
}

// Keeps the newest `max` resting leaves; the oldest ones in front of them fade out.
export function overflowResting<T>(resting: readonly T[], max: number): T[] {
  return resting.slice(0, Math.max(0, resting.length - max));
}

// Small deterministic generator for tests and for tuning. The screen uses Math.random.
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
