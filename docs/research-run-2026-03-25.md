# Research Run: 2026-03-25

This memo captures a broad tool and workflow pass for the QRI Jhana Visualization Competition as of March 25, 2026.

## What The Competition Actually Rewards

The official call makes a few things unusually explicit:

- The visualization counts for about 75% of the score and the written explanation for about 25%.
- J1-J4 must include a body/avatar reference.
- J5-J8 can be much more creative and abstract.
- QRI explicitly calls out attention dynamics, frequency/coupling/synchronization, and the energy body as important dimensions.
- Each video can contain multiple time-tagged jhana segments and transitions are part of the overall-contribution value proposition.

Sources:

- [QRI call for submissions](https://qri.org/blog/jhana-contest)
- [QRI announcement post](https://andrsgmezemilsson.substack.com/p/qris-jhana-visualization-competition)

## Best Tool Categories Right Now

### 1. Procedural / controllable base layer

Best for: actual phenomenology work, transitions, repeatability, and body-aware field design.

- This repo itself is already a good foundation for field dynamics because it is deterministic and exportable.
- QRI's own [Oscilleditor](https://qri.org/oscilleditor/) is especially relevant conceptually. Their reference manual describes the coupled-oscillator effect as a pixel grid of Kuramoto oscillators with tunable synchronization, anti-synchronization, cross-layer coupling, log-polar transforms, and ring-shaped coupling kernels. That is almost perfectly aligned with the contest's language about phase coherence and coupling.
- Blender is a strong local complement because it gives us a way to build actual 3D body volumes, glow shells, volumetric fog, and camera-controlled transitions.

Why this matters:

- It gives us legible control over "how energy moves" rather than asking a video model to invent internal structure.
- It is the best path for J1-J4, where the body reference and internal volume matter.

Sources:

- [QRI Oscilleditor manual](https://qri.org/oscilleditor/doc/reference-manual)

### 2. AI still-image generation and editing

Best for: generating polished hero frames, style directions, and look-dev branches once the phenomenology grammar is chosen.

- Black Forest Labs positions [FLUX.2](https://docs.bfl.ai/quick_start/introduction) as its most powerful image generation and editing family, with multi-reference image editing and support for up to 10 references. That is unusually good for keeping identity, palette, and object continuity across exploratory stills.
- Runway's [Gen-4 Image References](https://help.runwayml.com/hc/en-us/articles/40042718905875-Creating-with-Gen-4-Image-References) supports one to three references, tagging reference images for reuse, and sketch-guided control.
- OpenAI's [Sora image creation](https://help.openai.com/en/articles/10877094) is useful if you want quick image branches that can then flow directly into video.
- Google Flow's [model guide](https://support.google.com/flow/answer/16352836?hl=en&ref_topic=16908930) lists Nano Banana 2, Nano Banana Pro, and Imagen 4 for creating frames and ingredients.

Recommendation:

- Use AI image tools after the field logic is already clear.
- The better the procedural base or reference board, the more useful these models become.

### 3. AI video generation / transformation

Best for: turning strong keyframes into more polished shots, adding camera feel, and trying alternate motion grammars quickly.

- Runway's [Aleph workflow](https://help.runwayml.com/hc/en-us/articles/44609246167059-Controlling-Aleph-edits-with-a-Reference-Image) is especially strong for controlled edits: edit a first frame with Gen-4 References, then drive video from that frame so the video starts on the exact edited image.
- Google Flow's [model/features page](https://support.google.com/flow/answer/16352836?hl=en&ref_topic=16908930) says Veo 3.1 supports text-to-video, first-frame and first+last-frame video, ingredients-to-video, extend, and object insertion/removal, with audio generation available experimentally on Veo 3.1.
- OpenAI's [Sora video editor docs](https://help.openai.com/en/articles/9957612-generating-videos-on-sora) describe storyboard-based second-by-second planning, image/video uploads into cards, remix/blend/re-cut, and videos up to 20 seconds in the Sora Video Editor. OpenAI's [Sora app/web article](https://help.openai.com/en/articles/12460853-creating-videos-with-sora) notes storyboard-driven 25-second web videos for Pro users and stitching up to 60 seconds.

Recommendation:

- For this contest, AI video tools are best used as a finishing or branching layer, not the source of truth.
- The strongest workflow is usually: build or render key images first, then animate or stylize from those anchors.

## Best Overall Workflow For This Competition

### A. Strongest "accuracy-first" route

1. Build the dynamics procedurally in this repo or in Blender.
2. Render a small number of clean anchor frames and short preview clips.
3. Use FLUX.2 / Runway References / Sora Images / Flow image tools for look-dev branches and polish.
4. Use Runway Aleph or Flow frames-to-video to test whether the anchors can be transformed into a stronger final aesthetic without losing the phenomenology.
5. Keep the final submission honest: if a segment is heavily stylized, the writeup should still explain what each visual feature is supposed to encode.

### B. Strongest "overall contribution" route

The contest's overall prize also rewards transitions, so a single piece that moves cleanly through several jhanas is a real opportunity. The best candidate in this repo is still:

- `Somatic Arc` for J1-J4 transitions
- `Formless Mirror` for J5-J8 transitions

If one unified video is attempted later, it should probably bridge J4 into J5 explicitly, because that boundary is conceptually rich and visually distinctive.

### C. Strongest "honorable mention" route

For the induction-aid category, utility matters more than strict replication. Sora storyboard, Flow frames, and Runway Aleph are all useful here because a guided concentration piece benefits from pacing, camera rhythm, and editable sequencing.

## Tool Ranking By Likely Value

### Highest value right now

1. This repo's procedural engine plus export path.
2. Blender for body volume, camera movement, and spatial energy-body work.
3. FLUX.2 for consistent look-dev stills.
4. Runway Gen-4 References plus Aleph for controlled frame-to-video editing.
5. Google Flow for ingredients/frames workflows and audio-capable Veo branches.
6. Sora for storyboard-driven sequencing and fast alternate cuts.

### Useful references, not necessarily primary production tools

- [Symmetric Vision](https://www.symmetric-vision.xyz/) for altered-state replication aesthetics and 3D/VR/VFX precedent.
- [QRI Tracer Replication Tool article](https://qri.org/blog/psychophysics-toolkit) for how QRI thinks about phenomenology replication more generally.

## What I Would Actually Do Next

### Immediate

- Push `Somatic Arc` toward more body-volume richness with either Blender renders or a Three.js/WebGL scene.
- Generate stronger style boards for J1-J4 and J5-J8 separately.
- Keep the induction-aid piece as a side track, not the main bet.

### Near-term experiments

- Test a Blender body-shell with internal emissive nodes and aura fog.
- Create a FLUX.2 or Runway reference board from the best stills already rendered in this repo.
- Run one Runway Aleph or Flow first-frame animation pass on a polished J1 or J5 keyframe.
- Draft one unified transition concept just for `J4 -> J5`.

## Bottom Line

The best path is not "pick one AI model and hope." It is:

- procedural phenomenology core
- AI still-image look development
- AI video finishing / branching

That stack gives the most control, the best contest fit, and the best chance that the final work still feels like a model of meditation energy rather than generic AI spectacle.
