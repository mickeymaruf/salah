// Generates the alarm tones as 16-bit mono WAV files. Run: node scripts/generate-sounds.js
// Each file is 4 seconds and ends in silence, so it loops without a click.
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const SECONDS = 4;

function render(notes) {
  const samples = new Float32Array(RATE * SECONDS);
  for (const { start, freq, length, gain, partials } of notes) {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    for (let i = 0; i < count && from + i < samples.length; i++) {
      const t = i / RATE;
      const envelope = Math.min(1, t / 0.01) * Math.exp((-4 * t) / length);
      let value = 0;
      for (const [ratio, weight] of partials) value += weight * Math.sin(2 * Math.PI * freq * ratio * t);
      samples[from + i] += gain * envelope * value;
    }
  }
  return samples;
}

function toWav(samples) {
  const peak = samples.reduce((max, v) => Math.max(max, Math.abs(v)), 0.0001);
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round((v / peak) * 0.8 * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const soft = [[1, 1], [2, 0.25]];
const bell = [[1, 1], [2.76, 0.5], [5.4, 0.25]];

const tones = {
  // Rising three-note arpeggio, twice.
  chime: [0, 2].flatMap((round) =>
    [523.25, 659.25, 783.99].map((freq, i) => ({ start: round + i * 0.35, freq, length: 1.1, gain: 0.6, partials: soft })),
  ),
  // Single struck bell, repeated.
  bell: [0, 2].map((start) => ({ start, freq: 440, length: 1.8, gain: 0.7, partials: bell })),
  // Two slow low notes.
  soft: [0, 2].map((start, i) => ({ start, freq: i === 0 ? 392 : 523.25, length: 1.9, gain: 0.7, partials: soft })),
};

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, notes] of Object.entries(tones)) {
  fs.writeFileSync(path.join(outDir, `${name}.wav`), toWav(render(notes)));
}
