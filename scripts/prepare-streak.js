// Makes the streak flame picture for Progress: assets/images/stat-streak.png at 1x, 2x and 3x (38, 76, 114 px).
//
//   node scripts/prepare-streak.js path/to/Icon.svg
//
// The Figma export (node 18035:51) is a 38 px SVG that only wraps one 1024 px PNG, drawn at 117.65% of the icon and shifted 8.82% up
// and left. This pulls the PNG out and crops the part the SVG shows.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZE = 38;
const SCALE = 1.1765;
const OFFSET = 0.0882353;
const outDir = path.join(__dirname, '..', 'assets', 'images');

async function prepare(svgPath) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error(`No embedded PNG in ${svgPath}`);
  const png = Buffer.from(match[1], 'base64');
  const { width } = await sharp(png).metadata();
  const start = Math.round((OFFSET / SCALE) * width);
  const length = Math.round(width / SCALE);
  for (const [suffix, px] of [['', SIZE], ['@2x', SIZE * 2], ['@3x', SIZE * 3]]) {
    const file = path.join(outDir, `stat-streak${suffix}.png`);
    await sharp(png).extract({ left: start, top: start, width: length, height: length }).resize(px, px).png({ compressionLevel: 9 }).toFile(file);
    console.log(`Wrote ${file}`);
  }
}

const [svgPath] = process.argv.slice(2);
if (!svgPath) {
  console.error('Usage: node scripts/prepare-streak.js Icon.svg');
  process.exit(1);
}
prepare(svgPath);
