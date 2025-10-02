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
const EMBEDDED_SRC_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEv2lUWHRYTUw6Y29tLmFkb2Jl' +
  'LnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4' +
  'bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1y' +
  'ZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5h' +
  'dHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNl' +
  'VHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA5LTI5PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0' +
  'cmliOkV4dElkPmJjZmZiZTc0LTgxNGMtNGQ1My1hNjI5LWJkYmI4NWIwODA1ZTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6' +
  'RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5' +
  'cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6' +
  'RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8' +
  'ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5GYXZpY29uIDQ4eDQ4IC0gMTwv' +
  'cmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24g' +
  'cmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj5EYXZp' +
  'ZCBFZHdhcmRzPC9wZGY6QXV0aG9yPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycK' +
  'ICB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRvclRvb2w+Q2FudmEgKFJlbmRl' +
  'cmVyKSBkb2M9REFHMFpCV0dvelkgdXNlcj1VQUV3YnNSOXRfUSBicmFuZD1BZG1pcmFsZW5lcmd5LmFpIHRlbXBsYXRlPTwveG1w' +
  'OkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3In' +
  'Pz69vefGAAAMa0lEQVR4nK2Ze3RV1Z3HP/uc+ww3Nwl5QEKIJEAShCKPojVQRCAKVpFCi7UdlwJrmKlarbOmXVWp1lbaLrtanbEz' +
  'g4/xUcc6skCotYpgQORlERQIAQKEBBIIeZLk5nnvOWf3j3PuM/deEvS3VnLv2Xuf33P/fr/v3lcE+nySWBKAJPjPGoglmWB8uGuu' +
  'kiwdldBDrNzQRCIFkikWz/DBfroqCrK02ClfJe9YKbphoBvSEhEK65ejmKDa4sr+EnIkEinhdN0FXtywFV03WLNiEaXjx4IQX/mG' +
  'EnFzYJgkLbf4enrZ9/kJ3tm2jw/2HqalswukJDMtlVtvvI5l5WXMnnkt6V4PZkyu0pyIbSQCfV1yOIlmGBJfbz8Dfj9tlzupOdfI' +
  '8doGvjh+lr9XnqK5s5uBgAbAtbkKGJLjl0wfOewqWWkeZk4qYtbkiZQU5jFxXB45mRm4nC5SU5woyhB1ESEDfDJxtRg8Xt/YzIzl' +
  'j+AP6OgCdEOi64a5WkSv/+Z4hRSn4MMqPTr5BAgJiqpgUwSKBIfdxt/ffobxY/OG6ksgmMQJlR9MhpT0ajq9ms5AQEczDKQAKUAg' +
  'GOkKc7t5ksrNpUqIXUbEnBQS3TAY0HT6dJOfTLSZY9VLmsSDVkV7VUTOWZ5EgLTiuGiySkDC1kqd/JEKqpCku6B8sopDgTc/08Oc' +
  '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' +
  'cG6WieH0gSPV9Pb5uW3eLFLcTipP1LLz0yN0dfoY8Gu89NbfaO7o4j8fX0NVdR0XG1v52Q/vouZcA26Xk2yvlwtN7fj9AUZnpFNd' +
  'd5H6iy2kuV3MmXktladqeXNzBeneFJxOB8tunYOm67zxl4/55EAlNuBUTT3PvrQRl9vJwtnTGZzMInEZDWg6umHgtNvQdIkuJYoQ' +
  'GFKCYaDabNhUgbAO5bpu4HSo6Bb0D2g6inVwN6REVVQ0zbxusdsUEAqBQAChqEjDwOV24g9oGJqOoqoYwSqFQFUV7HGOm+EIxDYx' +
  'AXabih3zpZM1dax97g1mT59EU0s7D923lGde3ohnxAiefvge3tm2h4OVp/j+0oX8+On1fGvuTDp9Pdw69+vs2H+Yc5fayEnzkJ09' +
  'kn9ftYz9h6t5r2I/RQWjOXbiLPffu5TnXtmMYlN48kf/xO9eeJs7y8som3Ftog0SUjT+rUTM89jcHFo7fdx5y2wUJJnpXsbkZrH5' +
  'w/38Ic3DsvJv0DcwwPRJRRytqeelXz1AV88A4/JzqDx9job2Lu6+Yx4LV65l9XcX8+Nfv8CLTz3I1NIiTp49z8i0VB5euZRv/2gd' +
  'ay61UlI4hhumlV5BeZOSVqGgNUKArkvefn8Xm7btYUSKC7fTwfqnHuT///YJf/7rLvM0Zd2VbvhgD69u3EpWRhoA9RdbePTZN3jl' +
  'N4/Q5euip89PcWE+ze0dVNXUU3vhEhOvyWP5wjIefHo9i+ddn7T2D9MAE2SpiuCu2+Zx77fLOVx1Bk03yB+dxQu/fIA3399N62Vf' +
  '6ObhrsVz+LdVy6k934gExuZmM27MKHYfPIYnJQUwOFR1hsx0L8+88g5dvj6EEMydNRkDyM3JHJLyAOoTaxN34iBV1zZw6Php/P4A' +
  'uw4cITcnkwNHTuF22ph3wzRys9JxOeyoqsqRE2cQAj47eooUt4vqsw10d/fy8wfuZsP7n5Cbnc5tc2ex5aO9NDW14+vuYVl5GWne' +
  'EWzatodOXw/XTy22foodgnuHAuZkbBGOvOAVIjwfxP5xsEtwnZQgFIE0DPyajsNmC/20GilHJD7hR91RfiU/dAcpiCvj48tkN2zJ' +
  'wHNyYD20TBkiJb9HS4burzAnoh8j6Ss14MpXgYmicgWSMd8j2PwDGDdH7q4PTCwAAAAASUVORK5CYII=';

async function loadSourceBuffer() {
  if (loadSourceBuffer.cache) return loadSourceBuffer.cache;
  try {
    const buf = await fs.readFile(SRC);
    loadSourceBuffer.cache = buf;
    return buf;
  } catch (err) {
    console.warn(`[favicons] Source icon missing at ${SRC}; using embedded fallback artwork.`);
    const buf = Buffer.from(EMBEDDED_SRC_BASE64, 'base64');
    loadSourceBuffer.cache = buf;
    return buf;
  }
}

const generated = new Map();

async function ensureFallbackSource() {
  if (sharp) return null;
  if (ensureFallbackSource.cache) return ensureFallbackSource.cache;
  const { decodePng } = await importFallback();
  const src = await loadSourceBuffer();
  const decoded = decodePng(src);
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
  const srcBuffer = await loadSourceBuffer();
  if (sharp) {
    buf = await sharp(srcBuffer).resize(size, size, { fit: 'cover' }).png().toBuffer();
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
  const srcBuffer = await loadSourceBuffer();
  const buffers = await Promise.all([
    generated.get(16) ? Promise.resolve(generated.get(16)) : (sharp ? sharp(srcBuffer).resize(16, 16).png().toBuffer() : resizeWithFallback(16)),
    generated.get(32) ? Promise.resolve(generated.get(32)) : (sharp ? sharp(srcBuffer).resize(32, 32).png().toBuffer() : resizeWithFallback(32)),
    generated.get(48) ? Promise.resolve(generated.get(48)) : (sharp ? sharp(srcBuffer).resize(48, 48).png().toBuffer() : resizeWithFallback(48))
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
  await loadSourceBuffer();
  await writePng(16,  'favicon-16.png');
  await writePng(32,  'favicon-32.png');
  await writePng(48,  'favicon-48.png'); // normalized/re-exported
  await writePng(180, 'apple-touch-icon.png');
  await writeIco();
  console.log('All favicons generated.');
}

run().catch(err => { console.error(err); process.exit(1); });
