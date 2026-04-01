# Research Run: 2026-04-01

Focused follow-up memo based on QRI's own visualization and phenomenology writing.

## Source Set

- [QRI call for submissions](https://qri.org/blog/jhana-contest), published March 16, 2026
- [QRI announcement post by Andrés Gómez-Emilsson](https://andrsgmezemilsson.substack.com/p/qris-jhana-visualization-competition), published March 19, 2026
- [Visualizing Tactile Sensations](https://qri.org/blog/visualizing-tactile-sensations), published December 28, 2023
- [On Attention as the Management of Electromagnetic Field Lines](https://qri.org/blog/attention-field-lines), published December 8, 2024
- [Nonlinear Wave Computing: Vibes, Gestalts, and Realms](https://qri.org/blog/nonlinear-wave-computing), published July 30, 2022
- [Quantifying Bliss](https://qri.org/blog/quantifying-bliss), published June 18, 2017

## What Matters Most

The official competition brief is narrower than it first appears:

- J1-J4 need a body reference.
- Judges care primarily about phenomenal character, not symbolism.
- The body entries should convey internal volume and "energy body", not merely edge outlines.
- The written explanation is important, but the image still carries most of the score.

That means the most useful external research is not generic meditation writing. It is QRI's own work on tactile imagery, resonant attention, and valence-relevant wave structure.

## Actionable Visual Levers

### 1. Frequency Is A Good Proxy For Arousal

In [Visualizing Tactile Sensations](https://qri.org/blog/visualizing-tactile-sensations), QRI reports that higher temporal frequencies tend to read as more intense and less pleasant, while lower-frequency thorax-wide waves tend to read as calmer and more pleasant.

Practical implication:

- J1 can afford faster, more electric flicker.
- J2 should still feel energized, but more synchronized than chaotic.
- J3 and J4 should progressively slow down and smooth out.
- Induction visuals should bias toward slower, chest-centered wave motion rather than sharp sparkle.

### 2. Symmetry And Consonance Help Pleasantness

Both [Visualizing Tactile Sensations](https://qri.org/blog/visualizing-tactile-sensations) and [Quantifying Bliss](https://qri.org/blog/quantifying-bliss) point toward a common heuristic: symmetric, consonant, low-noise relationships tend to read as more pleasant than fragmented, beating, or anti-symmetrical ones.

Practical implication:

- use coherence as a first-class visual parameter, not just intensity
- let J2 and J4 look more globally phase-aligned than J1
- reserve shear, blockage, reflectors, and local de-phasing for unpleasant or unstable transitions

### 3. ADSR Matters, Not Just Pattern

In [Nonlinear Wave Computing](https://qri.org/blog/nonlinear-wave-computing), Andrés repeatedly emphasizes the attack/decay/sustain/release envelope of a vibe.

Practical implication:

- friendly states should bloom and fade, not punch
- induction visuals should use soft onset and release
- if a pulse looks right spatially but still feels harsh, the envelope is likely wrong

### 4. Attention Should Behave Like Weighted Resonant Modes

In [Attention Field Lines](https://qri.org/blog/attention-field-lines), attention is framed less like a spotlight and more like a pattern emerging from weighted resonant modes with specific phase relations.

Practical implication:

- flow lines should feel like the result of changing weights and phase, not a literal laser beam
- sudden qualitative changes in attention can be shown by small shifts in mode balance
- for the formless entries, the field itself can become the subject

### 5. Tactile Modalities Give A Better Design Vocabulary

One especially useful section in [Visualizing Tactile Sensations](https://qri.org/blog/visualizing-tactile-sensations) proposes simple tactile categories such as waves, pins, needles, and prickles.

Practical implication:

- J1: prickles, sparks, chest/head ignition, corrugated tension
- J2: waves plus coherent fireflies, less serrated than J1
- J3: broad low-frequency laminar bands, fewer sharp puncta
- J4: very low-frequency, uniform membrane with minimal local insistence

## Repo Direction After This Pass

The current canvas renderer is on a better path after the membrane and firefly updates, but the research suggests the next improvements should be:

1. give `Somatic Arc` a more explicit ADSR envelope per jhana rather than only changing static parameter blends
2. add a small set of tactile modality toggles such as `waves`, `prickles`, and `heat bloom`
3. make `Formless Mirror` transitions more phase-relationship driven and less node-driven
4. eventually replace the 2D avatar with a more volumetric body container

## Workflow Consequence

This memo also made it obvious that faster iteration matters. We need to be able to:

- rerender
- extract review stills
- rebuild the board

without ad-hoc terminal commands each time. So this research pass should pair naturally with a preview-refresh script in the repo.
