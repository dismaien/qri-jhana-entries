import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();
const rendersRoot = path.join(cwd, "renders");
const stillsRoot = path.join(rendersRoot, "stills");
const boardsRoot = path.join(rendersRoot, "boards");
const packageRoot = path.join(cwd, "submission-package");
const targetArg = process.argv[2] ?? "all";

const targets = {
  "somatic-arc": {
    title: "Entry 01 Somatic Arc",
    planDoc: "docs/entry-01-somatic-arc.md",
    planName: "plan-entry-01-somatic-arc.md",
    draftDoc: "docs/submission-drafts/entry-01-somatic-arc.md",
    draftName: "submission-draft-entry-01-somatic-arc.md",
    stills: ["somatic-arc-j1.png", "somatic-arc-j2.png", "somatic-arc-j3.png", "somatic-arc-j4.png"],
    board: "somatic-arc-board.png"
  },
  "formless-mirror": {
    title: "Entry 02 Formless Mirror",
    planDoc: "docs/entry-02-formless-mirror.md",
    planName: "plan-entry-02-formless-mirror.md",
    draftDoc: "docs/submission-drafts/entry-02-formless-mirror.md",
    draftName: "submission-draft-entry-02-formless-mirror.md",
    stills: [
      "formless-mirror-j5.png",
      "formless-mirror-j6.png",
      "formless-mirror-j7.png",
      "formless-mirror-j8.png"
    ],
    board: "formless-mirror-board.png"
  },
  "induction-lantern": {
    title: "Entry 03 Induction Lantern",
    planDoc: "docs/entry-03-induction-lantern.md",
    planName: "plan-entry-03-induction-lantern.md",
    draftDoc: "docs/submission-drafts/entry-03-induction-lantern.md",
    draftName: "submission-draft-entry-03-induction-lantern.md",
    stills: ["induction-lantern-mid.png"],
    board: "induction-lantern-board.png"
  }
};

async function latestVideoFor(entryId) {
  const files = await readdir(rendersRoot);
  const latest = files.filter((file) => file.startsWith(`${entryId}-`) && file.endsWith(".mp4")).sort().at(-1);

  if (!latest) {
    throw new Error(`No rendered MP4 found for ${entryId}.`);
  }

  return latest;
}

const entryIds = targetArg === "all" ? Object.keys(targets) : [targetArg];

for (const entryId of entryIds) {
  const target = targets[entryId];

  if (!target) {
    throw new Error(`Unknown submission package target: ${entryId}`);
  }

  const entryDir = path.join(packageRoot, entryId);
  await rm(entryDir, { recursive: true, force: true });
  await mkdir(path.join(entryDir, "stills"), { recursive: true });
  await mkdir(path.join(entryDir, "docs"), { recursive: true });

  const videoFile = await latestVideoFor(entryId);
  const copies = [
    {
      from: path.join(rendersRoot, videoFile),
      to: path.join(entryDir, videoFile)
    },
    {
      from: path.join(boardsRoot, target.board),
      to: path.join(entryDir, target.board)
    },
    {
      from: path.join(cwd, target.planDoc),
      to: path.join(entryDir, "docs", target.planName)
    },
    {
      from: path.join(cwd, target.draftDoc),
      to: path.join(entryDir, "docs", target.draftName)
    }
  ];

  for (const stillFile of target.stills) {
    copies.push({
      from: path.join(stillsRoot, stillFile),
      to: path.join(entryDir, "stills", stillFile)
    });
  }

  for (const item of copies) {
    await copyFile(item.from, item.to);
  }

  await writeFile(
    path.join(entryDir, "manifest.json"),
    `${JSON.stringify(
      {
        id: entryId,
        title: target.title,
        packagedAt: new Date().toISOString(),
        video: videoFile,
        board: target.board,
        stills: target.stills,
        docs: [target.planName, target.draftName]
      },
      null,
      2
    )}\n`
  );

  console.log(`Packaged ${entryId} into ${entryDir}`);
}
