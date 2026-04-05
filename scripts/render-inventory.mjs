import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const rendersRoot = path.join(cwd, "renders");
const stillsRoot = path.join(rendersRoot, "stills");
const boardsRoot = path.join(rendersRoot, "boards");
const asJson = process.argv.includes("--json");

const targets = [
  {
    id: "somatic-arc",
    stills: ["somatic-arc-j1.png", "somatic-arc-j2.png", "somatic-arc-j3.png", "somatic-arc-j4.png"],
    board: "somatic-arc-board.png"
  },
  {
    id: "formless-mirror",
    stills: [
      "formless-mirror-j5.png",
      "formless-mirror-j6.png",
      "formless-mirror-j7.png",
      "formless-mirror-j8.png"
    ],
    board: "formless-mirror-board.png"
  },
  {
    id: "induction-lantern",
    stills: ["induction-lantern-mid.png"],
    board: "induction-lantern-board.png"
  },
  {
    id: "meditation-atlas",
    stills: [
      "meditation-atlas-breath.png",
      "meditation-atlas-scan.png",
      "meditation-atlas-metta.png",
      "meditation-atlas-open-sky.png"
    ],
    board: "meditation-atlas-board.png"
  }
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function latestVideoFor(entryId) {
  const files = await readdir(rendersRoot);
  const candidates = files.filter((file) => file.startsWith(`${entryId}-`) && file.endsWith(".mp4")).sort();
  const latest = candidates.at(-1);

  if (!latest) {
    return null;
  }

  const filePath = path.join(rendersRoot, latest);
  const info = await stat(filePath);
  return {
    file: latest,
    bytes: info.size,
    modifiedAt: info.mtime.toISOString()
  };
}

const report = [];

for (const target of targets) {
  const stills = [];

  for (const stillName of target.stills) {
    const filePath = path.join(stillsRoot, stillName);
    stills.push({
      file: stillName,
      present: await exists(filePath)
    });
  }

  const boardPath = path.join(boardsRoot, target.board);

  report.push({
    id: target.id,
    video: await latestVideoFor(target.id),
    board: {
      file: target.board,
      present: await exists(boardPath)
    },
    stills
  });
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

for (const entry of report) {
  const videoLabel = entry.video
    ? `${entry.video.file} (${Math.round(entry.video.bytes / 1024)} KB, ${entry.video.modifiedAt})`
    : "missing";
  const boardLabel = entry.board.present ? entry.board.file : "missing";
  const stillLabel = `${entry.stills.filter((item) => item.present).length}/${entry.stills.length}`;

  console.log(`${entry.id}`);
  console.log(`  video: ${videoLabel}`);
  console.log(`  board: ${boardLabel}`);
  console.log(`  stills: ${stillLabel}`);
}
