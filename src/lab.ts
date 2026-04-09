import { clamp } from "./math";
import type { LabPresetId, LabState } from "./types";

type LabPreset = {
  label: string;
  values: Omit<LabState, "preset">;
};

const numericKeys = [
  "hueShift",
  "energy",
  "turbulence",
  "spaciousness",
  "tempo",
  "flow",
  "overlay"
] as const;

type NumericKey = (typeof numericKeys)[number];

export const labPresets: Record<LabPresetId, LabPreset> = {
  neutral: {
    label: "Neutral",
    values: {
      hueShift: 0,
      energy: 1,
      turbulence: 1,
      spaciousness: 1,
      tempo: 1,
      flow: 1,
      overlay: 1
    }
  },
  settling: {
    label: "Settling",
    values: {
      hueShift: -10,
      energy: 0.82,
      turbulence: 0.7,
      spaciousness: 1.08,
      tempo: 0.84,
      flow: 0.88,
      overlay: 0.8
    }
  },
  warmth: {
    label: "Warmth",
    values: {
      hueShift: 14,
      energy: 1.08,
      turbulence: 0.88,
      spaciousness: 0.94,
      tempo: 0.96,
      flow: 1.02,
      overlay: 1.18
    }
  },
  vastness: {
    label: "Vastness",
    values: {
      hueShift: -18,
      energy: 0.92,
      turbulence: 0.72,
      spaciousness: 1.34,
      tempo: 0.82,
      flow: 1.12,
      overlay: 0.9
    }
  },
  electric: {
    label: "Electric",
    values: {
      hueShift: 8,
      energy: 1.26,
      turbulence: 1.28,
      spaciousness: 0.92,
      tempo: 1.22,
      flow: 1.16,
      overlay: 1.14
    }
  }
};

export const defaultLabPreset: LabPresetId = "neutral";

export function isLabPresetId(value: string | null | undefined): value is LabPresetId {
  return Boolean(value && value in labPresets);
}

export function createLabState(preset: LabPresetId = defaultLabPreset): LabState {
  return {
    preset,
    ...labPresets[preset].values
  };
}

export function clampLabState(state: LabState): LabState {
  return {
    ...state,
    hueShift: clamp(state.hueShift, -120, 120),
    energy: clamp(state.energy, 0.45, 1.8),
    turbulence: clamp(state.turbulence, 0.35, 1.8),
    spaciousness: clamp(state.spaciousness, 0.45, 1.8),
    tempo: clamp(state.tempo, 0.45, 1.8),
    flow: clamp(state.flow, 0.45, 1.8),
    overlay: clamp(state.overlay, 0.2, 1.8)
  };
}

export function readLabState(params: URLSearchParams): LabState {
  const rawPreset = params.get("labPreset");
  const preset = isLabPresetId(rawPreset) ? rawPreset : defaultLabPreset;
  const state = createLabState(preset);

  numericKeys.forEach((key) => {
    const value = params.get(key);
    if (value === null) {
      return;
    }

    const raw = Number(value);
    if (Number.isFinite(raw)) {
      state[key] = raw;
    }
  });

  return clampLabState(state);
}

export function writeLabParams(params: URLSearchParams, state: LabState, active: boolean): void {
  if (!active) {
    params.delete("lab");
    params.delete("labPreset");
    numericKeys.forEach((key) => params.delete(key));
    return;
  }

  const clamped = clampLabState(state);
  const presetValues = labPresets[clamped.preset].values;

  params.set("lab", "1");
  params.set("labPreset", clamped.preset);

  numericKeys.forEach((key) => {
    const value = clamped[key];
    const presetValue = presetValues[key];

    if (Math.abs(value - presetValue) < 0.005) {
      params.delete(key);
      return;
    }

    params.set(key, key === "hueShift" ? value.toFixed(0) : value.toFixed(2));
  });
}

export function hasLabQuery(params: URLSearchParams): boolean {
  return params.get("lab") === "1" || params.has("labPreset") || numericKeys.some((key) => params.has(key));
}

export function resetLabState(state: LabState, preset = state.preset): LabState {
  return createLabState(preset);
}

export function listLabPresets(): Array<{ id: LabPresetId; label: string }> {
  return Object.entries(labPresets).map(([id, preset]) => ({
    id: id as LabPresetId,
    label: preset.label
  }));
}
