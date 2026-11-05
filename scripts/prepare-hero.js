// Makes the Today hero image: assets/images/today-hero.png (780 x 1170, shown at 390 x 585).
//
//   node scripts/prepare-hero.js path/to/figma-export.png   desaturates about 55% and lowers contrast about 5%
//   node scripts/prepare-hero.js                            draws a plain misty mosque stand-in
//
// The real picture is Figma node 14018:15 ("Dreamy Mint Mosque at Dawn 1"), file OgLgPUUPDO1UindTOIu39O.
const path = require('path');
const sharp = require('sharp');

const WIDTH = 780;
const HEIGHT = 1170;
const output = path.join(__dirname, '..', 'assets', 'images', 'today-hero.png');

// Same filter the Figma hero uses: saturation x0.45, contrast -5% around mid grey.
async function filtered(input) {
  const contrast = 0.95;
  return sharp(input)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
    .modulate({ saturation: 0.45 })
    .linear(contrast, 128 * (1 - contrast))
    .png()
    .toFile(output);
}

// A soft grey-green sky with a faint mosque skyline, so the layout can be checked without the photo.
async function standIn() {
  const ink = 'rgba(122,142,132,0.26)';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E4EAE5"/>
        <stop offset="0.55" stop-color="#E9EEE9"/>
        <stop offset="1" stop-color="#F2F2EC"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
    <g fill="${ink}">
      <path d="M270 1100 V820 Q270 650 480 650 Q690 650 690 820 V1100 Z" transform="translate(-60 0)"/>
      <rect x="395" y="590" width="10" height="70" transform="translate(-60 0)"/>
      <rect x="82" y="640" width="64" height="460"/>
      <path d="M82 640 L114 560 L146 640 Z"/>
      <rect x="640" y="640" width="64" height="460"/>
      <path d="M640 640 L672 560 L704 640 Z"/>
      <path d="M170 1100 V900 Q170 820 250 820 Q330 820 330 900 V1100 Z"/>
      <path d="M520 1100 V900 Q520 820 600 820 Q680 820 680 900 V1100 Z"/>
    </g>
    <circle cx="395" cy="560" r="26" fill="none" stroke="${ink}" stroke-width="5"/>
  </svg>`;
  return sharp(Buffer.from(svg)).blur(7).png().toFile(output);
}

const input = process.argv[2];
(input ? filtered(input) : standIn()).then(() => console.log(`Wrote ${output}`));
