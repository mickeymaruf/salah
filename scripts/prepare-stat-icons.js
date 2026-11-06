// Makes the three Progress pill icons: assets/images/stat-prayed.png, stat-missed.png and stat-streak.png, each at 1x, 2x and 3x (40, 80, 120 px).
//
//   node scripts/prepare-stat-icons.js prayed=Prayed_button.svg missed=Missed_button.svg streak=Icon.svg
//
// Each Figma export is an SVG that only wraps one 1024 px PNG. The stat icons (nodes 18035:37, 18035:44 and 18035:51) show the whole picture, drawn
// at 117.65% of the icon and shifted 8.82% up and left. This pulls the PNG out and crops the part the pill shows. Today's round buttons use a tighter crop
// (`prepare-buttons.js`), which would cut the shadow off here.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZE = 40;
const SCALE = 1.1765;
const OFFSET = 0.0882353;
const outDir = path.join(__dirname, '..', 'assets', 'images');

async function prepare(name, svgPath) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error(`No embedded PNG in ${svgPath}`);
  const png = Buffer.from(match[1], 'base64');
  const { width } = await sharp(png).metadata();
  const start = Math.round((OFFSET / SCALE) * width);
  const length = Math.round(width / SCALE);
  for (const [suffix, px] of [['', SIZE], ['@2x', SIZE * 2], ['@3x', SIZE * 3]]) {
    const file = path.join(outDir, `stat-${name}${suffix}.png`);
    await sharp(png).extract({ left: start, top: start, width: length, height: length }).resize(px, px).png({ compressionLevel: 9 }).toFile(file);
    console.log(`Wrote ${file}`);
  }
}

const pairs = process.argv.slice(2).map((arg) => arg.split('='));
if (pairs.length === 0 || pairs.some(([name, file]) => !name || !file)) {
  console.error('Usage: node scripts/prepare-stat-icons.js prayed=Prayed_button.svg missed=Missed_button.svg streak=Icon.svg');
  process.exit(1);
}
pairs.reduce((chain, [name, file]) => chain.then(() => prepare(name, file)), Promise.resolve());
