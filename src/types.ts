export type Hsl = [h: number, s: number, l: number];

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
  getMeta: () => { id: string; title: string; duration: number };
  listEntries: () => Array<{ id: string; title: string; duration: number }>;
};

declare global {
  interface Window {
    __JHANA__?: RenderApi;
  }
}
