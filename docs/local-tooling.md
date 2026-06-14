# Local Tooling

Installed and verified on this machine for the repo workflow:

- Google Chrome for deterministic headless browser rendering
- `ffmpeg` for MP4 assembly
- ImageMagick for image assembly and quick review tooling
- Blender for local 3D / volumetric look-dev

Repo-side packages now installed:

- `three` for richer scene and shader work when we outgrow pure 2D canvas
- `lil-gui` for parameter tweaking
- `sharp` for contact sheets and review boards
- `vite-plugin-glsl` so shader files can be added cleanly

## Useful Commands

```bash
npm run build
npm run render:somatic
npm run render:formless
npm run render:induction
npm run render:atlas
npm run render:tantra
npm run stills:somatic
npm run stills:formless
npm run stills:induction
npm run stills:atlas
npm run stills:tantra
npm run board:somatic
npm run board:formless
npm run board:induction
npm run board:atlas
npm run board:tantra
npm run refresh:somatic
npm run refresh:formless
npm run refresh:induction
npm run refresh:atlas
npm run refresh:tantra
npm run inventory:renders
npm run links:review
```

The `refresh:*` scripts are the fastest review loop because they rerender the MP4, extract the standard stills, and rebuild the contact sheet in one pass.

`npm run inventory:renders` is useful right before packaging because it quickly shows which videos, stills, and boards are present for each entry.

`npm run links:review` prints paused clean-preview URLs for the standard frame checks, which is handy when comparing notes across entries. To print one entry only, pass the base URL and entry id:

```bash
npm run links:review -- http://127.0.0.1:4173/ tantric-recognition-atlas
```

For live creative tweaking in the browser, open an entry with `?lab=1`, for example `http://127.0.0.1:4173/?entry=meditation-atlas&lab=1`.

## Blender Smoke Test

Once Blender is available in the shell, you can render a proof image with:

```bash
blender -b -P scripts/blender_smoke.py
```

This writes:

```bash
renders/blender-smoke.png
```

## Why TouchDesigner Is Not Auto-Installed Here

TouchDesigner is a very plausible tool for this competition, but I did not auto-install it because its distribution and licensing flow is different from the rest of this stack and it is less straightforward to script headlessly in this environment than Blender.
