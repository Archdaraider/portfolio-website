import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const root = decodeURIComponent(new URL("..", import.meta.url).pathname).replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
const publicDir = join(root, "public");

const imageTargets = [
  ["hero-warm-abstract.png", [252, 249, 248], [179, 90, 68]],
  ["about-warm-abstract.png", [226, 217, 200], [91, 92, 76]],
  ["luther-ai-bot-fallback.png", [240, 237, 237], [148, 66, 46]],
  ["claim-integrity-agent-fallback.png", [255, 220, 189], [91, 92, 76]],
  ["grounded-fallback.png", [228, 228, 207], [179, 90, 68]],
  ["imda-pdd-fallback.png", [220, 217, 217], [125, 86, 45]],
];

const modelTargets = [
  ["luther-ai-bot.glb", [0.7, 0.36, 0.27, 1]],
  ["claim-integrity-agent.glb", [0.36, 0.36, 0.3, 1]],
  ["grounded.glb", [0.58, 0.26, 0.18, 1]],
  ["imda-pdd.glb", [0.49, 0.34, 0.18, 1]],
];

mkdirSync(join(publicDir, "images"), { recursive: true });
mkdirSync(join(publicDir, "models"), { recursive: true });

for (const [file, a, b] of imageTargets) {
  writeFileSync(join(publicDir, "images", file), createPng(960, 720, a, b));
}

for (const [file, color] of modelTargets) {
  writeFileSync(join(publicDir, "models", file), createGlb(color));
}

writeFileSync(
  join(publicDir, "resume-placeholder.pdf"),
  `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 89 >>
stream
BT /F1 20 Tf 72 720 Td (Justin resume placeholder. Swap this PDF in Phase 2.) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000381 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
451
%%EOF
`,
);

function createPng(width, height, colorA, colorB) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const t = (x / width) * 0.62 + (y / height) * 0.38;
      const grain = (((x * 17 + y * 31) % 23) - 11) * 0.9;
      const wave = Math.sin((x + y) / 82) * 10;
      const i = row + 1 + x * 4;
      raw[i] = clamp(lerp(colorA[0], colorB[0], t) + grain + wave);
      raw[i + 1] = clamp(lerp(colorA[1], colorB[1], t) + grain);
      raw[i + 2] = clamp(lerp(colorA[2], colorB[2], t) + grain - wave * 0.35);
      raw[i + 3] = 255;
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", makeIhdr(width, height)),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function createGlb(color) {
  const positions = new Float32Array([
    -1, -1, -1,
    1, -1, -1,
    1, 1, -1,
    -1, 1, -1,
    -1, -1, 1,
    1, -1, 1,
    1, 1, 1,
    -1, 1, 1,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    1, 5, 6, 1, 6, 2,
    2, 6, 7, 2, 7, 3,
    3, 7, 4, 3, 4, 0,
  ]);
  const positionBytes = Buffer.from(positions.buffer);
  const indexOffset = align4(positionBytes.length);
  const indexBytes = Buffer.from(indices.buffer);
  const bin = Buffer.alloc(align4(indexOffset + indexBytes.length));
  positionBytes.copy(bin, 0);
  indexBytes.copy(bin, indexOffset);

  const json = {
    asset: { version: "2.0", generator: "Justin portfolio placeholder generator" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, rotation: [0.18, 0.34, 0.04, 0.92] }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: color,
          metallicFactor: 0,
          roughnessFactor: 0.92,
        },
      },
    ],
    buffers: [{ byteLength: bin.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBytes.length, target: 34962 },
      { buffer: 0, byteOffset: indexOffset, byteLength: indexBytes.length, target: 34963 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 8,
        type: "VEC3",
        min: [-1, -1, -1],
        max: [1, 1, 1],
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: indices.length,
        type: "SCALAR",
      },
    ],
  };

  const jsonBytes = padJson(Buffer.from(JSON.stringify(json), "utf8"));
  const totalLength = 12 + 8 + jsonBytes.length + 8 + bin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  return Buffer.concat([
    header,
    chunkHeader(jsonBytes.length, 0x4e4f534a),
    jsonBytes,
    chunkHeader(bin.length, 0x004e4942),
    bin,
  ]);
}

function makeIhdr(width, height) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;
  return buffer;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function chunkHeader(length, type) {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(length, 0);
  header.writeUInt32LE(type, 4);
  return header;
}

function padJson(buffer) {
  const next = align4(buffer.length);
  if (next === buffer.length) {
    return buffer;
  }
  return Buffer.concat([buffer, Buffer.alloc(next - buffer.length, 0x20)]);
}

function align4(value) {
  return (value + 3) & ~3;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return ~crc >>> 0;
}

console.log(`Generated placeholders in ${publicDir}`);
