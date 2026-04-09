export type Hsl = [h: number, s: number, l: number];

export type LabPresetId = "neutral" | "settling" | "warmth" | "vastness" | "electric";

export type LabState = {
  preset: LabPresetId;
  hueShift: number;
  energy: number;
  turbulence: number;
  spaciousness: number;
  tempo: number;
  flow: number;
  overlay: number;
};

export type Segment = {
  label: string;
  start: number;
  end: number;
  note: string;
};

export type RenderEnv = {
  t: number;
  width: number;
  height: number;
  dpr: number;
  lab: LabState;
};

export type Entry = {
  id: string;
  title: string;
  summary: string;
  duration: number;
  tags: string;
  segments: Segment[];
  render: (ctx: CanvasRenderingContext2D, env: RenderEnv) => void;
};

export type RenderApi = {
  renderAt: (t: number) => void;
  setEntry: (id: string) => void;
  getLabState: () => LabState;
  getMeta: () => { id: string; title: string; duration: number };
  listEntries: () => Array<{ id: string; title: string; duration: number }>;
  listLabPresets: () => Array<{ id: LabPresetId; label: string }>;
};

declare global {
  interface Window {
    __JHANA__?: RenderApi;
  }
}
