import "./styles.css";

import { entries, getSegmentLabel, resolveEntry } from "./entries";
import { secondsToClock } from "./math";
import type { Entry } from "./types";

function requireElement<T>(selector: string): T {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element as T;
}

const params = new URLSearchParams(window.location.search);
const renderMode = params.get("mode") === "render" || params.get("hideUi") === "1";
const initialTime = Number(params.get("t") ?? "0");

if (renderMode) {
  document.body.classList.add("render-mode");
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
let playing = !renderMode;
let lastFrameAt = performance.now();

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
    dpr
  });

  context.setTransform(1, 0, 0, 1, 0, 0);
}

function setEntry(id: string): void {
  currentEntry = resolveEntry(id);
  currentTime = Math.min(currentTime, currentEntry.duration);
  refreshUi();
  renderFrame(currentTime);

  const nextParams = new URLSearchParams(window.location.search);
  nextParams.set("entry", currentEntry.id);
  history.replaceState({}, "", `${window.location.pathname}?${nextParams.toString()}`);
}

function drawAt(time: number): void {
  currentTime = ((time % currentEntry.duration) + currentEntry.duration) % currentEntry.duration;
  refreshUi();
  renderFrame(currentTime);
}

function togglePlayback(): void {
  playing = !playing;
  refreshUi();
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

entrySelect.addEventListener("change", () => {
  setEntry(entrySelect.value);
});

scrubber.addEventListener("input", () => {
  const next = (Number(scrubber.value) / 1000) * currentEntry.duration;
  drawAt(next);
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
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    nudgeTime(event.shiftKey ? 6 : 2);
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
    }))
};

resizeCanvas();
refreshUi();
renderFrame(currentTime);
requestAnimationFrame(tick);
