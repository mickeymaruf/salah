// Makes the round 3D pictures for the "Log a prayer" sheet, each a transparent PNG with a circular edge at 1x, 2x and 3x:
//   assets/images/sheet-tick.png and sheet-cross.png  (76, 152, 228 px)   from the Illustrator SVGs of the tick and cross
//   assets/images/sheet-<prayer>.png                   (56, 112, 168 px)   from the square PNG renders of the Figma "Asset" images (nodes 18039:13 to 18039:17)
//
//   node scripts/prepare-sheet-icons.js tick=Prayed_button.svg cross=Missed_button.svg fajr=Fajr.png dhuhr=Dhuhr.png asr=Asr.png maghrib=Maghrib.png isha=Isha.png
//
// An SVG only wraps one 1024 px PNG. Figma shows the tick and cross at 150% of the 76 px circle, shifted 25% up and left, so the circle holds the part the SVG shows.
// A prayer picture is shown at 130% of the 56 px circle, shifted 15% up and left, so the circle holds the middle 1/1.3 of it.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'assets', 'images');

function load(file) {
  if (!file.endsWith('.svg')) return { png: fs.readFileSync(file), size: 56, zoom: 1.3, offset: 0.15 };
  const match = fs.readFileSync(file, 'utf8').match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error(`No embedded PNG in ${file}`);
  return { png: Buffer.from(match[1], 'base64'), size: 76, zoom: 1.5, offset: 0.25 };
}

async function prepare(name, file) {
  const { png, size, zoom, offset } = load(file);
  const { width } = await sharp(png).metadata();
  const start = Math.round((offset / zoom) * width);
  const length = Math.round(width / zoom);
  for (const [suffix, scale] of [['', 1], ['@2x', 2], ['@3x', 3]]) {
    const px = size * scale;
    const mask = Buffer.from(`<svg width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`);
    const out = path.join(outDir, `sheet-${name}${suffix}.png`);
    await sharp(png)
      .extract({ left: start, top: start, width: length, height: length })
      .resize(px, px)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`Wrote ${out}`);
  }
}

const pairs = process.argv.slice(2).map((arg) => arg.split('='));
if (pairs.length === 0 || pairs.some(([name, file]) => !name || !file)) {
  console.error('Usage: node scripts/prepare-sheet-icons.js tick=Prayed_button.svg cross=Missed_button.svg fajr=Fajr.png dhuhr=Dhuhr.png asr=Asr.png maghrib=Maghrib.png isha=Isha.png');
  process.exit(1);
}
pairs.reduce((chain, [name, file]) => chain.then(() => prepare(name, file)), Promise.resolve());
