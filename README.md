# Jhana Energy Lab

Working repo for one set of entries to the [QRI Jhana Visualization Competition 2026](https://qri.org/blog/jhana-contest).

This repo is built around three candidate submissions:

- `Entry 1: Somatic Arc` for J1-J4, with an explicit body avatar and energy-body volume.
- `Entry 2: Formless Mirror` for J5-J8, where the image stops behaving like a body and starts behaving like a field.
- `Entry 3: Induction Lantern`, an honorable-mention attempt for the induction-aid category.

The app is a deterministic canvas sketchbook so the same scenes can be explored interactively and exported to MP4.

## New In This Pass

- Added a dated research memo in `docs/research-run-2026-03-25.md`
- Installed a wider local toolchain for image assembly and 3D look-dev
- Added `three`, `lil-gui`, `sharp`, and GLSL support to the repo
- Added contact-sheet generation scripts for quick review boards

## Newer Passes

- `docs/research-run-2026-03-29.md`: public-entry sweep plus the membrane/firefly direction
- `docs/research-run-2026-04-01.md`: QRI-source design grammar focused on tactile modalities, resonance, ADSR, and attention field lines
- `scripts/extract-stills.mjs`: reproducible still extraction from the latest preview MP4s
- `scripts/refresh-entry.mjs`: one-command rerender + still extraction + board refresh

## Competition Constraints We Are Building Around

- Deadline: June 4, 2026 at 10:00 PM Pacific.
- Up to 3 videos per participant.
- Each video can be up to 2 minutes long.
- J1-J4 should include an avatar/body reference.
- Judges care mostly about phenomenal character, attention dynamics, energy-body volume, and clear time-tagging.
- The written explanation is 25% of the score, so each entry here has an accompanying draft description.

Source links:

- [Call for submissions](https://qri.org/blog/jhana-contest)
- [Competition announcement / encouragement post](https://andrsgmezemilsson.substack.com/p/qris-jhana-visualization-competition)

## Repo Layout

- `src/`: interactive visualizer and deterministic renderer
- `scripts/render-entry.mjs`: headless Chrome + `ffmpeg` export path
- `scripts/extract-stills.mjs`: pulls standard review stills from preview MP4s
- `scripts/refresh-entry.mjs`: rerender + stills + board in one pass
- `scripts/make-contact-sheet.mjs`: turns stills into review boards
- `scripts/blender_smoke.py`: minimal Blender smoke render
- `docs/competition-notes.md`: distilled brief from the contest page
- `docs/research-run-2026-03-25.md`: broad tool/workflow research pass
- `docs/research-run-2026-04-01.md`: QRI-sourced design grammar for tactile and attention motifs
- `docs/prompt-bank.md`: starter prompts for external image/video tools
- `docs/local-tooling.md`: local install notes and useful commands
- `docs/submission-checklist.md`: final pre-submit pass for videos and writeups
- `docs/judging-cues.md`: quick phenomenology checks for reviewing each segment
- `docs/entry-01-somatic-arc.md`: visual and technical plan for J1-J4
- `docs/entry-02-formless-mirror.md`: plan for J5-J8
- `docs/entry-03-induction-lantern.md`: honorable-mention concept
- `docs/submission-drafts/`: draft writeups to personalize before submitting

## Local Use

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Render Commands

```bash
npm run render:somatic
npm run render:formless
npm run render:induction
npm run stills:somatic
npm run stills:formless
npm run stills:induction
npm run board:somatic
npm run board:formless
npm run board:induction
npm run refresh:somatic
npm run refresh:formless
npm run refresh:induction
```

Defaults are `960x540` at `12fps` for quick previews. The render script also accepts:

```bash
node scripts/render-entry.mjs somatic-arc 1920 1080 24
```

And the all-in-one refresh path is:

```bash
node scripts/refresh-entry.mjs somatic-arc 1920 1080 24
```

## Important Note Before Submission

The visuals and explanations already aim at the contest rubric, but the method paragraphs in the draft writeups still need your own first-person detail. The contest explicitly rewards methodological context, so those sections should reflect your actual meditation route rather than generic language.
