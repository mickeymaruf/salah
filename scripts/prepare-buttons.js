// Makes the two Today button pictures: assets/images/button-missed.png and button-prayed.png, each at 1x, 2x and 3x (38, 76, 114 px).
//
//   node scripts/prepare-buttons.js path/to/Missed_button.svg path/to/Prayed_button.svg
//
// The Figma exports (nodes 14034:15 and 14034:31) are a 38 px SVG that only wraps one 1024 px PNG, placed at 150% of the button and shifted
// 25% up and left, then clipped to a circle. This pulls the PNG out and crops the part the SVG shows. The circle is cut by the button's
// own border radius in the app.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZE = 38;
const SCALE = 1.5;
const OFFSET = -0.25;
const outDir = path.join(__dirname, '..', 'assets', 'images');

async function prepare(svgPath, name) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error(`No embedded PNG in ${svgPath}`);
  const png = Buffer.from(match[1], 'base64');
  const { width } = await sharp(png).metadata();
  // The picture is drawn SCALE x the button wide, starting OFFSET x the button before its edge. Find the part inside the button.
  const shown = SIZE * SCALE;
  const start = Math.round((-OFFSET * SIZE * width) / shown);
  const length = Math.round((SIZE * width) / shown);
  for (const [suffix, px] of [['', SIZE], ['@2x', SIZE * 2], ['@3x', SIZE * 3]]) {
    const file = path.join(outDir, `button-${name}${suffix}.png`);
    await sharp(png).extract({ left: start, top: start, width: length, height: length }).resize(px, px).png({ compressionLevel: 9 }).toFile(file);
    console.log(`Wrote ${file}`);
  }
}

const [missed, prayed] = process.argv.slice(2);
if (!missed || !prayed) {
  console.error('Usage: node scripts/prepare-buttons.js Missed_button.svg Prayed_button.svg');
  process.exit(1);
}
prepare(missed, 'missed').then(() => prepare(prayed, 'prayed'));
