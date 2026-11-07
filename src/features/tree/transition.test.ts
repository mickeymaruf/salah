import { GRASS, LEAVES, fallingLeaves, growingLeaves } from './leaves';
import {
  FALL_MAX_MS,
  FALL_MIN_MS,
  FALL_STAGGER_MS,
  MAX_FALLERS,
  MAX_GROW_GROUPS,
  overflowResting,
  planFall,
  planGrow,
  planTransition,
  seededRandom,
} from './transition';

describe('planTransition', () => {
  it('grows in from nothing on the first open', () => {
    expect(planTransition(null, 0.7)).toEqual({ kind: 'grow', from: 0, to: 0.7 });
  });
  it('does nothing on the first open of an empty tree', () => {
    expect(planTransition(null, 0)).toEqual({ kind: 'none' });
  });
  it('falls when fullness dropped, grows when it rose, otherwise nothing', () => {
    expect(planTransition(0.7, 0.675)).toEqual({ kind: 'fall', from: 0.7, to: 0.675 });
    expect(planTransition(0.4, 0.45)).toEqual({ kind: 'grow', from: 0.4, to: 0.45 });
    expect(planTransition(0.4, 0.4)).toEqual({ kind: 'none' });
  });
});

describe('planFall', () => {
  const leaves = fallingLeaves(LEAVES, 0.7, 0.675);

  it('staggers drops over 900 ms in rank order with the spec ranges', () => {
    const { drops, faded } = planFall(leaves, seededRandom(1));
    expect(faded).toHaveLength(0);
    expect(drops).toHaveLength(leaves.length);
    expect(drops[0].delay).toBe(0);
    expect(drops[drops.length - 1].delay).toBeCloseTo(FALL_STAGGER_MS);
    for (let i = 1; i < drops.length; i++) {
      expect(drops[i].delay).toBeGreaterThanOrEqual(drops[i - 1].delay);
      expect(drops[i].leaf.rank).toBeGreaterThanOrEqual(drops[i - 1].leaf.rank);
    }
    for (const drop of drops) {
      expect(drop.duration).toBeGreaterThanOrEqual(FALL_MIN_MS);
      expect(drop.duration).toBeLessThanOrEqual(FALL_MAX_MS);
      expect(Math.abs(drop.sway)).toBeGreaterThanOrEqual(10);
      expect(Math.abs(drop.sway)).toBeLessThanOrEqual(40);
      expect(Math.abs(drop.spin)).toBeGreaterThanOrEqual(60);
      expect(Math.abs(drop.spin)).toBeLessThanOrEqual(240);
      expect(Math.abs(drop.restAngle)).toBeLessThanOrEqual(80);
      expect(drop.landX).toBeGreaterThanOrEqual(GRASS.xMin);
      expect(drop.landX).toBeLessThanOrEqual(GRASS.xMax);
      expect(drop.landY).toBeGreaterThanOrEqual(GRASS.yMin);
      expect(drop.landY).toBeLessThanOrEqual(GRASS.yMax);
    }
  });

  it('lets only MAX_FALLERS fall one by one and fades the rest', () => {
    const many = fallingLeaves(LEAVES, 1, 0.5);
    const { drops, faded } = planFall(many, seededRandom(2));
    expect(drops).toHaveLength(MAX_FALLERS);
    expect(drops.length + faded.length).toBe(many.length);
  });

  it('handles a single leaf and an empty fall', () => {
    expect(planFall(leaves.slice(0, 1), seededRandom(3)).drops[0].delay).toBe(0);
    expect(planFall([], seededRandom(3))).toEqual({ drops: [], faded: [] });
  });
});

describe('planGrow', () => {
  it('is one group per leaf for a small grow, in order', () => {
    const leaves = growingLeaves(LEAVES, 0.675, 0.7);
    const groups = planGrow(leaves);
    expect(groups).toHaveLength(leaves.length);
    expect(groups.flatMap((g) => g.leaves.map((l) => l.id))).toEqual(leaves.map((l) => l.id));
    expect(groups[0].delay).toBe(0);
    expect(groups[groups.length - 1].delay).toBeCloseTo(700);
  });

  it('caps the number of groups for a big grow and keeps every leaf once', () => {
    const leaves = growingLeaves(LEAVES, 0, 1);
    const groups = planGrow(leaves);
    expect(groups).toHaveLength(MAX_GROW_GROUPS);
    expect(groups.reduce((sum, g) => sum + g.leaves.length, 0)).toBe(leaves.length);
  });

  it('is empty with nothing to grow', () => {
    expect(planGrow([])).toEqual([]);
  });
});

describe('overflowResting', () => {
  it('returns the oldest items beyond the cap', () => {
    expect(overflowResting([1, 2, 3, 4, 5], 3)).toEqual([1, 2]);
    expect(overflowResting([1, 2], 3)).toEqual([]);
  });
});
