import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const stillConfig = {
  "somatic-arc": [
    { time: 3, file: "somatic-arc-j1.png" },
    { time: 9, file: "somatic-arc-j2.png" },
    { time: 15, file: "somatic-arc-j3.png" },
    { time: 21, file: "somatic-arc-j4.png" }
  ],
  "formless-mirror": [
    { time: 3, file: "formless-mirror-j5.png" },
    { time: 9, file: "formless-mirror-j6.png" },
    { time: 15, file: "formless-mirror-j7.png" },
    { time: 21, file: "formless-mirror-j8.png" }
  ],
  "induction-lantern": [{ time: 9, file: "induction-lantern-mid.png" }],
  "meditation-atlas": [
    { time: 3, file: "meditation-atlas-breath.png" },
    { time: 9, file: "meditation-atlas-scan.png" },
    { time: 15, file: "meditation-atlas-metta.png" },
    { time: 21, file: "meditation-atlas-open-sky.png" }
  ],
  "tantric-recognition-atlas": [
    { time: 3, file: "tantric-recognition-atlas-breath-pause.png" },
    { time: 9, file: "tantric-recognition-atlas-heart-lotus.png" },
    { time: 15, file: "tantric-recognition-atlas-body-space.png" },
    { time: 21, file: "tantric-recognition-atlas-recognition-field.png" }
  ]
};

const entryArg = process.argv[2] ?? "somatic-arc";
const width = Number(process.argv[3] ?? 960);
const height = Number(process.argv[4] ?? 540);
const fps = Number(process.argv[5] ?? 12);
const cwd = process.cwd();
const stillsRoot = path.join(cwd, "renders", "stills");

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, {
      cwd,
      stdio: "inherit"
    });

    ffmpeg.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code}.`));
    });
  });
}

const entryIds = entryArg === "all" ? Object.keys(stillConfig) : [entryArg];

for (const entryId of entryIds) {
  const config = stillConfig[entryId];

  if (!config) {
    throw new Error(`Unknown still target: ${entryId}`);
  }

  const videoPath = path.join(cwd, "renders", `${entryId}-${width}x${height}-${fps}fps.mp4`);
  await mkdir(stillsRoot, { recursive: true });

  for (const target of config) {
    const outputPath = path.join(stillsRoot, target.file);

    await runFfmpeg([
      "-y",
      "-ss",
      String(target.time),
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-update",
      "1",
      outputPath
    ]);

    console.log(`Created ${outputPath}`);
  }
}
