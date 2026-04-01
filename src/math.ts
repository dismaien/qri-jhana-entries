import type { Hsl } from "./types";

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

export function fract(value: number): number {
  return value - Math.floor(value);
}

export function hash2(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

export function noise2(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  return mix(mix(a, b, ux), mix(c, d, ux), uy);
}

export function fbm(x: number, y: number, octaves = 4): number {
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  let normalizer = 0;

  for (let i = 0; i < octaves; i += 1) {
    total += noise2(x * frequency, y * frequency) * amplitude;
    normalizer += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return total / normalizer;
}

export function mixHsl(a: Hsl, b: Hsl, t: number): Hsl {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

export function hsla(color: Hsl, alpha = 1): string {
  return `hsla(${color[0].toFixed(1)} ${color[1].toFixed(1)}% ${color[2].toFixed(1)}% / ${clamp(alpha).toFixed(3)})`;
}

export function secondsToClock(value: number): string {
  const whole = Math.max(0, Math.floor(value));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
