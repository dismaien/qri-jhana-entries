import "./styles.css";

import GUI from "lil-gui";
import { entries, getSegmentLabel, resolveEntry } from "./entries";
import {
  clampLabState,
  hasLabQuery,
  isLabPresetId,
  labPresets,
  listLabPresets,
  readLabState,
  resetLabState,
  writeLabParams
} from "./lab";
import { secondsToClock } from "./math";
import type { Entry, LabState } from "./types";

function requireElement<T>(selector: string): T {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element as T;
}

const params = new URLSearchParams(window.location.search);
const renderMode = params.get("mode") === "render";
const chromeHidden = renderMode || params.get("hideUi") === "1" || params.get("chrome") === "0";
const labMode = !renderMode && hasLabQuery(params);
const initialTime = Number(params.get("t") ?? "0");
const initialPlaying = params.get("play") !== "0" && !renderMode;

if (renderMode) {
  document.body.classList.add("render-mode");
}

if (chromeHidden) {
  document.body.classList.add("chrome-hidden");
}

if (labMode) {
  document.body.classList.add("lab-mode");
}

const canvas = requireElement<HTMLCanvasElement>("#stage");
const summaryNode = requireElement<HTMLElement>("#entry-summary");
const tagsNode = requireElement<HTMLElement>("#entry-tags");
const segmentList = requireElement<HTMLOListElement>("#segment-list");
const currentSegmentNode = requireElement<HTMLElement>("#current-segment");
const currentTimeNode = requireElement<HTMLElement>("#current-time");
const entrySelect = requireElement<HTMLSelectElement>("#entry-select");
const scrubber = requireElement<HTMLInputElement>("#time-scrubber");
const playToggle = requireElement<HTMLButtonElement>("#play-toggle");
const labHintNode = requireElement<HTMLElement>("#lab-hint");

const rawContext = canvas.getContext("2d");
if (!rawContext) {
  throw new Error("2D canvas is not available.");
}
const context = rawContext;

entrySelect.innerHTML = entries
  .map((entry) => `<option value="${entry.id}">${entry.title}</option>`)
  .join("");

let currentEntry: Entry = resolveEntry(params.get("entry"));
let currentTime = Number.isFinite(initialTime) ? initialTime : 0;
let playing = initialPlaying;
let lastFrameAt = performance.now();
const labState: LabState = readLabState(params);

function writeUrlState(): void {
  if (renderMode) {
    return;
  }

  const nextParams = new URLSearchParams(window.location.search);
  nextParams.set("entry", currentEntry.id);
  nextParams.set("t", currentTime.toFixed(1));
  nextParams.set("play", playing ? "1" : "0");
  writeLabParams(nextParams, labState, labMode);
  history.replaceState({}, "", `${window.location.pathname}?${nextParams.toString()}`);
}

function refreshLabHint(message?: string): void {
  if (message) {
    labHintNode.textContent = message;
    return;
  }

  if (labMode) {
    labHintNode.textContent =
      "Creative Lab is active. The floating tweak panel remixes the current scene and the URL tracks the preset.";
    return;
  }

  labHintNode.textContent =
    "Add ?lab=1 to the URL to open Creative Lab controls and save remix URLs for any entry.";
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, select, textarea, button"));
}

function resizeCanvas(): void {
  const width = renderMode ? window.innerWidth : canvas.clientWidth;
  const height = renderMode ? window.innerHeight : canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
}

function refreshUi(): void {
  entrySelect.value = currentEntry.id;
  summaryNode.textContent = currentEntry.summary;
  tagsNode.textContent = currentEntry.tags;
  scrubber.value = ((currentTime / currentEntry.duration) * 1000).toFixed(0);
  playToggle.textContent = playing ? "Pause" : "Play";

  const segment = getSegmentLabel(currentEntry, currentTime);
  currentSegmentNode.textContent = segment.label;
  currentTimeNode.textContent = `${secondsToClock(currentTime)} / ${secondsToClock(currentEntry.duration)}`;

  segmentList.innerHTML = currentEntry.segments
    .map(
      (item) =>
        `<li><strong>${item.label}</strong> (${secondsToClock(item.start)}-${secondsToClock(item.end)})<br>${item.note}</li>`
    )
    .join("");
}

function renderFrame(time: number): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = renderMode ? window.innerWidth : canvas.clientWidth;
  const height = renderMode ? window.innerHeight : canvas.clientHeight;

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  currentEntry.render(context, {
    t: time,
    width,
    height,
    dpr,
    lab: labState
  });

  context.setTransform(1, 0, 0, 1, 0, 0);
}

function setEntry(id: string): void {
  currentEntry = resolveEntry(id);
  currentTime = Math.min(currentTime, currentEntry.duration);
  refreshUi();
  renderFrame(currentTime);
  writeUrlState();
}

function drawAt(time: number): void {
  currentTime = ((time % currentEntry.duration) + currentEntry.duration) % currentEntry.duration;
  refreshUi();
  renderFrame(currentTime);
}

function togglePlayback(): void {
  playing = !playing;
  refreshUi();
  writeUrlState();
}

function nudgeTime(delta: number): void {
  drawAt(currentTime + delta);
}

function stepEntry(direction: 1 | -1): void {
  const currentIndex = entries.findIndex((entry) => entry.id === currentEntry.id);
  const nextIndex = (currentIndex + direction + entries.length) % entries.length;
  setEntry(entries[nextIndex]?.id ?? currentEntry.id);
}

function tick(now: number): void {
  if (playing) {
    const delta = (now - lastFrameAt) / 1000;
    currentTime = (currentTime + delta) % currentEntry.duration;
  }

  lastFrameAt = now;
  drawAt(currentTime);
  requestAnimationFrame(tick);
}

function setupLabGui(): void {
  if (!labMode) {
    refreshLabHint();
    return;
  }

  const gui = new GUI({
    title: "Creative Lab"
  });
  const controllers: Array<{ updateDisplay: () => void }> = [];
  const presetOptions = Object.fromEntries(
    listLabPresets().map((preset) => [preset.label, preset.id])
  );
  const actions = {
    resetPreset: () => {
      Object.assign(labState, resetLabState(labState));
      refreshControllers();
      handleLabChange();
      refreshLabHint(`Reset to ${labPresets[labState.preset].label}.`);
    },
    copyPresetUrl: async () => {
      writeUrlState();

      try {
        await navigator.clipboard.writeText(window.location.href);
        refreshLabHint("Copied the current preset URL to the clipboard.");
      } catch {
        refreshLabHint("Could not copy automatically, but the current URL now contains the preset.");
      }
    }
  };

  function refreshControllers(): void {
    controllers.forEach((controller) => controller.updateDisplay());
  }

  function handleLabChange(): void {
    Object.assign(labState, clampLabState(labState));
    refreshControllers();
    renderFrame(currentTime);
    writeUrlState();
  }

  const presetController = gui
    .add(labState, "preset", presetOptions)
    .name("Preset")
    .onChange((value: string) => {
      if (!isLabPresetId(value)) {
        return;
      }

      Object.assign(labState, resetLabState(labState, value));
      refreshControllers();
      handleLabChange();
      refreshLabHint(`Loaded ${labPresets[value].label}.`);
    });

  controllers.push(presetController);

  const remix = gui.addFolder("Remix");
  controllers.push(
    remix.add(labState, "hueShift", -120, 120, 1).name("Hue Shift").onChange(handleLabChange),
    remix.add(labState, "energy", 0.45, 1.8, 0.01).name("Energy").onChange(handleLabChange),
    remix.add(labState, "turbulence", 0.35, 1.8, 0.01).name("Turbulence").onChange(handleLabChange),
    remix.add(labState, "spaciousness", 0.45, 1.8, 0.01).name("Spaciousness").onChange(handleLabChange),
    remix.add(labState, "tempo", 0.45, 1.8, 0.01).name("Tempo").onChange(handleLabChange),
    remix.add(labState, "flow", 0.45, 1.8, 0.01).name("Flow").onChange(handleLabChange),
    remix.add(labState, "overlay", 0.2, 1.8, 0.01).name("Overlay").onChange(handleLabChange)
  );
  remix.open();

  gui.add(actions, "resetPreset").name("Reset To Preset");
  gui.add(actions, "copyPresetUrl").name("Copy Preset URL");
  refreshLabHint();
}

entrySelect.addEventListener("change", () => {
  setEntry(entrySelect.value);
});

scrubber.addEventListener("input", () => {
  const next = (Number(scrubber.value) / 1000) * currentEntry.duration;
  drawAt(next);
  writeUrlState();
});

playToggle.addEventListener("click", () => {
  togglePlayback();
});

window.addEventListener("resize", () => {
  resizeCanvas();
  renderFrame(currentTime);
});

window.addEventListener("keydown", (event) => {
  if (renderMode || isEditableTarget(event.target)) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    togglePlayback();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    nudgeTime(event.shiftKey ? -6 : -2);
    writeUrlState();
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    nudgeTime(event.shiftKey ? 6 : 2);
    writeUrlState();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    stepEntry(-1);
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    stepEntry(1);
  }
});

window.__JHANA__ = {
  renderAt: (time) => {
    drawAt(time);
  },
  setEntry,
  getLabState: () => ({ ...labState }),
  getMeta: () => ({
    id: currentEntry.id,
    title: currentEntry.title,
    duration: currentEntry.duration
  }),
  listEntries: () =>
    entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      duration: entry.duration
    })),
  listLabPresets
};

resizeCanvas();
refreshUi();
setupLabGui();
renderFrame(currentTime);
writeUrlState();
requestAnimationFrame(tick);
