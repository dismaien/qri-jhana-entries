import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const packageRoot = path.join(cwd, "submission-package");
const minDraftWords = 200;
const maxDraftWords = 1000;

const targets = {
  "somatic-arc": {
    title: "Entry 01 Somatic Arc",
    videoPrefix: "somatic-arc-",
    board: "somatic-arc-board.png",
    stills: ["somatic-arc-j1.png", "somatic-arc-j2.png", "somatic-arc-j3.png", "somatic-arc-j4.png"],
    docs: ["plan-entry-01-somatic-arc.md", "submission-draft-entry-01-somatic-arc.md"],
    draft: "submission-draft-entry-01-somatic-arc.md"
  },
  "formless-mirror": {
    title: "Entry 02 Formless Mirror",
    videoPrefix: "formless-mirror-",
    board: "formless-mirror-board.png",
    stills: [
      "formless-mirror-j5.png",
      "formless-mirror-j6.png",
      "formless-mirror-j7.png",
      "formless-mirror-j8.png"
    ],
    docs: ["plan-entry-02-formless-mirror.md", "submission-draft-entry-02-formless-mirror.md"],
    draft: "submission-draft-entry-02-formless-mirror.md"
  },
  "induction-lantern": {
    title: "Entry 03 Induction Lantern",
    videoPrefix: "induction-lantern-",
    board: "induction-lantern-board.png",
    stills: ["induction-lantern-mid.png"],
    docs: ["plan-entry-03-induction-lantern.md", "submission-draft-entry-03-induction-lantern.md"],
    draft: "submission-draft-entry-03-induction-lantern.md"
  }
};

const targetArg = process.argv[2] ?? "all";
const entryIds = targetArg === "all" ? Object.keys(targets) : [targetArg];
const issues = [];
const warnings = [];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function addIssue(entryId, message) {
  issues.push(`${entryId}: ${message}`);
}

function addWarning(entryId, message) {
  warnings.push(`${entryId}: ${message}`);
}

function countWords(markdown) {
  return markdown
    .replace(/`[^`]*`/g, " ")
    .replace(/[#>*_\-[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

async function validateFile(entryId, filePath, label, minBytes = 1) {
  if (!(await exists(filePath))) {
    addIssue(entryId, `missing ${label}: ${path.relative(cwd, filePath)}`);
    return null;
  }

  const info = await stat(filePath);
  if (info.size < minBytes) {
    addIssue(entryId, `${label} is unexpectedly small: ${path.relative(cwd, filePath)} (${info.size} bytes)`);
  }

  return info;
}

async function validateEntry(entryId) {
  const target = targets[entryId];

  if (!target) {
    addIssue(entryId, "unknown package target");
    return;
  }

  const entryDir = path.join(packageRoot, entryId);
  const manifestPath = path.join(entryDir, "manifest.json");
  await validateFile(entryId, manifestPath, "manifest", 20);

  let manifest = null;
  if (await exists(manifestPath)) {
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
      addIssue(entryId, `manifest is not valid JSON: ${error.message}`);
    }
  }

  if (manifest) {
    if (manifest.id !== entryId) {
      addIssue(entryId, `manifest id mismatch: expected ${entryId}, got ${manifest.id}`);
    }
    if (manifest.title !== target.title) {
      addIssue(entryId, `manifest title mismatch: expected ${target.title}, got ${manifest.title}`);
    }
    if (!manifest.video?.startsWith(target.videoPrefix) || !manifest.video.endsWith(".mp4")) {
      addIssue(entryId, `manifest video does not look like the expected MP4: ${manifest.video}`);
    }
    if (manifest.board !== target.board) {
      addIssue(entryId, `manifest board mismatch: expected ${target.board}, got ${manifest.board}`);
    }
    if (JSON.stringify(manifest.stills) !== JSON.stringify(target.stills)) {
      addIssue(entryId, "manifest still list does not match expected package contents");
    }
    if (JSON.stringify(manifest.docs) !== JSON.stringify(target.docs)) {
      addIssue(entryId, "manifest docs list does not match expected package contents");
    }
  }

  const files = (await exists(entryDir)) ? await readdir(entryDir) : [];
  const videos = files.filter((file) => file.startsWith(target.videoPrefix) && file.endsWith(".mp4"));
  if (videos.length !== 1) {
    addIssue(entryId, `expected exactly one MP4, found ${videos.length}`);
  }

  const videoName = manifest?.video ?? videos[0];
  if (videoName) {
    await validateFile(entryId, path.join(entryDir, videoName), "video", 50_000);
  }

  await validateFile(entryId, path.join(entryDir, target.board), "board", 10_000);

  for (const stillName of target.stills) {
    await validateFile(entryId, path.join(entryDir, "stills", stillName), `still ${stillName}`, 10_000);
  }

  for (const docName of target.docs) {
    await validateFile(entryId, path.join(entryDir, "docs", docName), `doc ${docName}`, 100);
  }

  const draftPath = path.join(entryDir, "docs", target.draft);
  if (await exists(draftPath)) {
    const draft = await readFile(draftPath, "utf8");
    const words = countWords(draft);

    if (words < minDraftWords || words > maxDraftWords) {
      addIssue(entryId, `draft word count ${words} is outside ${minDraftWords}-${maxDraftWords}`);
    }

    if (/Method note to personalize|Before submission/i.test(draft)) {
      addWarning(entryId, "draft still contains an explicit method-personalization placeholder");
    }
  }
}

for (const entryId of entryIds) {
  await validateEntry(entryId);
}

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`error: ${issue}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${entryIds.length} package${entryIds.length === 1 ? "" : "s"} with ${warnings.length} warning${
    warnings.length === 1 ? "" : "s"
  }.`
);
