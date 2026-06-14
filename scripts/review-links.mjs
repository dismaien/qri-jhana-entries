import process from "node:process";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173/";
const targetArg = process.argv[3] ?? "all";

const targets = [
  {
    id: "somatic-arc",
    frames: [
      { label: "J1 onset", time: 3 },
      { label: "J2 settling", time: 9 },
      { label: "J3 coherence", time: 15 },
      { label: "J4 quiet", time: 21 }
    ]
  },
  {
    id: "formless-mirror",
    frames: [
      { label: "J5 spaciousness", time: 3 },
      { label: "J6 attenuation", time: 9 },
      { label: "J7 flattening", time: 15 },
      { label: "J8 near-null", time: 21 }
    ]
  },
  {
    id: "induction-lantern",
    frames: [{ label: "Mid-sequence", time: 9 }]
  },
  {
    id: "meditation-atlas",
    frames: [
      { label: "Grounding Breath", time: 3 },
      { label: "Body Scan River", time: 9 },
      { label: "Metta Hearth", time: 15 },
      { label: "Open Sky", time: 21 }
    ]
  },
  {
    id: "tantric-recognition-atlas",
    frames: [
      { label: "Breath Pause", time: 3 },
      { label: "Heart Lotus", time: 9 },
      { label: "Space In The Body", time: 15 },
      { label: "Recognition Field", time: 21 }
    ]
  }
];

const selectedTargets = targetArg === "all" ? targets : targets.filter((target) => target.id === targetArg);

if (selectedTargets.length === 0) {
  throw new Error(`Unknown review-link target: ${targetArg}`);
}

for (const target of selectedTargets) {
  console.log(target.id);

  for (const frame of target.frames) {
    const url = new URL(baseUrl);
    url.searchParams.set("entry", target.id);
    url.searchParams.set("t", String(frame.time));
    url.searchParams.set("play", "0");
    url.searchParams.set("chrome", "0");

    console.log(`  ${frame.label}: ${url.toString()}`);
  }
}
