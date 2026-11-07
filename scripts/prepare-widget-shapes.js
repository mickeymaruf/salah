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

function pillSvg(fill, stroke) {
  const { width, height, radius } = PILL;
  const border = stroke ? 1.5 : 0;
  const inset = border / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="${inset}" y="${inset}" width="${width - border}" height="${height - border}" rx="${radius - inset}" fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width="${border}"` : ''}/>
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

async function round(source, name) {
  const size = 24 * SCALE;
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.47}" fill="#fff"/></svg>`);
  await sharp(source).resize(size, size).composite([{ input: mask, blend: 'dest-in' }]).png({ compressionLevel: 9 }).toFile(path.join(outDir, `widget-${name}.png`));
}

async function main() {
  for (const theme of Object.keys(THEMES)) {
    const t = THEMES[theme];
    await cut(stackSvg(theme), STACK.width, STACK.height, 48, 'stack', theme);
    await cut(pillSvg(t.surface, t.line), PILL.width, PILL.height, PILL.radius, 'missed', theme);
    await cut(pillSvg(t.prayedFill), PILL.width, PILL.height, PILL.radius, 'prayed', theme);
    await cut(pillSvg(t.base), PILL.width, PILL.height, PILL.radius, 'bar', theme);
  }
  await round(path.join(outDir, 'button-prayed@3x.png'), 'tick');
  await round(path.join(outDir, 'button-missed@3x.png'), 'cross');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
