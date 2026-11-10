// Makes assets/images/tick-white.png at 1x, 2x and 3x (168, 336, 504 px) from the Figma asset "Asset · tick white" (26005:100).
//
//   node scripts/prepare-tick.js path/to/tick-white-1024.png
//
// Figma draws the 1024 px picture at 150% of the 112 px circle, shifted 25% up and left, then clips it to the circle.
// The picture is kept whole here and the screen clips and offsets it the same way.
const path = require('path');
const sharp = require('sharp');

const source = process.argv[2];
if (!source) throw new Error('Pass the path of the 1024 px tick picture.');
const outDir = path.join(__dirname, '..', 'assets', 'images');

(async () => {
  for (const [suffix, size] of [['', 168], ['@2x', 336], ['@3x', 504]]) {
    await sharp(source).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(outDir, `tick-white${suffix}.png`));
  }
})();
