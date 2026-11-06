// Makes assets/sounds/pop.wav: the soft "pop" played when a prayer is marked as prayed (about 170 ms, mono, 16 bit).
//
//   node scripts/make-pop.js
//
// A short sine that glides down from 620 Hz to 330 Hz with a quick fade in and an exponential fade out.
const fs = require('fs');
const path = require('path');

const RATE = 44100;
const SECONDS = 0.17;
const samples = Math.round(RATE * SECONDS);
const data = Buffer.alloc(samples * 2);

let phase = 0;
for (let i = 0; i < samples; i++) {
  const t = i / RATE;
  const u = i / samples;
  const frequency = 330 + 290 * Math.exp(-u * 7);
  phase += (2 * Math.PI * frequency) / RATE;
  const attack = Math.min(1, t / 0.006);
  const decay = Math.exp(-u * 5.5);
  const value = Math.sin(phase) * attack * decay * 0.55;
  data.writeInt16LE(Math.round(value * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

const output = path.join(__dirname, '..', 'assets', 'sounds', 'pop.wav');
fs.writeFileSync(output, Buffer.concat([header, data]));
console.log(`Wrote ${output} (${header.length + data.length} bytes)`);
