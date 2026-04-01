import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const cwd = process.cwd();
const inputRoot = path.join(cwd, "renders", "stills");
const outputRoot = path.join(cwd, "renders", "boards");

const sheetConfig = {
  "somatic-arc": {
    title: "Entry 1: Somatic Arc",
    subtitle: "J1-J4 progression board",
    files: [
      "somatic-arc-j1.png",
      "somatic-arc-j2.png",
      "somatic-arc-j3.png",
      "somatic-arc-j4.png"
    ],
    labels: ["Jhana 1", "Jhana 2", "Jhana 3", "Jhana 4"],
    columns: 2
  },
  "formless-mirror": {
    title: "Entry 2: Formless Mirror",
    subtitle: "J5-J8 progression board",
    files: [
      "formless-mirror-j5.png",
      "formless-mirror-j6.png",
      "formless-mirror-j7.png",
      "formless-mirror-j8.png"
    ],
    labels: ["Jhana 5", "Jhana 6", "Jhana 7", "Jhana 8"],
    columns: 2
  },
  "induction-lantern": {
    title: "Entry 3: Induction Lantern",
    subtitle: "Induction-aid board",
    files: ["induction-lantern-mid.png"],
    labels: ["Midpoint"],
    columns: 1
  }
};

const entryId = process.argv[2] ?? "somatic-arc";
const config = sheetConfig[entryId];

if (!config) {
  throw new Error(`Unknown board target: ${entryId}`);
}

const headerHeight = 150;
const tileWidth = 960;
const tileHeight = 540;
const gutter = 24;
const captionHeight = 54;
const columns = config.columns;
const rows = Math.ceil(config.files.length / columns);
const boardWidth = columns * tileWidth + (columns + 1) * gutter;
const boardHeight = headerHeight + rows * (tileHeight + captionHeight) + (rows + 1) * gutter;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function svgLabel(width, height, title, subtitle) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#130f12"/>
          <stop offset="100%" stop-color="#0a1014"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="24" fill="url(#bg)" />
      <text x="48" y="58" fill="#f3d49a" font-size="20" font-family="Avenir Next, Arial, sans-serif" letter-spacing="3">QRI JHANA ENERGY LAB</text>
      <text x="48" y="102" fill="#f5efe5" font-size="40" font-family="Iowan Old Style, Georgia, serif">${escapeHtml(title)}</text>
      <text x="48" y="132" fill="#c7c0b5" font-size="18" font-family="Avenir Next, Arial, sans-serif">${escapeHtml(subtitle)}</text>
    </svg>
  `);
}

function svgCaption(width, height, text) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0f1318" />
      <text x="24" y="36" fill="#ead9ba" font-size="24" font-family="Avenir Next, Arial, sans-serif">${escapeHtml(text)}</text>
    </svg>
  `);
}

await mkdir(outputRoot, { recursive: true });

const base = sharp({
  create: {
    width: boardWidth,
    height: boardHeight,
    channels: 4,
    background: "#07090d"
  }
});

const composites = [
  {
    input: svgLabel(boardWidth - gutter * 2, headerHeight - gutter, config.title, config.subtitle),
    left: gutter,
    top: gutter
  }
];

for (const [index, file] of config.files.entries()) {
  const col = index % columns;
  const row = Math.floor(index / columns);
  const left = gutter + col * (tileWidth + gutter);
  const top = headerHeight + gutter + row * (tileHeight + captionHeight);
  const imagePath = path.join(inputRoot, file);

  composites.push({ input: imagePath, left, top });
  composites.push({
    input: svgCaption(tileWidth, captionHeight, config.labels[index] ?? file),
    left,
    top: top + tileHeight
  });
}

const outputPath = path.join(outputRoot, `${entryId}-board.png`);

await base.composite(composites).png().toFile(outputPath);

console.log(`Created ${outputPath}`);
