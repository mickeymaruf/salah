// Draws the app icons from the logo geometry in src/shared/ui/logo.json.
// Run: node scripts/generate-icons.js
const path = require('path');
const sharp = require('sharp');
const logo = require('../src/shared/ui/logo.json');

// Same values as src/shared/theme/colors.ts.
const GREEN = '#1F4D3F';
const GREEN_DARK = '#10241E';
const ON_DARK = '#F3F1EA';

const assets = path.join(__dirname, '..', 'assets');

function mark(height, arch, moon) {
  const scale = height / logo.height;
  return `<g transform="scale(${scale})"><path d="${logo.arch}" fill="${arch}"/><path d="${logo.moon}" fill="${moon}"/></g>`;
}

// A single shape with the moon cut out, for the Android monochrome icon and the notification icon.
function cutout(height, fill) {
  const scale = height / logo.height;
  return `<g transform="scale(${scale})"><path d="${logo.arch} ${logo.moon}" fill="${fill}" fill-rule="evenodd"/></g>`;
}

function canvas(size, content, background) {
  const rect = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rect}${content}</svg>`;
}

function centered(size, height, content) {
  const width = (height * logo.width) / logo.height;
  return `<g transform="translate(${(size - width) / 2} ${(size - height) / 2})">${content}</g>`;
}

async function write(name, size, svg) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(assets, name));
}

async function main() {
  const S = 1024;
  const markHeight = 435;

  await write('icon.png', S, canvas(S, centered(S, markHeight, mark(markHeight, ON_DARK, GREEN)), GREEN));
  await write('android-icon-foreground.png', S, canvas(S, centered(S, markHeight, mark(markHeight, ON_DARK, GREEN))));
  await write('android-icon-monochrome.png', S, canvas(S, centered(S, markHeight, cutout(markHeight, '#FFFFFF'))));
  await write('notification-icon.png', 96, canvas(96, centered(96, 64, cutout(64, '#FFFFFF'))));
  await write('favicon.png', 48, canvas(48, centered(48, 30, mark(30, ON_DARK, GREEN)), GREEN));

  // Splash: the two rings and the mark, sized so the image is exactly the 160 dp lockup box.
  const ring = (r, opacity) =>
    `<circle cx="${S / 2}" cy="${S / 2}" r="${r}" fill="none" stroke="${ON_DARK}" stroke-opacity="${opacity}" stroke-width="6"/>`;
  const splash = ring(S / 2 - 4, 0.14) + ring(S / 2 - 144, 0.3) + centered(S, 512, mark(512, ON_DARK, GREEN_DARK));
  await write('splash-icon.png', S, canvas(S, splash));
}

main();
