/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');
let sharp;
let pngToIco;
try {
  // Optional: use sharp when available for high-quality resizing
  sharp = require('sharp');
} catch (err) {
  console.warn('[favicons] sharp not available, falling back to built-in PNG resizer');
}

try {
  pngToIco = require('png-to-ico');
} catch (err) {
  console.warn('[favicons] png-to-ico not available, falling back to built-in ICO writer');
}

const SRC = path.resolve(__dirname, '..', 'assets', 'favicon-48.png');
const OUT = path.resolve(__dirname, '..', 'assets');

async function ensureSrc() {
  try { await fs.access(SRC); }
  catch {
    throw new Error(`Source icon not found at ${SRC}. Put 48x48 PNG there as assets/favicon-48.png`);
  }
}

const generated = new Map();

async function ensureFallbackSource() {
  if (sharp) return null;
  if (ensureFallbackSource.cache) return ensureFallbackSource.cache;
  const { decodePng } = await importFallback();
  const buf = await fs.readFile(SRC);
  const decoded = decodePng(buf);
  ensureFallbackSource.cache = decoded;
  return decoded;
}

async function resizeWithFallback(size) {
  const { encodePng, resizeNearest } = await importFallback();
  const src = await ensureFallbackSource();
  const resized = resizeNearest(src, size, size);
  return encodePng(resized);
}

async function writePng(size, name) {
  let buf;
  if (sharp) {
    buf = await sharp(SRC).resize(size, size, { fit: 'cover' }).png().toBuffer();
  } else {
    buf = await resizeWithFallback(size);
  }
  const outPath = path.join(OUT, name);
  await fs.writeFile(outPath, buf);
  generated.set(size, buf);
  console.log(`✓ ${name}`);
  return buf;
}

async function writeIco() {
  const buffers = await Promise.all([
    generated.get(16) ? Promise.resolve(generated.get(16)) : (sharp ? sharp(SRC).resize(16, 16).png().toBuffer() : resizeWithFallback(16)),
    generated.get(32) ? Promise.resolve(generated.get(32)) : (sharp ? sharp(SRC).resize(32, 32).png().toBuffer() : resizeWithFallback(32)),
    generated.get(48) ? Promise.resolve(generated.get(48)) : (sharp ? sharp(SRC).resize(48, 48).png().toBuffer() : resizeWithFallback(48))
  ]);

  let ico;
  if (pngToIco) {
    ico = await pngToIco(buffers);
  } else {
    const { writeIcoBuffer } = await importFallback();
    ico = writeIcoBuffer(buffers, [16, 32, 48]);
  }

  const outPath = path.join(OUT, 'favicon.ico');
  await fs.writeFile(outPath, ico);
  console.log('✓ favicon.ico');
}

async function importFallback() {
  if (importFallback.cache) return importFallback.cache;
  importFallback.cache = await import('./gen-favicons.fallback.mjs');
  return importFallback.cache;
}

async function run() {
  await ensureSrc();
  await writePng(16,  'favicon-16.png');
  await writePng(32,  'favicon-32.png');
  await writePng(48,  'favicon-48.png'); // normalized/re-exported
  await writePng(180, 'apple-touch-icon.png');
  await writeIco();
  console.log('All favicons generated.');
}

run().catch(err => { console.error(err); process.exit(1); });
