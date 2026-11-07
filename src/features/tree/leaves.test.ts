import { LEAVES, fallingLeaves, growingLeaves, isVisible, parseLeaves, visibleLeaves } from './leaves';

describe('leaves', () => {
  it('loads a few hundred leaves, sorted by rank, with outlines', () => {
    expect(LEAVES.length).toBeGreaterThan(600);
    expect(LEAVES.length).toBeLessThanOrEqual(700);
    for (let i = 1; i < LEAVES.length; i++) expect(LEAVES[i].rank).toBeGreaterThanOrEqual(LEAVES[i - 1].rank);
    for (const leaf of LEAVES) {
      expect(leaf.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(leaf.points.split(' ').length).toBeGreaterThanOrEqual(3);
      expect(leaf.localPoints.split(' ').length).toBe(leaf.points.split(' ').length);
      expect(leaf.rank).toBeGreaterThanOrEqual(0);
      expect(leaf.rank).toBeLessThan(1);
    }
  });

  it('shows all leaves at 1 and none at 0', () => {
    expect(visibleLeaves(LEAVES, 1)).toHaveLength(LEAVES.length);
    expect(visibleLeaves(LEAVES, 0)).toHaveLength(0);
  });

  it('keeps lower fullness leaves inside higher fullness ones', () => {
    const low = new Set(visibleLeaves(LEAVES, 0.4).map((l) => l.id));
    const high = new Set(visibleLeaves(LEAVES, 0.7).map((l) => l.id));
    for (const id of low) expect(high.has(id)).toBe(true);
    expect(high.size).toBeGreaterThan(low.size);
  });

  it('shows roughly the fullness share of leaves', () => {
    expect(visibleLeaves(LEAVES, 0.7).length / LEAVES.length).toBeGreaterThan(0.65);
    expect(visibleLeaves(LEAVES, 0.7).length / LEAVES.length).toBeLessThan(0.75);
  });

  it('falls lowest rank first and grows highest rank first', () => {
    const falling = fallingLeaves(LEAVES, 0.8, 0.775);
    expect(falling.length).toBeGreaterThan(0);
    for (let i = 1; i < falling.length; i++) expect(falling[i].rank).toBeGreaterThanOrEqual(falling[i - 1].rank);
    const growing = growingLeaves(LEAVES, 0.775, 0.8);
    expect(growing.map((l) => l.id).sort()).toEqual(falling.map((l) => l.id).sort());
    for (let i = 1; i < growing.length; i++) expect(growing[i].rank).toBeLessThanOrEqual(growing[i - 1].rank);
  });

  it('puts the falling set below the old edge and at or above the new one', () => {
    for (const leaf of fallingLeaves(LEAVES, 0.7, 0.5)) {
      expect(isVisible(leaf, 0.7)).toBe(true);
      expect(isVisible(leaf, 0.5)).toBe(false);
    }
  });

  it('enlarges small leaves and skips big shading shapes', () => {
    const [leaf] = parseLeaves('500|100|200|10|20|3ba12d|00009999\n600|0|0|300|300|3ba12d|00009999');
    expect(leaf.w).toBeCloseTo(28);
    expect(leaf.cx).toBeCloseTo(105);
    expect(parseLeaves('600|0|0|300|300|3ba12d|00009999')).toHaveLength(0);
  });
});
