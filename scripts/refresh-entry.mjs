import { spawn } from "node:child_process";
import process from "node:process";

const entryArg = process.argv[2] ?? "somatic-arc";
const width = String(Number(process.argv[3] ?? 960));
const height = String(Number(process.argv[4] ?? 540));
const fps = String(Number(process.argv[5] ?? 12));
const cwd = process.cwd();

const knownEntries = [
  "somatic-arc",
  "formless-mirror",
  "induction-lantern",
  "meditation-atlas",
  "tantric-recognition-atlas"
];
const entryIds = entryArg === "all" ? knownEntries : [entryArg];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`${command} exited with code ${code}.`));
    });
  });
}

for (const entryId of entryIds) {
  if (!knownEntries.includes(entryId)) {
    throw new Error(`Unknown refresh target: ${entryId}`);
  }

  await run("node", ["scripts/render-entry.mjs", entryId, width, height, fps]);
  await run("node", ["scripts/extract-stills.mjs", entryId, width, height, fps]);
  await run("node", ["scripts/make-contact-sheet.mjs", entryId]);
}
