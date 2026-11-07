// Draws the shapes of the home screen widget as small PNGs: assets/images/widget-shape-<shape>-<part>-<theme>.png, plus the round tick and cross.
//
//   node scripts/prepare-widget-shapes.js
//
// Why pictures: widget corner radius only works on Android 12 and newer, and the widget has no border or shadow. Older phones drew square cards. Each rounded shape is cut
// into a left end, a one pixel wide middle and a right end. The widget stretches only the middle, so the corners are never distorted at any widget width.
// The colours repeat src/shared/theme/colors.ts (this script cannot import TypeScript): bg.surface, bg.base, ink.primary, line.soft, brand.onDark, brand.greenDark and
// the camera.* dark surfaces.
const path = require('path');
const sharp = require('sharp');

const SCALE = 3;
const outDir = path.join(__dirname, '..', 'assets', 'images');

const THEMES = {
  light: { surface: '#FFFFFF', base: '#F7F5F0', line: '#E8E4DB', prayedFill: '#1C1B19' },
  dark: { surface: '#1A211C', base: '#121714', line: '#29332E', prayedFill: '#F3F1EA' },
};

const STACK = { width: 342, height: 152, front: 124, radius: 28 };
const PILL = { width: 148, height: 44, radius: 22 };

// Figma 18077:13 to 18077:15: the cards behind are the surface at 60% and 85% with a soft shadow, the front card has a larger one.
function stackSvg(theme) {
  const { surface } = THEMES[theme];
  const w = STACK.width;
  const card = (x, y, width, height, opacity, shadowOffset, blur, shadowAlpha) => `
    <g opacity="${opacity}">
      <rect x="${x}" y="${y + shadowOffset}" width="${width}" height="${height}" rx="${STACK.radius}" fill="#000" fill-opacity="${shadowAlpha}" filter="url(#blur${blur})"/>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${STACK.radius}" fill="${surface}"/>
    </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${STACK.height}" viewBox="0 0 ${w} ${STACK.height}">
    <defs>
      <filter id="blur16" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="blur20" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    ${card(20, 38, 302, 114, 0.6, 6, 16, 0.08)}
    ${card(10, 24, 322, 114, 0.85, 6, 16, 0.08)}
    ${card(0, 0, w, STACK.front, 1, 6, 20, 0.14)}
  </svg>`;
}

function pillSvg(fill) {
  const { width, height, radius } = PILL;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>
  </svg>`;
}

// The Missed and Prayed buttons share one row so they are always the same width. Figma 18077:24 and 18077:27: Missed is the surface colour with a 1.5 px line, Prayed is
// solid. Corners outside the pill are drawn in the surface colour (the front card is flat), which hides the square tap highlight Android draws over a button.
const LINE = 1.5;
function missedRect(x, width, theme) {
  const t = THEMES[theme];
  const inset = LINE / 2;
  return `<rect x="${x + inset}" y="${inset}" width="${width - inset}" height="${PILL.height - LINE}" rx="${PILL.radius - inset}" fill="${t.surface}" stroke="${t.line}" stroke-width="${LINE}"/>`;
}
function prayedRect(x, width, theme) {
  return `<rect x="${x}" y="0" width="${width}" height="${PILL.height}" rx="${PILL.radius}" fill="${THEMES[theme].prayedFill}"/>`;
}
function answersSvg(theme, width, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${PILL.height}" viewBox="0 0 ${width} ${PILL.height}">
    <rect width="${width}" height="${PILL.height}" fill="${THEMES[theme].surface}"/>${body}
  </svg>`;
}

async function cut(svg, width, height, cap, name, theme) {
  const full = await sharp(Buffer.from(svg), { density: 72 * SCALE }).resize(width * SCALE, height * SCALE).png().toBuffer();
  const h = height * SCALE;
  const capPx = cap * SCALE;
  const parts = {
    left: { left: 0, width: capPx },
    mid: { left: Math.round((width * SCALE) / 2), width: 1 },
    right: { left: width * SCALE - capPx, width: capPx },
  };
  for (const [part, box] of Object.entries(parts)) {
    const file = path.join(outDir, `widget-shape-${name}-${part}-${theme}.png`);
    await sharp(full).extract({ left: box.left, top: 0, width: box.width, height: h }).png({ compressionLevel: 9 }).toFile(file);
  }
}

async function draw(svg, width, name, theme) {
  const file = path.join(outDir, `widget-shape-${name}-${theme}.png`);
  await sharp(Buffer.from(svg), { density: 72 * SCALE }).resize(width * SCALE, PILL.height * SCALE).png({ compressionLevel: 9 }).toFile(file);
}

async function round(source, name) {
  const size = 24 * SCALE;
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.47}" fill="#fff"/></svg>`);
  await sharp(source).resize(size, size).composite([{ input: mask, blend: 'dest-in' }]).png({ compressionLevel: 9 }).toFile(path.join(outDir, `widget-${name}.png`));
}

async function main() {
  for (const theme of Object.keys(THEMES)) {
    const t = THEMES[theme];
    await cut(stackSvg(theme), STACK.width, STACK.height, 48, 'stack', theme);
    await cut(pillSvg(t.base), PILL.width, PILL.height, PILL.radius, 'bar', theme);
    // Left end of Missed, right end of Prayed, a stretched middle that is Missed on the left half and Prayed on the right half, and the 134 dp centre where the two meet.
    const cap = PILL.radius;
    await draw(answersSvg(theme, cap, missedRect(0, 200, theme)), cap, 'answers-left', theme);
    await draw(answersSvg(theme, cap, prayedRect(-200, 200 + cap, theme)), cap, 'answers-right', theme);
    const half = 20;
    const strip = `<rect x="0" y="0" width="${half}" height="${PILL.height}" fill="${t.surface}"/>
      <rect x="0" y="0" width="${half}" height="${LINE}" fill="${t.line}"/><rect x="0" y="${PILL.height - LINE}" width="${half}" height="${LINE}" fill="${t.line}"/>
      <rect x="${half}" y="0" width="${half}" height="${PILL.height}" fill="${t.prayedFill}"/>`;
    await draw(answersSvg(theme, half * 2, strip), half * 2, 'answers-mid', theme);
    const centre = 134;
    const gap = 10;
    const missedEnd = (centre - gap) / 2;
    await draw(answersSvg(theme, centre, missedRect(-200, 200 + missedEnd, theme) + prayedRect(missedEnd + gap, 200, theme)), centre, 'answers-center', theme);
  }
  await round(path.join(outDir, 'button-prayed@3x.png'), 'tick');
  await round(path.join(outDir, 'button-missed@3x.png'), 'cross');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
