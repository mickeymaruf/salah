// Makes the five round prayer icons for the home screen widget: assets/images/widget-<prayer>.png at 1x, 2x and 3x (36, 72, 108 px), each a transparent PNG with a
// circular edge, so the widget does not depend on the launcher's corner-radius support.
//
//   node scripts/prepare-widget-icons.js fajr=Fajr.png dhuhr=Dhuhr.png asr=Asr.png maghrib=Maghrib.png isha=Isha.png
//
// The sources are the "Asset" images on the Figma Screens page (nodes 18039:13 to 18039:17), square renders of the 3D art. Figma shows each one at 130% of the 36 px
// circle, shifted 15% up and left, so the circle holds the middle 1/1.3 of the picture.
const path = require('path');
const sharp = require('sharp');

const SIZE = 36;
const ZOOM = 1.3;
const outDir = path.join(__dirname, '..', 'assets', 'images');

async function prepare(name, file) {
  const { width } = await sharp(file).metadata();
  const length = Math.round(width / ZOOM);
  const start = Math.round((width - length) / 2);
  for (const [suffix, px] of [['', SIZE], ['@2x', SIZE * 2], ['@3x', SIZE * 3]]) {
    const mask = Buffer.from(`<svg width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`);
    const out = path.join(outDir, `widget-${name}${suffix}.png`);
    await sharp(file)
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
  console.error('Usage: node scripts/prepare-widget-icons.js fajr=Fajr.png dhuhr=Dhuhr.png asr=Asr.png maghrib=Maghrib.png isha=Isha.png');
  process.exit(1);
}
pairs.reduce((chain, [name, file]) => chain.then(() => prepare(name, file)), Promise.resolve());
