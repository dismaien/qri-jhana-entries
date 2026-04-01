import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const entryId = process.argv[2] ?? "somatic-arc";
const width = Number(process.argv[3] ?? 960);
const height = Number(process.argv[4] ?? 540);
const fps = Number(process.argv[5] ?? 12);
const port = 4173;
const cwd = process.cwd();
const framesDir = path.join(cwd, "renders", `${entryId}-frames`);
const outputFile = path.join(cwd, "renders", `${entryId}-${width}x${height}-${fps}fps.mp4`);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function waitForServer(server) {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for Vite dev server.")), 20000);

    server.stdout.on("data", (chunk) => {
      const text = String(chunk);
      if (text.includes(`http://127.0.0.1:${port}`) || text.includes(`Local:`)) {
        clearTimeout(timeout);
        resolve(undefined);
      }
    });

    server.stderr.on("data", (chunk) => {
      const text = String(chunk);
      if (text.includes("EADDRINUSE")) {
        clearTimeout(timeout);
        resolve(undefined);
      }
    });

    server.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Vite dev server exited early with code ${code}.`));
    });
  });
}

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

const viteServer = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port)], {
  cwd,
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  await waitForServer(viteServer);

  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  await mkdir(path.dirname(outputFile), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: 1
    },
    args: ["--hide-scrollbars", "--mute-audio"]
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    await page.goto(`http://127.0.0.1:${port}/?entry=${entryId}&mode=render`, {
      waitUntil: "domcontentloaded"
    });
    await page.waitForFunction(() => Boolean(window.__JHANA__?.getMeta), {
      timeout: 60000
    });

    const meta = await page.evaluate(() => window.__JHANA__?.getMeta());
    if (!meta) {
      throw new Error("Render API was not available in the page.");
    }

    const totalFrames = Math.ceil(meta.duration * fps);

    for (let frame = 0; frame < totalFrames; frame += 1) {
      const seconds = frame / fps;
      await page.evaluate((time) => {
        window.__JHANA__?.renderAt(time);
      }, seconds);

      const fileName = `${String(frame).padStart(5, "0")}.png`;
      await page.screenshot({
        path: path.join(framesDir, fileName),
        type: "png"
      });
    }
  } finally {
    await browser.close();
  }

  await runFfmpeg([
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(framesDir, "%05d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    outputFile
  ]);
} finally {
  viteServer.kill("SIGTERM");
}

await rm(framesDir, { recursive: true, force: true });
console.log(`Rendered ${outputFile}`);
