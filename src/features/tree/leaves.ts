import { LEAF_DATA } from './leafData';

// The artwork is 1810 x 1810. Everything here is in those units until it is drawn.
export const ASSET_SIZE = 1810;
// Where the tree art starts and ends inside the asset (top of the crown, bottom of the grass).
export const ART_TOP = 165;
export const ART_BOTTOM = 1700;
// Where fallen leaves land: the grass band in asset coordinates.
export const GRASS = { xMin: 430, xMax: 1330, yMin: 1590, yMax: 1670 } as const;

export interface Leaf {
  id: number;
  // 0 to 1. Low ranks fall first.
  rank: number;
  // Box in asset units, after the leaf was enlarged to make up for the thinned-out ones.
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  color: string;
  // Outline in asset units, and in the leaf's own box, as SVG polygon points.
  points: string;
  localPoints: string;
}

// The 700 kept leaves stand in for 3,830, so they are drawn larger: small leaves 2.8x, middling ones 1.8x. Big shading
// shapes (over 150 px) are left out.
const SMALL = 60;
const MEDIUM = 110;
const BIG = 150;
const SMALL_SCALE = 2.8;
const MEDIUM_SCALE = 1.8;

export function parseLeaves(data: string): Leaf[] {
  const leaves: Leaf[] = [];
  for (const row of data.trim().split('\n')) {
    const [rank, x, y, w, h, color, outline] = row.split('|');
    const width = Number(w);
    const height = Number(h);
    const biggest = Math.max(width, height);
    if (biggest > BIG) continue;
    const scale = biggest < SMALL ? SMALL_SCALE : biggest < MEDIUM ? MEDIUM_SCALE : 1;
    const cx = Number(x) + width / 2;
    const cy = Number(y) + height / 2;
    const bw = width * scale;
    const bh = height * scale;
    const world: string[] = [];
    const local: string[] = [];
    for (let i = 0; i + 4 <= outline.length; i += 4) {
      const px = Number(outline.slice(i, i + 2)) / 99;
      const py = Number(outline.slice(i + 2, i + 4)) / 99;
      world.push(`${(cx - bw / 2 + px * bw).toFixed(1)},${(cy - bh / 2 + py * bh).toFixed(1)}`);
      local.push(`${(px * bw).toFixed(1)},${(py * bh).toFixed(1)}`);
    }
    leaves.push({
      id: leaves.length,
      rank: Number(rank) / 1000,
      x: cx - bw / 2,
      y: cy - bh / 2,
      w: bw,
      h: bh,
      cx,
      cy,
      color: `#${color}`,
      points: world.join(' '),
      localPoints: local.join(' '),
    });
  }
  return leaves.sort((a, b) => a.rank - b.rank).map((leaf, id) => ({ ...leaf, id }));
}

export const LEAVES: readonly Leaf[] = parseLeaves(LEAF_DATA);

// A leaf is on the tree when its rank is at or above 1 - fullness, so every fullness shows the same leaves.
export function isVisible(leaf: Leaf, fullness: number): boolean {
  return leaf.rank >= 1 - fullness - 1e-9;
}

export function visibleLeaves(leaves: readonly Leaf[], fullness: number): Leaf[] {
  return leaves.filter((leaf) => isVisible(leaf, fullness));
}

// Leaves that go when fullness drops from `from` to `to`, lowest rank (outer and top) first.
export function fallingLeaves(leaves: readonly Leaf[], from: number, to: number): Leaf[] {
  return leaves.filter((leaf) => isVisible(leaf, from) && !isVisible(leaf, to));
}

// Leaves that come back when fullness rises from `from` to `to`, highest rank (inner) first.
export function growingLeaves(leaves: readonly Leaf[], from: number, to: number): Leaf[] {
  return leaves.filter((leaf) => isVisible(leaf, to) && !isVisible(leaf, from)).reverse();
}
