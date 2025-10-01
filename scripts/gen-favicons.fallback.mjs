import { inflateSync, deflateSync } from 'zlib';
import { Buffer } from 'buffer';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c >>>= 1;
      }
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export function decodePng(buffer) {
  if (!buffer.slice(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }
  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const idatParts = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset); offset += 4;
    const type = buffer.slice(offset, offset + 4).toString('ascii'); offset += 4;
    const data = buffer.slice(offset, offset + length); offset += length;
    offset += 4; // skip CRC

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idatParts.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error('Unsupported PNG format for fallback generator');
  }

  const compressed = Buffer.concat(idatParts);
  const raw = inflateSync(compressed);
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const output = Buffer.alloc(stride * height);
  let rawOffset = 0;
  let prevRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[rawOffset++];
    const row = Buffer.alloc(stride);
    switch (filter) {
      case 0: {
        raw.copy(row, 0, rawOffset, rawOffset + stride);
        break;
      }
      case 1: {
        for (let x = 0; x < stride; x++) {
          const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
          const val = (raw[rawOffset + x] + left) & 0xff;
          row[x] = val;
        }
        break;
      }
      case 2: {
        for (let x = 0; x < stride; x++) {
          const up = prevRow[x];
          const val = (raw[rawOffset + x] + up) & 0xff;
          row[x] = val;
        }
        break;
      }
      case 3: {
        for (let x = 0; x < stride; x++) {
          const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
          const up = prevRow[x];
          const val = (raw[rawOffset + x] + Math.floor((left + up) / 2)) & 0xff;
          row[x] = val;
        }
        break;
      }
      case 4: {
        for (let x = 0; x < stride; x++) {
          const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
          const up = prevRow[x];
          const upLeft = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;
          const val = (raw[rawOffset + x] + paeth(left, up, upLeft)) & 0xff;
          row[x] = val;
        }
        break;
      }
      default:
        throw new Error(`Unsupported PNG filter type ${filter}`);
    }
    row.copy(output, y * stride);
    prevRow = row;
    rawOffset += stride;
  }

  return { width, height, data: output };
}

function createChunk(type, data) {
  const chunk = Buffer.alloc(8 + data.length + 4);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 4, 'ascii');
  if (data.length) data.copy(chunk, 8);
  const crcInput = Buffer.concat([Buffer.from(type), data]);
  chunk.writeUInt32BE(crc32(crcInput), 8 + data.length);
  return chunk;
}

export function encodePng(image) {
  const { width, height, data } = image;
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // no filter
    data.copy(raw, rowStart + 1, y * stride, y * stride + stride);
  }
  const compressed = deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const chunks = [
    PNG_SIGNATURE,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ];
  return Buffer.concat(chunks);
}

export function resizeNearest(src, targetWidth, targetHeight) {
  const { width, height, data } = src;
  const result = Buffer.alloc(targetWidth * targetHeight * 4);
  for (let y = 0; y < targetHeight; y++) {
    const srcY = Math.min(height - 1, Math.floor((y * height) / targetHeight));
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.min(width - 1, Math.floor((x * width) / targetWidth));
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      result[dstIdx] = data[srcIdx];
      result[dstIdx + 1] = data[srcIdx + 1];
      result[dstIdx + 2] = data[srcIdx + 2];
      result[dstIdx + 3] = data[srcIdx + 3];
    }
  }
  return { width: targetWidth, height: targetHeight, data: result };
}

export function writeIcoBuffer(buffers, sizes) {
  const count = buffers.length;
  const header = Buffer.alloc(6 + count * 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type icon
  header.writeUInt16LE(count, 4);
  let offset = header.length;
  const parts = [header];

  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const png = buffers[i];
    const entryOffset = 6 + i * 16;
    header[entryOffset] = size === 256 ? 0 : size;
    header[entryOffset + 1] = size === 256 ? 0 : size;
    header[entryOffset + 2] = 0; // colors in palette
    header[entryOffset + 3] = 0; // reserved
    header.writeUInt16LE(1, entryOffset + 4); // planes
    header.writeUInt16LE(32, entryOffset + 6); // bit count
    header.writeUInt32LE(png.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    parts.push(png);
    offset += png.length;
  }

  return Buffer.concat(parts);
}
