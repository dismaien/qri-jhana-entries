import { clamp, fbm, hash2, hsla, mix, mixHsl, smoothstep } from "./math";
import type { Entry, Hsl, LabState, RenderEnv, Segment } from "./types";

type Profile = {
  bgTop: Hsl;
  bgBottom: Hsl;
  glow: Hsl;
  accent: Hsl;
  line: Hsl;
  body: Hsl;
  nodeWeights: number[];
  coherence: number;
  turbulence: number;
  intensity: number;
  pulseRate: number;
  lineLength: number;
  halo: number;
  spaciousness: number;
  reflexivity: number;
  emptiness: number;
  thinness: number;
  beam: number;
  symmetry: number;
  stillness: number;
};

type ProfileSegment = Segment & {
  profile: Profile;
};

type Node = {
  x: number;
  y: number;
  bend: number;
};

type FieldSample = {
  vx: number;
  vy: number;
  energy: number;
};

const bodyNodes: Node[] = [
  { x: 0.5, y: 0.17, bend: 0.2 },
  { x: 0.5, y: 0.28, bend: 0.15 },
  { x: 0.5, y: 0.41, bend: 0.0 },
  { x: 0.5, y: 0.54, bend: -0.06 },
  { x: 0.5, y: 0.67, bend: -0.12 },
  { x: 0.36, y: 0.52, bend: 0.34 },
  { x: 0.64, y: 0.52, bend: -0.34 },
  { x: 0.5, y: 0.83, bend: 0.0 }
];

const spaceNodes: Node[] = [
  { x: 0.22, y: 0.24, bend: 0.18 },
  { x: 0.78, y: 0.24, bend: -0.18 },
  { x: 0.2, y: 0.74, bend: 0.42 },
  { x: 0.8, y: 0.74, bend: -0.42 },
  { x: 0.5, y: 0.5, bend: 0.0 },
  { x: 0.35, y: 0.5, bend: 0.8 },
  { x: 0.65, y: 0.5, bend: -0.8 },
  { x: 0.5, y: 0.14, bend: 0.0 }
];

const SOMATIC_DURATION = 24;
const FORMLESS_DURATION = 24;
const INDUCTION_DURATION = 18;
const ATLAS_DURATION = 24;
const TANTRIC_ATLAS_DURATION = 24;

const somaticTimeline: ProfileSegment[] = [
  {
    label: "Jhana 1",
    start: 0,
    end: 6,
    note: "Attention locks in with serrated, rapturous vibration centered in chest and head.",
    profile: {
      bgTop: [228, 42, 10],
      bgBottom: [332, 77, 11],
      glow: [45, 100, 66],
      accent: [8, 93, 62],
      line: [27, 83, 78],
      body: [17, 22, 15],
      nodeWeights: [1.1, 0.92, 1.45, 0.7, 0.35, 0.28, 0.28, 0.18],
      coherence: 0.52,
      turbulence: 0.78,
      intensity: 1,
      pulseRate: 9.6,
      lineLength: 1.12,
      halo: 0.82,
      spaciousness: 0.18,
      reflexivity: 0.08,
      emptiness: 0.04,
      thinness: 0.06,
      beam: 0.62,
      symmetry: 0.62,
      stillness: 0.06
    }
  },
  {
    label: "Jhana 2",
    start: 6,
    end: 12,
    note: "Effort drops. The whole body behaves like a brighter, self-propelling resonant circuit.",
    profile: {
      bgTop: [224, 48, 11],
      bgBottom: [12, 72, 14],
      glow: [44, 96, 70],
      accent: [20, 90, 66],
      line: [39, 90, 82],
      body: [18, 22, 16],
      nodeWeights: [0.88, 0.82, 1.05, 0.96, 0.74, 0.67, 0.67, 0.62],
      coherence: 0.78,
      turbulence: 0.34,
      intensity: 0.92,
      pulseRate: 7.1,
      lineLength: 1.18,
      halo: 0.93,
      spaciousness: 0.28,
      reflexivity: 0.1,
      emptiness: 0.03,
      thinness: 0.08,
      beam: 0.34,
      symmetry: 0.72,
      stillness: 0.18
    }
  },
  {
    label: "Jhana 3",
    start: 12,
    end: 18,
    note: "The field cools and broadens. Pleasure becomes placid, laminar, and less insistent.",
    profile: {
      bgTop: [208, 42, 13],
      bgBottom: [175, 48, 14],
      glow: [181, 88, 67],
      accent: [198, 82, 71],
      line: [191, 82, 82],
      body: [13, 14, 16],
      nodeWeights: [0.56, 0.48, 0.72, 0.92, 1.04, 0.58, 0.58, 0.84],
      coherence: 0.82,
      turbulence: 0.18,
      intensity: 0.66,
      pulseRate: 4.2,
      lineLength: 0.92,
      halo: 0.8,
      spaciousness: 0.35,
      reflexivity: 0.14,
      emptiness: 0.02,
      thinness: 0.12,
      beam: 0.18,
      symmetry: 0.84,
      stillness: 0.58
    }
  },
  {
    label: "Jhana 4",
    start: 18,
    end: 24,
    note: "Equanimity becomes a nearly uniform luminous membrane with minimal preference or push.",
    profile: {
      bgTop: [216, 32, 15],
      bgBottom: [203, 22, 16],
      glow: [201, 32, 82],
      accent: [42, 25, 80],
      line: [198, 28, 90],
      body: [15, 10, 19],
      nodeWeights: [0.76, 0.74, 0.78, 0.76, 0.74, 0.72, 0.72, 0.74],
      coherence: 0.94,
      turbulence: 0.08,
      intensity: 0.42,
      pulseRate: 2.1,
      lineLength: 0.72,
      halo: 0.64,
      spaciousness: 0.46,
      reflexivity: 0.18,
      emptiness: 0.04,
      thinness: 0.18,
      beam: 0.06,
      symmetry: 0.97,
      stillness: 0.92
    }
  }
];

const formlessTimeline: ProfileSegment[] = [
  {
    label: "Jhana 5",
    start: 0,
    end: 6,
    note: "Figure-ground inverts and the canvas reads as boundless spatial openness rather than objecthood.",
    profile: {
      bgTop: [219, 52, 9],
      bgBottom: [250, 42, 12],
      glow: [206, 72, 70],
      accent: [187, 84, 76],
      line: [194, 76, 88],
      body: [0, 0, 0],
      nodeWeights: [0.78, 0.76, 0.94, 0.94, 0.8, 0.78, 0.78, 0.72],
      coherence: 0.74,
      turbulence: 0.16,
      intensity: 0.55,
      pulseRate: 3.4,
      lineLength: 1.18,
      halo: 0.68,
      spaciousness: 0.92,
      reflexivity: 0.22,
      emptiness: 0.2,
      thinness: 0.18,
      beam: 0.02,
      symmetry: 0.72,
      stillness: 0.6
    }
  },
  {
    label: "Jhana 6",
    start: 6,
    end: 12,
    note: "Awareness turns back on itself, forming nested mirrors and reflexive attractors.",
    profile: {
      bgTop: [224, 44, 10],
      bgBottom: [296, 28, 11],
      glow: [274, 82, 78],
      accent: [314, 90, 72],
      line: [268, 86, 88],
      body: [0, 0, 0],
      nodeWeights: [0.72, 0.7, 0.9, 0.9, 1.02, 0.82, 0.82, 0.68],
      coherence: 0.82,
      turbulence: 0.12,
      intensity: 0.48,
      pulseRate: 2.8,
      lineLength: 1.04,
      halo: 0.62,
      spaciousness: 0.64,
      reflexivity: 1,
      emptiness: 0.26,
      thinness: 0.24,
      beam: 0.04,
      symmetry: 0.9,
      stillness: 0.72
    }
  },
  {
    label: "Jhana 7",
    start: 12,
    end: 18,
    note: "Landing spots fade out; the field refuses to present anything sturdy enough to grasp.",
    profile: {
      bgTop: [217, 20, 8],
      bgBottom: [208, 12, 8],
      glow: [34, 30, 70],
      accent: [206, 18, 76],
      line: [42, 28, 84],
      body: [0, 0, 0],
      nodeWeights: [0.36, 0.34, 0.42, 0.42, 0.72, 0.52, 0.52, 0.4],
      coherence: 0.88,
      turbulence: 0.09,
      intensity: 0.24,
      pulseRate: 1.7,
      lineLength: 0.82,
      halo: 0.42,
      spaciousness: 0.54,
      reflexivity: 0.4,
      emptiness: 0.96,
      thinness: 0.62,
      beam: 0.01,
      symmetry: 0.92,
      stillness: 0.9
    }
  },
  {
    label: "Jhana 8",
    start: 18,
    end: 24,
    note: "Only a faint threshold between perception and non-perception remains, almost too slight to depict.",
    profile: {
      bgTop: [223, 18, 7],
      bgBottom: [230, 10, 7],
      glow: [219, 22, 82],
      accent: [48, 24, 80],
      line: [215, 24, 92],
      body: [0, 0, 0],
      nodeWeights: [0.18, 0.18, 0.2, 0.2, 0.34, 0.26, 0.26, 0.18],
      coherence: 0.97,
      turbulence: 0.03,
      intensity: 0.12,
      pulseRate: 0.9,
      lineLength: 0.58,
      halo: 0.24,
      spaciousness: 0.5,
      reflexivity: 0.28,
      emptiness: 0.74,
      thinness: 0.97,
      beam: 0.0,
      symmetry: 0.97,
      stillness: 0.98
    }
  }
];

const inductionTimeline: ProfileSegment[] = [
  {
    label: "Collect The Breath",
    start: 0,
    end: 6,
    note: "A narrow attention beam stabilizes at the nostrils and upper chest.",
    profile: {
      bgTop: [226, 40, 10],
      bgBottom: [212, 36, 12],
      glow: [203, 84, 72],
      accent: [42, 90, 68],
      line: [208, 72, 88],
      body: [14, 15, 16],
      nodeWeights: [0.7, 0.85, 0.8, 0.42, 0.18, 0.12, 0.12, 0.1],
      coherence: 0.55,
      turbulence: 0.16,
      intensity: 0.38,
      pulseRate: 1.8,
      lineLength: 0.72,
      halo: 0.48,
      spaciousness: 0.12,
      reflexivity: 0.06,
      emptiness: 0.04,
      thinness: 0.08,
      beam: 0.88,
      symmetry: 0.82,
      stillness: 0.52
    }
  },
  {
    label: "Spread The Pleasant Field",
    start: 6,
    end: 12,
    note: "Pleasant energy is invited down from chest into the rest of the body without forcing it.",
    profile: {
      bgTop: [220, 42, 11],
      bgBottom: [24, 55, 13],
      glow: [45, 96, 71],
      accent: [15, 86, 68],
      line: [34, 86, 84],
      body: [16, 20, 16],
      nodeWeights: [0.66, 0.66, 0.96, 0.82, 0.46, 0.34, 0.34, 0.26],
      coherence: 0.68,
      turbulence: 0.18,
      intensity: 0.52,
      pulseRate: 2.8,
      lineLength: 0.94,
      halo: 0.74,
      spaciousness: 0.2,
      reflexivity: 0.08,
      emptiness: 0.03,
      thinness: 0.08,
      beam: 0.4,
      symmetry: 0.86,
      stillness: 0.44
    }
  },
  {
    label: "Lock-In",
    start: 12,
    end: 18,
    note: "The field sharpens into a proto-J1 onset without fully becoming a competition accuracy claim.",
    profile: {
      bgTop: [225, 44, 10],
      bgBottom: [336, 63, 11],
      glow: [46, 100, 67],
      accent: [8, 90, 60],
      line: [31, 88, 82],
      body: [16, 21, 15],
      nodeWeights: [0.92, 0.82, 1.1, 0.62, 0.26, 0.22, 0.22, 0.18],
      coherence: 0.76,
      turbulence: 0.28,
      intensity: 0.68,
      pulseRate: 4.2,
      lineLength: 1.02,
      halo: 0.78,
      spaciousness: 0.18,
      reflexivity: 0.08,
      emptiness: 0.03,
      thinness: 0.1,
      beam: 0.62,
      symmetry: 0.86,
      stillness: 0.34
    }
  }
];

const atlasTimeline: ProfileSegment[] = [
  {
    label: "Grounding Breath",
    start: 0,
    end: 6,
    note: "A calm breath anchor gathers around the face, throat, and upper chest without forcing the rest of experience away.",
    profile: {
      bgTop: [214, 44, 10],
      bgBottom: [193, 42, 12],
      glow: [188, 82, 72],
      accent: [50, 76, 74],
      line: [194, 68, 86],
      body: [13, 17, 16],
      nodeWeights: [0.72, 0.94, 0.88, 0.42, 0.2, 0.18, 0.18, 0.14],
      coherence: 0.62,
      turbulence: 0.12,
      intensity: 0.34,
      pulseRate: 1.25,
      lineLength: 0.72,
      halo: 0.52,
      spaciousness: 0.22,
      reflexivity: 0.08,
      emptiness: 0.04,
      thinness: 0.08,
      beam: 0.72,
      symmetry: 0.84,
      stillness: 0.54
    }
  },
  {
    label: "Body Scan River",
    start: 6,
    end: 12,
    note: "Attention sweeps gently through the body as if sensation were being combed into continuity instead of poked point by point.",
    profile: {
      bgTop: [206, 38, 10],
      bgBottom: [168, 44, 13],
      glow: [168, 70, 68],
      accent: [38, 82, 70],
      line: [175, 62, 84],
      body: [15, 17, 16],
      nodeWeights: [0.56, 0.58, 0.76, 0.92, 1.02, 0.62, 0.62, 0.88],
      coherence: 0.7,
      turbulence: 0.14,
      intensity: 0.42,
      pulseRate: 1.7,
      lineLength: 0.86,
      halo: 0.68,
      spaciousness: 0.28,
      reflexivity: 0.1,
      emptiness: 0.03,
      thinness: 0.1,
      beam: 0.26,
      symmetry: 0.88,
      stillness: 0.48
    }
  },
  {
    label: "Metta Hearth",
    start: 12,
    end: 18,
    note: "Warmth accumulates near the heart and then radiates outward until the whole body feels gently inhabited.",
    profile: {
      bgTop: [232, 30, 11],
      bgBottom: [8, 58, 13],
      glow: [34, 96, 72],
      accent: [349, 86, 72],
      line: [26, 88, 86],
      body: [18, 18, 16],
      nodeWeights: [0.44, 0.46, 1.08, 0.94, 0.62, 0.34, 0.34, 0.28],
      coherence: 0.76,
      turbulence: 0.12,
      intensity: 0.56,
      pulseRate: 2.35,
      lineLength: 0.98,
      halo: 0.88,
      spaciousness: 0.32,
      reflexivity: 0.1,
      emptiness: 0.02,
      thinness: 0.08,
      beam: 0.18,
      symmetry: 0.82,
      stillness: 0.4
    }
  },
  {
    label: "Open Sky",
    start: 18,
    end: 24,
    note: "The body reference becomes optional and awareness relaxes into an unowned, wide, lightly shimmering field.",
    profile: {
      bgTop: [214, 34, 9],
      bgBottom: [254, 28, 10],
      glow: [200, 62, 72],
      accent: [171, 60, 78],
      line: [208, 56, 88],
      body: [0, 0, 0],
      nodeWeights: [0.58, 0.56, 0.64, 0.64, 0.7, 0.6, 0.6, 0.48],
      coherence: 0.84,
      turbulence: 0.08,
      intensity: 0.36,
      pulseRate: 1.2,
      lineLength: 1.06,
      halo: 0.54,
      spaciousness: 0.94,
      reflexivity: 0.18,
      emptiness: 0.24,
      thinness: 0.34,
      beam: 0.02,
      symmetry: 0.86,
      stillness: 0.84
    }
  }
];

const tantricAtlasTimeline: ProfileSegment[] = [
  {
    label: "Breath Pause",
    start: 0,
    end: 6,
    note: "Attention gathers in the breath and the charged stillness around the pause.",
    profile: {
      bgTop: [222, 42, 9],
      bgBottom: [188, 46, 11],
      glow: [184, 78, 72],
      accent: [42, 88, 72],
      line: [190, 72, 88],
      body: [13, 17, 16],
      nodeWeights: [0.7, 1.02, 0.88, 0.42, 0.24, 0.18, 0.18, 0.14],
      coherence: 0.68,
      turbulence: 0.1,
      intensity: 0.34,
      pulseRate: 1.15,
      lineLength: 0.68,
      halo: 0.56,
      spaciousness: 0.24,
      reflexivity: 0.12,
      emptiness: 0.04,
      thinness: 0.08,
      beam: 0.78,
      symmetry: 0.88,
      stillness: 0.62
    }
  },
  {
    label: "Heart Lotus",
    start: 6,
    end: 12,
    note: "The heart is treated as the converging center of affect, attention, and recognition.",
    profile: {
      bgTop: [236, 32, 10],
      bgBottom: [348, 54, 12],
      glow: [35, 96, 74],
      accent: [334, 88, 72],
      line: [26, 86, 86],
      body: [18, 17, 15],
      nodeWeights: [0.44, 0.52, 1.18, 0.92, 0.52, 0.34, 0.34, 0.28],
      coherence: 0.78,
      turbulence: 0.12,
      intensity: 0.56,
      pulseRate: 2.1,
      lineLength: 0.92,
      halo: 0.94,
      spaciousness: 0.34,
      reflexivity: 0.2,
      emptiness: 0.02,
      thinness: 0.08,
      beam: 0.18,
      symmetry: 0.88,
      stillness: 0.44
    }
  },
  {
    label: "Space In The Body",
    start: 12,
    end: 18,
    note: "The body becomes porous and spacious without disappearing from experience.",
    profile: {
      bgTop: [214, 30, 9],
      bgBottom: [252, 24, 10],
      glow: [204, 62, 76],
      accent: [168, 62, 78],
      line: [210, 58, 88],
      body: [10, 9, 15],
      nodeWeights: [0.54, 0.58, 0.7, 0.76, 0.84, 0.54, 0.54, 0.52],
      coherence: 0.84,
      turbulence: 0.08,
      intensity: 0.38,
      pulseRate: 1.05,
      lineLength: 1.08,
      halo: 0.62,
      spaciousness: 0.78,
      reflexivity: 0.28,
      emptiness: 0.26,
      thinness: 0.34,
      beam: 0.02,
      symmetry: 0.9,
      stillness: 0.82
    }
  },
  {
    label: "Recognition Field",
    start: 18,
    end: 24,
    note: "Ordinary perception relaxes into an unbroken field of awareness and manifestation.",
    profile: {
      bgTop: [224, 24, 8],
      bgBottom: [266, 24, 9],
      glow: [270, 62, 78],
      accent: [198, 70, 78],
      line: [244, 56, 88],
      body: [0, 0, 0],
      nodeWeights: [0.58, 0.56, 0.64, 0.64, 0.94, 0.72, 0.72, 0.5],
      coherence: 0.88,
      turbulence: 0.06,
      intensity: 0.34,
      pulseRate: 0.92,
      lineLength: 1.16,
      halo: 0.58,
      spaciousness: 1,
      reflexivity: 0.72,
      emptiness: 0.36,
      thinness: 0.46,
      beam: 0,
      symmetry: 0.92,
      stillness: 0.9
    }
  }
];

function mixProfile(a: Profile, b: Profile, t: number): Profile {
  return {
    bgTop: mixHsl(a.bgTop, b.bgTop, t),
    bgBottom: mixHsl(a.bgBottom, b.bgBottom, t),
    glow: mixHsl(a.glow, b.glow, t),
    accent: mixHsl(a.accent, b.accent, t),
    line: mixHsl(a.line, b.line, t),
    body: mixHsl(a.body, b.body, t),
    nodeWeights: a.nodeWeights.map((weight, index) => mix(weight, b.nodeWeights[index] ?? weight, t)),
    coherence: mix(a.coherence, b.coherence, t),
    turbulence: mix(a.turbulence, b.turbulence, t),
    intensity: mix(a.intensity, b.intensity, t),
    pulseRate: mix(a.pulseRate, b.pulseRate, t),
    lineLength: mix(a.lineLength, b.lineLength, t),
    halo: mix(a.halo, b.halo, t),
    spaciousness: mix(a.spaciousness, b.spaciousness, t),
    reflexivity: mix(a.reflexivity, b.reflexivity, t),
    emptiness: mix(a.emptiness, b.emptiness, t),
    thinness: mix(a.thinness, b.thinness, t),
    beam: mix(a.beam, b.beam, t),
    symmetry: mix(a.symmetry, b.symmetry, t),
    stillness: mix(a.stillness, b.stillness, t)
  };
}

function shiftHue(color: Hsl, amount: number): Hsl {
  const hue = (((color[0] + amount) % 360) + 360) % 360;
  return [hue, color[1], color[2]];
}

function applyLabProfile(profile: Profile, lab: LabState): Profile {
  return {
    ...profile,
    bgTop: shiftHue(profile.bgTop, lab.hueShift),
    bgBottom: shiftHue(profile.bgBottom, lab.hueShift * 0.8),
    glow: shiftHue(profile.glow, lab.hueShift),
    accent: shiftHue(profile.accent, lab.hueShift * 1.2),
    line: shiftHue(profile.line, lab.hueShift * 0.9),
    body: profile.body[1] === 0 && profile.body[2] === 0 ? profile.body : shiftHue(profile.body, lab.hueShift * 0.4),
    intensity: clamp(profile.intensity * lab.energy, 0, 1.5),
    turbulence: clamp(profile.turbulence * lab.turbulence, 0, 1.6),
    pulseRate: Math.max(0.2, profile.pulseRate * lab.tempo),
    lineLength: clamp(profile.lineLength * lab.flow, 0.3, 1.9),
    halo: clamp(profile.halo * mix(0.8, 1.3, (lab.overlay - 0.2) / 1.6), 0, 1.5),
    spaciousness: clamp(profile.spaciousness * lab.spaciousness, 0, 1.5),
    reflexivity: clamp(profile.reflexivity * mix(0.86, 1.2, (lab.spaciousness - 0.45) / 1.35), 0, 1.4),
    beam: clamp(profile.beam * mix(0.75, 1.2, (lab.overlay - 0.2) / 1.6), 0, 1.2),
    symmetry: clamp(profile.symmetry * mix(0.92, 1.08, (lab.flow - 0.45) / 1.35), 0, 1),
    stillness: clamp(profile.stillness * mix(1.08, 0.82, (lab.energy - 0.45) / 1.35), 0, 1)
  };
}

function getSegmentAtTime(segments: Segment[], t: number): Segment {
  return segments.find((segment) => t >= segment.start && t < segment.end) ?? segments[segments.length - 1];
}

function interpolateTimeline(timeline: ProfileSegment[], t: number): Profile {
  const currentIndex = timeline.findIndex((segment) => t >= segment.start && t < segment.end);
  const safeIndex = currentIndex === -1 ? timeline.length - 1 : currentIndex;
  const current = timeline[safeIndex];
  const next = timeline[Math.min(safeIndex + 1, timeline.length - 1)];
  const blend = smoothstep(current.end - 1.1, current.end, t);
  return mixProfile(current.profile, next.profile, blend);
}

function segmentProgress(segment: Segment, t: number): number {
  return clamp((t - segment.start) / Math.max(0.001, segment.end - segment.start));
}

function applySegmentEnvelope(profile: Profile, segment: Segment, t: number, showBody: boolean): Profile {
  const p = segmentProgress(segment, t);
  const attack = smoothstep(0, 0.18, p);
  const release = 1 - smoothstep(0.78, 1, p);
  const middle = smoothstep(0.12, 0.42, p) * (1 - smoothstep(0.68, 0.96, p));
  const breath = 0.5 + 0.5 * Math.sin((p * Math.PI * 2 + profile.reflexivity * 0.7) * (showBody ? 1.2 : 0.72));

  let intensity = profile.intensity;
  let turbulence = profile.turbulence;
  let lineLength = profile.lineLength;
  let halo = profile.halo;
  let beam = profile.beam;
  let stillness = profile.stillness;
  let thinness = profile.thinness;

  if (segment.label === "Jhana 1") {
    const ignition = attack * (0.65 + breath * 0.35);
    intensity *= 0.82 + ignition * 0.32;
    turbulence *= 0.94 + ignition * 0.2;
    beam *= 1 + attack * 0.18;
    lineLength *= 0.9 + attack * 0.18;
  } else if (segment.label === "Jhana 2") {
    intensity *= 0.94 + middle * 0.12;
    turbulence *= 1 - middle * 0.14;
    halo *= 1 + middle * 0.12;
    lineLength *= 1 + middle * 0.1;
  } else if (segment.label === "Jhana 3") {
    const easing = smoothstep(0.08, 0.72, p);
    intensity *= 1 - easing * 0.1;
    turbulence *= 1 - easing * 0.24;
    stillness = clamp(stillness + easing * 0.08);
    lineLength *= 1.04 - easing * 0.08;
  } else if (segment.label === "Jhana 4") {
    const settling = smoothstep(0.04, 0.64, p);
    intensity *= 0.92 + settling * 0.06;
    turbulence *= 1 - settling * 0.32;
    stillness = clamp(stillness + settling * 0.08);
    lineLength *= 1 - settling * 0.16;
  } else if (segment.label === "Jhana 5") {
    const opening = smoothstep(0.02, 0.7, p);
    halo *= 0.9 + opening * 0.18;
    lineLength *= 0.92 + opening * 0.16;
    thinness = clamp(thinness + release * 0.04);
  } else if (segment.label === "Jhana 6") {
    const recursion = middle * (0.7 + breath * 0.3);
    halo *= 0.94 + recursion * 0.16;
    lineLength *= 0.96 + recursion * 0.12;
    stillness = clamp(stillness + recursion * 0.04);
  } else if (segment.label === "Jhana 7") {
    const ungrasping = smoothstep(0.06, 0.78, p);
    intensity *= 1 - ungrasping * 0.18;
    lineLength *= 1 - ungrasping * 0.2;
    thinness = clamp(thinness + ungrasping * 0.1);
    stillness = clamp(stillness + ungrasping * 0.05);
  } else if (segment.label === "Jhana 8") {
    const threshold = smoothstep(0.04, 0.88, p);
    intensity *= 0.95 - threshold * 0.22;
    halo *= 0.96 - threshold * 0.18;
    lineLength *= 0.92 - threshold * 0.18;
    thinness = clamp(thinness + threshold * 0.12);
    stillness = clamp(stillness + threshold * 0.04);
  }

  return {
    ...profile,
    intensity: clamp(intensity, 0, 1.5),
    turbulence: clamp(turbulence, 0, 1.6),
    lineLength: clamp(lineLength, 0.3, 1.9),
    halo: clamp(halo, 0, 1.5),
    beam: clamp(beam, 0, 1.2),
    stillness,
    thinness
  };
}

function smoothMask(value: number, inner: number, outer: number): number {
  return 1 - smoothstep(inner, outer, value);
}

function ellipseMetric(nx: number, ny: number, cx: number, cy: number, rx: number, ry: number): number {
  const dx = (nx - cx) / rx;
  const dy = (ny - cy) / ry;
  return dx * dx + dy * dy;
}

function bodyCoreMask(nx: number, ny: number): number {
  const head = smoothMask(ellipseMetric(nx, ny, 0.5, 0.17, 0.09, 0.105), 0.74, 1.08);
  const chest = smoothMask(ellipseMetric(nx, ny, 0.5, 0.39, 0.16, 0.2), 0.76, 1.12);
  const belly = smoothMask(ellipseMetric(nx, ny, 0.5, 0.58, 0.13, 0.19), 0.8, 1.14);
  const pelvis = smoothMask(ellipseMetric(nx, ny, 0.5, 0.73, 0.12, 0.11), 0.84, 1.12);
  const armLeft = smoothMask(ellipseMetric(nx, ny, 0.36, 0.5, 0.08, 0.19), 0.82, 1.16);
  const armRight = smoothMask(ellipseMetric(nx, ny, 0.64, 0.5, 0.08, 0.19), 0.82, 1.16);
  const legLeft = smoothMask(ellipseMetric(nx, ny, 0.45, 0.88, 0.08, 0.16), 0.82, 1.18);
  const legRight = smoothMask(ellipseMetric(nx, ny, 0.55, 0.88, 0.08, 0.16), 0.82, 1.18);

  return clamp(Math.max(head, chest, belly, pelvis, armLeft, armRight, legLeft, legRight));
}

function auraMask(nx: number, ny: number): number {
  const core = bodyCoreMask(nx, ny);
  const halo = Math.max(
    smoothMask(ellipseMetric(nx, ny, 0.5, 0.5, 0.22, 0.44), 0.88, 1.34),
    smoothMask(ellipseMetric(nx, ny, 0.5, 0.5, 0.28, 0.5), 0.96, 1.42)
  );
  return clamp(Math.max(core, halo * 0.72));
}

function bodyPath(width: number, height: number): Path2D {
  const path = new Path2D();
  const cx = width * 0.5;

  path.moveTo(cx, height * 0.06);
  path.bezierCurveTo(cx + width * 0.08, height * 0.05, cx + width * 0.11, height * 0.16, cx + width * 0.09, height * 0.22);
  path.bezierCurveTo(cx + width * 0.2, height * 0.25, cx + width * 0.21, height * 0.37, cx + width * 0.2, height * 0.48);
  path.bezierCurveTo(cx + width * 0.22, height * 0.57, cx + width * 0.18, height * 0.65, cx + width * 0.16, height * 0.74);
  path.bezierCurveTo(cx + width * 0.15, height * 0.82, cx + width * 0.11, height * 0.92, cx + width * 0.07, height * 0.98);
  path.bezierCurveTo(cx + width * 0.03, height * 1.02, cx + width * 0.015, height * 1.02, cx, height * 1.01);

  path.bezierCurveTo(cx - width * 0.015, height * 1.02, cx - width * 0.03, height * 1.02, cx - width * 0.07, height * 0.98);
  path.bezierCurveTo(cx - width * 0.11, height * 0.92, cx - width * 0.15, height * 0.82, cx - width * 0.16, height * 0.74);
  path.bezierCurveTo(cx - width * 0.18, height * 0.65, cx - width * 0.22, height * 0.57, cx - width * 0.2, height * 0.48);
  path.bezierCurveTo(cx - width * 0.21, height * 0.37, cx - width * 0.2, height * 0.25, cx - width * 0.09, height * 0.22);
  path.bezierCurveTo(cx - width * 0.11, height * 0.16, cx - width * 0.08, height * 0.05, cx, height * 0.06);
  path.closePath();

  return path;
}

function sampleField(nx: number, ny: number, t: number, profile: Profile, nodes: Node[], showBody: boolean): FieldSample {
  const centerDx = nx - 0.5;
  const centerDy = ny - 0.5;
  const scale = showBody ? 1 : 1.25;
  let vx = showBody ? 0 : centerDx * profile.spaciousness * 0.22;
  let vy = showBody ? -profile.beam * 0.04 : centerDy * profile.spaciousness * 0.22;
  let energy = 0;

  nodes.forEach((node, index) => {
    const dx = nx - node.x;
    const dy = ny - node.y;
    const dist = Math.hypot(dx, dy) + 0.0001;
    const angle = Math.atan2(dy, dx);
    const oscillation =
      Math.sin(
        dist * (8 + profile.coherence * 20) * scale -
          t * (profile.pulseRate * 0.72 + index * 0.13) +
          node.bend * 2.4 +
          angle * (profile.reflexivity * 1.7 - 0.48)
      );
    const companion = Math.cos(
      dist * (18 - profile.turbulence * 7) * scale +
        t * (0.4 + profile.pulseRate * 0.16) +
        index * 0.9
    );
    const falloff = (profile.nodeWeights[index] ?? 1) * Math.exp(-dist * (5.8 - profile.spaciousness * 2));
    const swirl = 0.42 + profile.coherence * 0.34 + profile.reflexivity * 0.24;
    const radial = 0.1 + profile.spaciousness * 0.25;

    vx += ((-dy / dist) * oscillation * swirl + (dx / dist) * companion * radial) * falloff;
    vy += ((dx / dist) * oscillation * swirl + (dy / dist) * companion * radial) * falloff;
    energy += (0.35 + 0.65 * Math.abs(oscillation)) * falloff;
  });

  const noise = fbm(nx * 6 + t * (0.15 + profile.turbulence * 0.42), ny * 6 - t * 0.08, 3);
  const noiseAngle = noise * Math.PI * 2;
  vx += Math.cos(noiseAngle) * profile.turbulence * 0.22;
  vy += Math.sin(noiseAngle) * profile.turbulence * 0.22;

  vx += (0.5 - nx) * (showBody ? 0.14 * profile.symmetry : -0.06 * profile.spaciousness);
  vy += (0.45 - ny) * (showBody ? 0.11 * profile.beam : -0.06 * profile.reflexivity);

  if (!showBody) {
    const radialDistance = Math.hypot(centerDx, centerDy);
    energy *= 0.72 + radialDistance * profile.spaciousness * 0.85;
  }

  const centerFocus = Math.exp(-((centerDx * centerDx) * 10 + (centerDy * centerDy) * 8));
  energy = clamp((energy * 0.22 + centerFocus * profile.halo * 0.18) * profile.intensity * (1 - profile.thinness * 0.24));

  if (profile.emptiness > 0.4) {
    const centralVoid = Math.exp(-((centerDx * 1.18) ** 2 + (centerDy * 1.18) ** 2) * 9.5);
    energy *= 1 - profile.emptiness * 0.85 * centralVoid;
  }

  const magnitude = Math.hypot(vx, vy) || 1;

  return {
    vx: vx / magnitude,
    vy: vy / magnitude,
    energy
  };
}

function drawBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number, profile: Profile, t: number): void {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, hsla(profile.bgTop));
  background.addColorStop(1, hsla(profile.bgBottom));
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const orbs = [
    { x: 0.24, y: 0.22, radius: 0.28, color: profile.accent, drift: 0.18 },
    { x: 0.74, y: 0.36, radius: 0.34, color: profile.glow, drift: 0.12 },
    { x: 0.56, y: 0.76, radius: 0.4, color: mixHsl(profile.glow, profile.accent, 0.45), drift: 0.16 }
  ];

  orbs.forEach((orb, index) => {
    const x = width * (orb.x + Math.sin(t * 0.08 + index) * orb.drift * 0.03);
    const y = height * (orb.y + Math.cos(t * 0.09 + index * 0.7) * orb.drift * 0.04);
    const radius = Math.min(width, height) * orb.radius;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, hsla(orb.color, 0.22));
    gradient.addColorStop(1, hsla(orb.color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  });

  ctx.restore();

  ctx.strokeStyle = hsla(profile.line, 0.05 + profile.spaciousness * 0.06);
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = height * (0.1 + i * 0.09);
    const warp = Math.sin(t * 0.14 + i * 0.7) * height * 0.014;
    ctx.beginPath();
    ctx.moveTo(0, y + warp);
    ctx.bezierCurveTo(width * 0.25, y - warp, width * 0.65, y + warp, width, y - warp);
    ctx.stroke();
  }
}

function drawSomaticShell(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: Profile
): void {
  const silhouette = bodyPath(width, height);

  ctx.save();
  ctx.fillStyle = hsla(profile.body, 0.82);
  ctx.fill(silhouette);
  ctx.strokeStyle = hsla(profile.line, 0.22 + profile.coherence * 0.1);
  ctx.lineWidth = 1.4;
  ctx.stroke(silhouette);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.shadowBlur = 48;
  ctx.shadowColor = hsla(profile.glow, 0.38);
  ctx.lineWidth = 18 * (0.5 + profile.halo * 0.6);
  ctx.strokeStyle = hsla(profile.glow, 0.08 + profile.halo * 0.12);
  ctx.stroke(silhouette);
  ctx.restore();
}

function drawBodyDepthContours(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: Profile,
  t: number
): void {
  const silhouette = bodyPath(width, height);
  const contourCount = 8;
  const centerX = width * 0.5;
  const centerY = height * 0.52;

  ctx.save();
  ctx.clip(silhouette);
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (let i = 0; i < contourCount; i += 1) {
    const depth = i / (contourCount - 1);
    const wobble = Math.sin(t * (0.14 + profile.pulseRate * 0.018) + i * 0.8) * 0.012;
    const rx = width * (0.08 + depth * 0.15 + wobble * (1 - profile.stillness));
    const ry = height * (0.12 + depth * 0.35);
    const y = centerY + height * (depth - 0.5) * 0.18;
    const color = mixHsl(profile.body, profile.line, 0.58 + depth * 0.28);

    ctx.strokeStyle = hsla(color, (0.032 + profile.halo * 0.035) * (1 - profile.emptiness * 0.45));
    ctx.lineWidth = 0.7 + profile.coherence * 0.55;
    ctx.beginPath();
    ctx.ellipse(centerX, y, rx, ry, 0, Math.PI * 0.08, Math.PI * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, y, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
  }

  const highlight = ctx.createRadialGradient(
    width * 0.43,
    height * 0.34,
    0,
    width * 0.48,
    height * 0.42,
    Math.min(width, height) * 0.28
  );
  highlight.addColorStop(0, hsla(profile.glow, 0.09 + profile.intensity * 0.035));
  highlight.addColorStop(0.52, hsla(profile.accent, 0.026 + profile.halo * 0.025));
  highlight.addColorStop(1, hsla(profile.glow, 0));
  ctx.fillStyle = highlight;
  ctx.fillRect(width * 0.18, height * 0.08, width * 0.64, height * 0.68);

  ctx.restore();
}

function reactionDiffusionLike(nx: number, ny: number, t: number, profile: Profile, coupling: number): number {
  const coarse = fbm(
    nx * (5.2 + profile.coherence * 2.4) + t * (0.07 + profile.turbulence * 0.08),
    ny * (5.8 + profile.pulseRate * 0.08) - t * 0.05,
    4
  );
  const fine = fbm(
    nx * (11.5 - profile.stillness * 3.5) - t * (0.11 + profile.pulseRate * 0.012),
    ny * (11 + profile.symmetry * 1.8) + t * 0.09,
    3
  );
  const cellular = clamp(1 - Math.abs(coarse - fine) * 2.35);
  const pulse =
    0.5 +
    0.5 *
      Math.sin(
        (coarse * 7.6 - fine * 5.1 + coupling * 4.4 + t * (0.16 + profile.pulseRate * 0.045)) *
          Math.PI
      );
  const ridge = smoothstep(0.34, 0.58, cellular) * (1 - smoothstep(0.68, 0.9, cellular));
  return clamp(ridge * (0.5 + pulse * 0.75));
}

function tactileEnvelope(nx: number, ny: number, t: number, profile: Profile): number {
  const centerBias = Math.exp(-((nx - 0.5) ** 2 * 14 + (ny - 0.39) ** 2 * 11));
  const wholeBody = bodyCoreMask(nx, ny);
  const wave =
    0.5 +
    0.5 *
      Math.sin(
        (ny * (8 - profile.stillness * 4.4) +
          fbm(nx * 9 + t * 0.08, ny * 7 - t * 0.07, 3) * 1.6 -
          t * (0.8 + profile.pulseRate * 0.15)) *
          Math.PI
      );

  const ignition = smoothstep(0.28, 0.82, profile.turbulence) * centerBias;
  const laminar = smoothstep(0.44, 0.78, profile.stillness) * wave * wholeBody;
  const uniform = smoothstep(0.72, 0.94, profile.stillness) * wholeBody;

  return clamp(ignition * 0.78 + laminar * 0.44 + uniform * 0.36);
}

function drawTactileSignatures(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile
): void {
  const seedCount = Math.round(120 + profile.turbulence * 180 + profile.intensity * 80 - profile.stillness * 90);
  const prickleBias = smoothstep(0.34, 0.8, profile.turbulence) * (1 - smoothstep(0.34, 0.8, profile.stillness));
  const pressureBias = smoothstep(0.26, 0.72, profile.stillness);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (let i = 0; i < seedCount; i += 1) {
    const u = hash2(i + 2.1, 4.7);
    const v = hash2(i + 3.4, 8.2);
    const nx = mix(0.25, 0.75, u);
    const ny = mix(0.08, 0.96, v);
    const core = bodyCoreMask(nx, ny);

    if (core < 0.06) {
      continue;
    }

    const envelope = tactileEnvelope(nx, ny, t + i * 0.003, profile) * core;
    const field = sampleField(nx, ny, t + i * 0.01, profile, bodyNodes, true);
    const ignitionPulse =
      0.5 +
      0.5 *
        Math.sin(
          t * (profile.pulseRate * 1.15 + 1.2) +
            field.energy * 9.5 +
            hash2(i, 1.3) * Math.PI * 2
        );
    const onset = smoothstep(0.58, 0.94, ignitionPulse);
    const alpha = clamp(envelope * (0.055 + profile.intensity * 0.08) * (0.45 + onset * prickleBias));

    if (alpha < 0.018) {
      continue;
    }

    const x = nx * width;
    const y = ny * height;
    const color = mixHsl(profile.accent, profile.glow, pressureBias * 0.55 + onset * prickleBias * 0.22);

    if (prickleBias > pressureBias * 0.85 && hash2(i, 7.9) > 0.34) {
      const length = 2.4 + onset * 7.5 + profile.turbulence * 3;
      ctx.strokeStyle = hsla(color, alpha * 1.6);
      ctx.lineWidth = 0.5 + onset * 0.8;
      ctx.beginPath();
      ctx.moveTo(x - field.vx * length * 0.4, y - field.vy * length * 0.4);
      ctx.lineTo(x + field.vx * length, y + field.vy * length);
      ctx.stroke();
    } else {
      const radius = 1.6 + pressureBias * 5.5 + envelope * 3.2;
      ctx.strokeStyle = hsla(color, alpha);
      ctx.lineWidth = 0.65 + pressureBias * 1.1;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.55, radius * 0.52, Math.atan2(field.vy, field.vx), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function pickWeightedNodeIndex(seed: number, weights: number[]): number {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let target = hash2(seed, 9.7) * totalWeight;

  for (let i = 0; i < weights.length; i += 1) {
    target -= weights[i] ?? 1;
    if (target <= 0) {
      return i;
    }
  }

  return weights.length - 1;
}

function drawOrganicMembrane(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile
): void {
  const step = 9;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let y = step * 0.5; y < height; y += step) {
    for (let x = step * 0.5; x < width; x += step) {
      const nx = x / width;
      const ny = y / height;
      const core = bodyCoreMask(nx, ny);

      if (core < 0.08) {
        continue;
      }

      const field = sampleField(nx, ny, t * 0.72, profile, bodyNodes, true);
      const pattern = reactionDiffusionLike(nx, ny, t, profile, field.energy);
      const membrane =
        pattern *
        core *
        (0.35 + field.energy * 0.9) *
        (0.42 + profile.intensity * 0.52) *
        (1 - profile.stillness * 0.18);

      if (membrane < 0.16) {
        continue;
      }

      const color = mixHsl(profile.accent, profile.glow, 0.28 + pattern * 0.44);
      const angle = Math.atan2(field.vy, field.vx);
      const radius = 0.7 + membrane * 2.4;
      const alpha = clamp(membrane * 0.22, 0.04, 0.22);

      ctx.fillStyle = hsla(color, alpha);
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.8, radius * 0.9, angle, 0, Math.PI * 2);
      ctx.fill();

      if (membrane > 0.28 && hash2(x * 0.05, y * 0.05) > 0.56) {
        ctx.strokeStyle = hsla(mixHsl(profile.glow, profile.line, 0.45), alpha * 0.9);
        ctx.lineWidth = 0.5 + membrane * 0.7;
        ctx.beginPath();
        ctx.moveTo(x - field.vx * radius * 2.2, y - field.vy * radius * 2.2);
        ctx.lineTo(x + field.vx * radius * 2.5, y + field.vy * radius * 2.5);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

function drawSyncedFireflies(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile
): void {
  const seedCount = Math.max(
    48,
    Math.round(36 + profile.intensity * 92 + profile.coherence * 38 - profile.stillness * 18)
  );
  const syncStrength = 0.18 + profile.coherence * 0.78;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (let i = 0; i < seedCount; i += 1) {
    const nodeIndex = pickWeightedNodeIndex(i + 0.37, profile.nodeWeights);
    const anchor = bodyNodes[nodeIndex] ?? bodyNodes[2];
    const orbitalPhase = hash2(i + 0.83, 1.9) * Math.PI * 2;
    const localPhase = hash2(i + 0.41, 5.6) * Math.PI * 2;
    const orbitRadius = mix(0.012, 0.08, hash2(i + 0.15, 2.6)) * (0.82 - profile.stillness * 0.28);
    const lateralJitter = (hash2(i + 0.72, 8.1) - 0.5) * 0.08 * (1.08 - profile.coherence * 0.38);
    const verticalJitter = (hash2(i + 0.91, 4.4) - 0.5) * 0.12 * (1.02 - profile.coherence * 0.32);
    const orbitRate = mix(0.55, 1.45, hash2(i + 0.28, 7.2)) * (0.48 + profile.pulseRate * 0.12);

    let nx =
      anchor.x +
      Math.cos(t * orbitRate + orbitalPhase) * orbitRadius +
      lateralJitter;
    let ny =
      anchor.y +
      Math.sin(t * (orbitRate * 0.84) + orbitalPhase * 1.2) * orbitRadius * 1.35 +
      verticalJitter;

    nx = clamp(nx, 0.18, 0.82);
    ny = clamp(ny, 0.06, 0.98);

    const aura = auraMask(nx, ny);
    if (aura < 0.045) {
      continue;
    }

    const field = sampleField(nx, ny, t * 0.96 + i * 0.013, profile, bodyNodes, true);
    const naturalPhase = localPhase + t * (0.4 + hash2(i + 0.64, 3.7) * 0.7) * Math.PI * 2;
    const coupledPhase =
      t * (0.75 + profile.pulseRate * 0.18) * Math.PI * 2 +
      field.energy * 8.6 +
      nodeIndex * 0.42;
    const phase = mix(naturalPhase, coupledPhase, syncStrength);
    const pulse = 0.5 + 0.5 * Math.sin(phase);
    const flash = smoothstep(0.74 - profile.coherence * 0.12, 0.985, pulse);
    const glow = flash * aura * (0.4 + field.energy * 0.9) * (1 - profile.emptiness * 0.45);

    if (glow < 0.035) {
      continue;
    }

    const x = nx * width;
    const y = ny * height;
    const color = mixHsl(profile.glow, profile.accent, 0.24 + flash * 0.56);
    const radius = 0.55 + glow * (2 + profile.intensity * 1.8);
    const alpha = clamp(glow * (0.16 + profile.intensity * 0.16), 0.03, 0.22);
    const tail = (2.2 + flash * 6.5) * (0.7 + profile.lineLength * 0.42);

    ctx.fillStyle = hsla(color, alpha);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (glow > 0.07) {
      ctx.strokeStyle = hsla(mixHsl(profile.line, profile.glow, 0.62), alpha * 0.85);
      ctx.lineWidth = 0.45 + glow * 0.95;
      ctx.beginPath();
      ctx.moveTo(x - field.vx * tail * 0.65, y - field.vy * tail * 0.65);
      ctx.lineTo(x + field.vx * tail, y + field.vy * tail);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawFieldMesh(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  showBody: boolean
): void {
  const nodes = showBody ? bodyNodes : spaceNodes;
  const step = showBody ? 12 : 16;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let y = step * 0.5; y < height; y += step) {
    for (let x = step * 0.5; x < width; x += step) {
      const nx = x / width;
      const ny = y / height;
      const mask = showBody ? auraMask(nx, ny) : 1;
      if (mask < 0.04) {
        continue;
      }

      const field = sampleField(nx, ny, t, profile, nodes, showBody);
      const brightness = field.energy * mask;

      if (brightness < (showBody ? 0.085 : 0.05)) {
        continue;
      }

      const color = mixHsl(profile.glow, profile.accent, hash2(x * 0.1, y * 0.1));
      const radius = (showBody ? 1.2 : 0.9) + brightness * (showBody ? 1.9 : 1.5);

      ctx.fillStyle = hsla(color, clamp(brightness * (showBody ? 0.34 : 0.22)));
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawFlowLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  showBody: boolean
): void {
  const nodes = showBody ? bodyNodes : spaceNodes;
  const seedCount = showBody ? 340 : 260;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (let i = 0; i < seedCount; i += 1) {
    const u = hash2(i + 0.13, 1.7);
    const v = hash2(i + 0.27, 9.3);
    let px = width * (showBody ? mix(0.28, 0.72, u) : u);
    let py = height * (showBody ? mix(0.08, 0.96, v) : v);

    if (showBody && auraMask(px / width, py / height) < 0.04) {
      continue;
    }

    const tint = mixHsl(profile.line, profile.glow, hash2(i, 3.8));
    const widthScale = 0.35 + hash2(i, 6.2) * 0.9;
    const trajectory = new Path2D();
    let alpha = 0;
    let moved = false;

    for (let step = 0; step < 15; step += 1) {
      const nx = px / width;
      const ny = py / height;
      const mask = showBody ? auraMask(nx, ny) : 1;

      if (mask < 0.04) {
        break;
      }

      const field = sampleField(nx, ny, t + step * 0.03, profile, nodes, showBody);
      const length = (showBody ? 14 : 18) * profile.lineLength * (0.45 + field.energy * 0.9);

      if (!moved) {
        trajectory.moveTo(px, py);
        moved = true;
      }

      px += field.vx * length;
      py += field.vy * length;
      trajectory.lineTo(px, py);
      alpha += field.energy * 0.05 * mask;
    }

    if (!moved) {
      continue;
    }

    ctx.strokeStyle = hsla(tint, clamp(alpha, 0.02, showBody ? 0.22 : 0.18));
    ctx.lineWidth = widthScale * (showBody ? 1.3 : 1.0) * (1 - profile.stillness * 0.42);
    ctx.stroke(trajectory);
  }

  ctx.restore();
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: Profile,
  showBody: boolean
): void {
  const nodes = showBody ? bodyNodes : spaceNodes;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  nodes.forEach((node, index) => {
    const radius = (showBody ? 24 : 42) * (0.45 + (profile.nodeWeights[index] ?? 1) * 0.45);
    const x = node.x * width;
    const y = node.y * height;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const nodeColor = mixHsl(profile.glow, profile.accent, index % 2 === 0 ? 0.2 : 0.55);
    gradient.addColorStop(0, hsla(nodeColor, showBody ? 0.18 : 0.12));
    gradient.addColorStop(1, hsla(nodeColor, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawFormlessStructures(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile
): void {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = hsla(profile.line, 0.06 + profile.spaciousness * 0.06);
  ctx.lineWidth = 1;

  for (let i = 0; i < 8; i += 1) {
    const radius = Math.min(width, height) * (0.12 + i * 0.075 + Math.sin(t * 0.08 + i) * 0.01);
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.5, radius * 1.2, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (profile.reflexivity > 0.3) {
    const mirrorCount = 5;
    for (let i = 0; i < mirrorCount; i += 1) {
      const radius = Math.min(width, height) * (0.075 + i * 0.052);
      const shear = Math.sin(t * 0.06 + i * 0.9) * profile.reflexivity * 0.18;
      ctx.strokeStyle = hsla(profile.glow, 0.055 + profile.reflexivity * 0.075 - i * 0.009);
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.5, radius * (1 + shear), radius * (1 - shear * 0.45), shear, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const lensAlpha = (0.025 + profile.spaciousness * 0.028 + profile.reflexivity * 0.04) * (1 - profile.thinness * 0.48);
  ctx.lineCap = "round";

  for (let i = 0; i < 44; i += 1) {
    const side = i % 4;
    const along = (i / 11) % 1;
    const edgeOffset = hash2(i, 11.2) * 0.22;
    let x =
      side === 0
        ? width * edgeOffset
        : side === 1
          ? width * (1 - edgeOffset)
          : width * along;
    let y =
      side === 2
        ? height * edgeOffset
        : side === 3
          ? height * (1 - edgeOffset)
          : height * along;
    const path = new Path2D();
    const hue = mixHsl(profile.line, profile.glow, hash2(i, 3.3));
    let moved = false;
    let alpha = lensAlpha;

    for (let step = 0; step < 22; step += 1) {
      const nx = x / width;
      const ny = y / height;
      const field = sampleField(nx, ny, t * 0.72 + step * 0.025, profile, spaceNodes, false);
      const radialDistance = Math.hypot(nx - 0.5, ny - 0.5);
      const reentry = profile.reflexivity * Math.sin(radialDistance * 14 - t * 0.2 + i * 0.36);
      const tangentX = -(ny - 0.5);
      const tangentY = nx - 0.5;
      const length = (9 + profile.lineLength * 15) * (0.75 + field.energy * 1.2) * (1 - profile.emptiness * 0.18);

      if (!moved) {
        path.moveTo(x, y);
        moved = true;
      }

      x += (field.vx + tangentX * reentry * 0.9) * length;
      y += (field.vy + tangentY * reentry * 0.9) * length;
      path.lineTo(x, y);
      alpha += field.energy * 0.018;

      if (x < -width * 0.08 || x > width * 1.08 || y < -height * 0.08 || y > height * 1.08) {
        break;
      }
    }

    ctx.strokeStyle = hsla(hue, clamp(alpha, 0.015, 0.16));
    ctx.lineWidth = 0.55 + profile.reflexivity * 0.75 + profile.spaciousness * 0.35;
    ctx.stroke(path);
  }

  if (profile.emptiness > 0.25) {
    ctx.globalCompositeOperation = "destination-out";
    const hole = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, Math.min(width, height) * 0.24);
    hole.addColorStop(0, `rgba(0, 0, 0, ${clamp(profile.emptiness * 0.9)})`);
    hole.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = hole;
    ctx.fillRect(width * 0.18, height * 0.12, width * 0.64, height * 0.76);
  }

  ctx.restore();
}

function drawInductionGuide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile
): void {
  const breath = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.5);
  const x = width * 0.5;
  const y = height * 0.24;
  const ring = 20 + breath * 26;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = hsla(profile.accent, 0.22);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(x, y, ring, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBreathContours(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  const breath = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.5);
  const anchors = [
    { x: 0.5, y: 0.16, scale: 0.8 },
    { x: 0.5, y: 0.3, scale: 1.05 }
  ];

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = hsla(profile.line, (0.12 + breath * 0.1) * overlay);
  ctx.lineWidth = 1.6 + overlay * 0.4;

  anchors.forEach((anchor, index) => {
    const base = Math.min(width, height) * 0.04 * anchor.scale;

    for (let ring = 0; ring < 3; ring += 1) {
      const radius = base + ring * 18 + breath * 10 + index * 4;
      ctx.beginPath();
      ctx.ellipse(
        width * anchor.x,
        height * anchor.y,
        radius * 1.15,
        radius * 0.72,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  });

  ctx.restore();
}

function drawBodyScanBands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  const silhouette = bodyPath(width, height);
  const sweep = (0.14 + (t * 0.085) % 0.92) * height;

  ctx.save();
  ctx.clip(silhouette);
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 5; i += 1) {
    const y = sweep - i * height * 0.16;
    const bandHeight = height * (0.08 + i * 0.012);
    const gradient = ctx.createLinearGradient(0, y - bandHeight, 0, y + bandHeight);
    const bandColor = mixHsl(profile.accent, profile.glow, i * 0.18);

    gradient.addColorStop(0, hsla(bandColor, 0));
    gradient.addColorStop(0.5, hsla(bandColor, (0.08 + profile.intensity * 0.1 - i * 0.01) * overlay));
    gradient.addColorStop(1, hsla(bandColor, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(width * 0.18, y - bandHeight, width * 0.64, bandHeight * 2);
  }

  ctx.restore();
}

function drawHeartBloom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  const breath = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.78);
  const x = width * 0.5;
  const y = height * 0.39;
  const radius = Math.min(width, height) * (0.08 + breath * 0.04);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const heartGlow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.8);
  heartGlow.addColorStop(0, hsla(profile.accent, (0.22 + breath * 0.12) * overlay));
  heartGlow.addColorStop(0.45, hsla(profile.glow, 0.12 * overlay));
  heartGlow.addColorStop(1, hsla(profile.glow, 0));
  ctx.fillStyle = heartGlow;
  ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8);

  ctx.strokeStyle = hsla(mixHsl(profile.accent, profile.line, 0.36), (0.16 + breath * 0.08) * overlay);
  ctx.lineWidth = 1.2 + overlay * 0.5;
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2 + t * 0.08;
    const outer = radius * (2.1 + (i % 2) * 0.55 + breath * 0.35);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer * 0.9);
    ctx.stroke();
  }

  ctx.restore();
}

function drawOpenVeil(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 9; i += 1) {
    const x = width * (0.1 + i * 0.1);
    const y = height * (0.22 + Math.sin(t * 0.08 + i * 0.9) * 0.06 + i * 0.04);
    const radiusX = width * (0.16 + (i % 3) * 0.05);
    const radiusY = height * (0.06 + (i % 2) * 0.03);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
    const veilColor = mixHsl(profile.glow, profile.accent, i % 2 === 0 ? 0.24 : 0.58);
    gradient.addColorStop(0, hsla(veilColor, (0.05 + profile.spaciousness * 0.04) * overlay));
    gradient.addColorStop(1, hsla(veilColor, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, i * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPauseGate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  const breath = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.5);
  const pause = 1 - smoothstep(0.42, 0.78, Math.abs(breath - 0.5) * 2);
  const x = width * 0.5;
  const upper = height * 0.19;
  const lower = height * 0.32;
  const radius = Math.min(width, height) * (0.035 + pause * 0.025);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = hsla(profile.accent, (0.12 + pause * 0.16) * overlay);
  ctx.lineWidth = 1.2 + pause * 1.6;

  for (const y of [upper, lower]) {
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.55, radius * 0.82, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(x, upper + radius * 0.78);
  ctx.bezierCurveTo(x - width * 0.035, height * 0.24, x + width * 0.035, height * 0.27, x, lower - radius * 0.78);
  ctx.stroke();
  ctx.restore();
}

function drawLotusPetals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  const x = width * 0.5;
  const y = height * 0.39;
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.62);
  const base = Math.min(width, height) * (0.055 + pulse * 0.018);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = hsla(mixHsl(profile.accent, profile.glow, 0.35), (0.13 + pulse * 0.08) * overlay);
  ctx.fillStyle = hsla(profile.accent, (0.035 + pulse * 0.035) * overlay);
  ctx.lineWidth = 1.2 + overlay * 0.4;

  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2 + t * 0.035;
    const px = x + Math.cos(angle) * base * 0.72;
    const py = y + Math.sin(angle) * base * 0.52;

    ctx.beginPath();
    ctx.ellipse(px, py, base * 0.38, base * (0.9 + pulse * 0.25), angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawBodySpaceWindows(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  const silhouette = bodyPath(width, height);

  ctx.save();
  ctx.clip(silhouette);
  ctx.globalCompositeOperation = "destination-out";

  for (let i = 0; i < 7; i += 1) {
    const nx = 0.5 + Math.sin(i * 1.7) * 0.085;
    const ny = 0.18 + i * 0.105;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.18 + i * 0.8);
    const rx = width * (0.035 + pulse * 0.012);
    const ry = height * (0.05 + pulse * 0.018);
    const gradient = ctx.createRadialGradient(nx * width, ny * height, 0, nx * width, ny * height, Math.max(rx, ry) * 1.8);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${0.16 * overlay})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(nx * width, ny * height, rx, ry, i * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = hsla(profile.line, 0.06 * overlay);
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = height * (0.24 + i * 0.12);
    ctx.beginPath();
    ctx.moveTo(width * 0.34, y);
    ctx.bezierCurveTo(width * 0.42, y - height * 0.035, width * 0.58, y + height * 0.035, width * 0.66, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRecognitionGlints(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  profile: Profile,
  overlay = 1
): void {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (let i = 0; i < 72; i += 1) {
    const nx = hash2(i, 12.3);
    const ny = hash2(i + 0.4, 17.9);
    const field = sampleField(nx, ny, t * 0.44 + i * 0.01, profile, spaceNodes, false);
    const pulse = smoothstep(0.62, 0.98, 0.5 + 0.5 * Math.sin(t * 0.42 + i * 1.37 + field.energy * 5));

    if (pulse < 0.08) {
      continue;
    }

    const x = nx * width;
    const y = ny * height;
    const length = (3 + pulse * 10) * overlay;
    const color = mixHsl(profile.glow, profile.accent, hash2(i, 4.2));
    ctx.strokeStyle = hsla(color, clamp(pulse * (0.04 + profile.reflexivity * 0.05) * overlay, 0, 0.13));
    ctx.lineWidth = 0.5 + pulse * 0.7;
    ctx.beginPath();
    ctx.moveTo(x - field.vx * length, y - field.vy * length);
    ctx.lineTo(x + field.vx * length, y + field.vy * length);
    ctx.stroke();
  }

  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number, profile: Profile, t: number): void {
  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.46, Math.min(width, height) * 0.2, width * 0.5, height * 0.5, Math.min(width, height) * 0.72);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(0, 0, 0, ${0.35 + profile.thinness * 0.14})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let i = 0; i < 120; i += 1) {
    const x = hash2(i, 2.1) * width;
    const y = hash2(i, 6.7) * height;
    const radius = 0.4 + fbm(i * 0.2, t * 0.1, 2) * 0.8;
    ctx.globalAlpha = 0.02 + hash2(i, 4.6) * 0.05;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderTimeline(
  ctx: CanvasRenderingContext2D,
  env: RenderEnv,
  timeline: ProfileSegment[],
  showBody: boolean,
  mode: "competition" | "induction"
): void {
  const time = clamp(env.t, 0, timeline[timeline.length - 1].end);
  const segment = getSegmentAtTime(timeline, time);
  const profile = applyLabProfile(
    applySegmentEnvelope(interpolateTimeline(timeline, time), segment, time, showBody),
    env.lab
  );

  drawBackdrop(ctx, env.width, env.height, profile, time);

  if (showBody) {
    drawSomaticShell(ctx, env.width, env.height, profile);
    drawBodyDepthContours(ctx, env.width, env.height, profile, time);
    drawOrganicMembrane(ctx, env.width, env.height, time, profile);
    drawTactileSignatures(ctx, env.width, env.height, time, profile);
  } else {
    drawFormlessStructures(ctx, env.width, env.height, time, profile);
  }

  drawFieldMesh(ctx, env.width, env.height, time, profile, showBody);
  drawFlowLines(ctx, env.width, env.height, time, profile, showBody);
  if (showBody) {
    drawSyncedFireflies(ctx, env.width, env.height, time, profile);
  }
  drawNodes(ctx, env.width, env.height, profile, showBody);

  if (mode === "induction") {
    drawInductionGuide(ctx, env.width, env.height, time, profile);
  }

  drawVignette(ctx, env.width, env.height, profile, time);
}

function renderMeditationAtlas(ctx: CanvasRenderingContext2D, env: RenderEnv): void {
  const time = clamp(env.t, 0, atlasTimeline[atlasTimeline.length - 1].end);
  const segment = getSegmentAtTime(atlasTimeline, time);
  const showBody = time < 18;
  const profile = applyLabProfile(
    applySegmentEnvelope(interpolateTimeline(atlasTimeline, time), segment, time, showBody),
    env.lab
  );
  const overlay = env.lab.overlay;

  drawBackdrop(ctx, env.width, env.height, profile, time);

  if (showBody) {
    drawSomaticShell(ctx, env.width, env.height, profile);
    drawBodyDepthContours(ctx, env.width, env.height, profile, time);
    drawOrganicMembrane(ctx, env.width, env.height, time, profile);
    drawTactileSignatures(ctx, env.width, env.height, time, profile);
  } else {
    drawFormlessStructures(ctx, env.width, env.height, time, profile);
  }

  drawFieldMesh(ctx, env.width, env.height, time, profile, showBody);
  drawFlowLines(ctx, env.width, env.height, time, profile, showBody);

  if (segment.label === "Grounding Breath") {
    drawBreathContours(ctx, env.width, env.height, time, profile, overlay);
  }

  if (segment.label === "Body Scan River") {
    drawBodyScanBands(ctx, env.width, env.height, time, profile, overlay);
  }

  if (segment.label === "Metta Hearth") {
    drawHeartBloom(ctx, env.width, env.height, time, profile, overlay);
  }

  if (segment.label === "Open Sky") {
    drawOpenVeil(ctx, env.width, env.height, time, profile, overlay);
  }

  if (showBody) {
    drawSyncedFireflies(ctx, env.width, env.height, time, profile);
  }

  drawNodes(ctx, env.width, env.height, profile, showBody);
  drawVignette(ctx, env.width, env.height, profile, time);
}

function renderTantricRecognitionAtlas(ctx: CanvasRenderingContext2D, env: RenderEnv): void {
  const time = clamp(env.t, 0, tantricAtlasTimeline[tantricAtlasTimeline.length - 1].end);
  const segment = getSegmentAtTime(tantricAtlasTimeline, time);
  const showBody = time < 18;
  const profile = applyLabProfile(
    applySegmentEnvelope(interpolateTimeline(tantricAtlasTimeline, time), segment, time, showBody),
    env.lab
  );
  const overlay = env.lab.overlay;

  drawBackdrop(ctx, env.width, env.height, profile, time);

  if (showBody) {
    drawSomaticShell(ctx, env.width, env.height, profile);
    drawBodyDepthContours(ctx, env.width, env.height, profile, time);
    drawOrganicMembrane(ctx, env.width, env.height, time, profile);
    drawTactileSignatures(ctx, env.width, env.height, time, profile);
  } else {
    drawFormlessStructures(ctx, env.width, env.height, time, profile);
  }

  drawFieldMesh(ctx, env.width, env.height, time, profile, showBody);
  drawFlowLines(ctx, env.width, env.height, time, profile, showBody);

  if (segment.label === "Breath Pause") {
    drawBreathContours(ctx, env.width, env.height, time, profile, overlay);
    drawPauseGate(ctx, env.width, env.height, time, profile, overlay);
  }

  if (segment.label === "Heart Lotus") {
    drawHeartBloom(ctx, env.width, env.height, time, profile, overlay);
    drawLotusPetals(ctx, env.width, env.height, time, profile, overlay);
  }

  if (segment.label === "Space In The Body") {
    drawOpenVeil(ctx, env.width, env.height, time, profile, overlay * 0.8);
    drawBodySpaceWindows(ctx, env.width, env.height, time, profile, overlay);
  }

  if (segment.label === "Recognition Field") {
    drawOpenVeil(ctx, env.width, env.height, time, profile, overlay);
    drawRecognitionGlints(ctx, env.width, env.height, time, profile, overlay);
  }

  if (showBody) {
    drawSyncedFireflies(ctx, env.width, env.height, time, profile);
  }

  drawNodes(ctx, env.width, env.height, profile, showBody);
  drawVignette(ctx, env.width, env.height, profile, time);
}

export const entries: Entry[] = [
  {
    id: "somatic-arc",
    title: "Entry 1: Somatic Arc",
    summary:
      "A body-based oscillator study for J1-J4. The internal field shifts from corrugated rapture to bright resonance, then cool placidity, then uniform equanimity.",
    duration: SOMATIC_DURATION,
    tags: "jhana 1 (0:00-0:06), jhana 2 (0:06-0:12), jhana 3 (0:12-0:18), jhana 4 (0:18-0:24)",
    segments: somaticTimeline,
    render: (ctx, env) => renderTimeline(ctx, env, somaticTimeline, true, "competition")
  },
  {
    id: "formless-mirror",
    title: "Entry 2: Formless Mirror",
    summary:
      "A spatial-field study for J5-J8. The image stops behaving like a body and starts behaving like openness, reflexivity, nothing-to-grasp, and near-evanescence.",
    duration: FORMLESS_DURATION,
    tags: "jhana 5 (0:00-0:06), jhana 6 (0:06-0:12), jhana 7 (0:12-0:18), jhana 8 (0:18-0:24)",
    segments: formlessTimeline,
    render: (ctx, env) => renderTimeline(ctx, env, formlessTimeline, false, "competition")
  },
  {
    id: "induction-lantern",
    title: "Entry 3: Induction Lantern",
    summary:
      "A gentler honorable-mention concept that behaves like a concentration aid: collect the breath, invite the pleasant field, and let it lock in.",
    duration: INDUCTION_DURATION,
    tags: "induction aid / honorable mention candidate (0:00-0:18)",
    segments: inductionTimeline,
    render: (ctx, env) => renderTimeline(ctx, env, inductionTimeline, true, "induction")
  },
  {
    id: "meditation-atlas",
    title: "Study 4: Meditation Atlas",
    summary:
      "A general-purpose meditation sketchbook: grounding breath, body scan, metta warmth, and open awareness as reusable visual motifs rather than contest-locked claims.",
    duration: ATLAS_DURATION,
    tags: "grounding breath (0:00-0:06), body scan river (0:06-0:12), metta hearth (0:12-0:18), open sky (0:18-0:24)",
    segments: atlasTimeline,
    render: renderMeditationAtlas
  },
  {
    id: "tantric-recognition-atlas",
    title: "Study 5: Tantric Recognition Atlas",
    summary:
      "A nondual Shaiva Tantra / VBT-flavored sketchbook: breath pause, heart-lotus embodiment, space in the body, and recognition as an open field.",
    duration: TANTRIC_ATLAS_DURATION,
    tags: "breath pause (0:00-0:06), heart lotus (0:06-0:12), space in the body (0:12-0:18), recognition field (0:18-0:24)",
    segments: tantricAtlasTimeline,
    render: renderTantricRecognitionAtlas
  }
];

export const entryMap = new Map(entries.map((entry) => [entry.id, entry]));

export function resolveEntry(id?: string | null): Entry {
  return entryMap.get(id ?? "") ?? entries[0];
}

export function getSegmentLabel(entry: Entry, t: number): Segment {
  return getSegmentAtTime(entry.segments, clamp(t, 0, entry.duration));
}
