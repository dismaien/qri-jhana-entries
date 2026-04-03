import process from "node:process";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173/";

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
  }
];

for (const target of targets) {
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
