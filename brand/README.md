# Vibrolux — identità visiva

The visual identity for Vibrolux, built on the method Yuri Roga used for
[T1 Energy](https://yuriroga.com/work/t1-energy): the material isolated like a
specimen, the technical sheet, the product in studio light. Here they become
**Materia** (the finishing media), **Specs** (the brochure's numbers, drawn)
and **Luce** (the same part rough and mirror-bright). Open
[`index.html`](index.html) through a local server to see the whole system and
where each piece goes on the site:

```bash
python3 -m http.server 5191   # from the repository root, then /brand/index.html
```

## What's where

```
brand/blender/common.py       studio, render settings, materials, mesh helpers
brand/blender/materia.py      corindone, chips, sfere, microsfere, granulato
brand/blender/vibratore.py    the vibratory bowl: beauty, exploded lines, the loop
brand/blender/ingranaggio.py  the gear split prima | dopo, the turned shaft
brand/blender/lavaggio.py     water beading on oiled steel, the basket of the lavaggio statico
brand/compose/compose.mjs     lays renders and drawings out as posters and plates
brand/compose/drawings.mjs    the Specs drawings and the signature line, as SVG
brand/render-all.sh           everything, in order
brand/renders/                raw renders and loop frames (not in git)
public/assets/identity/       the deliverables the site uses
```

`public/assets/identity/`:

- `posters/` — 4:5, 1600 × 2000, with the two labels: brochure, social, decks.
- `plates/` — the same pictures without labels, for the site's cards and heroes
  (the site writes its own text, in both languages), plus two 16:9 heroes.
  `plates/en/` holds the Specs drawings with their words in English, for `/en`.
- `svg/` — the Specs drawings as vectors, and `profilo*.svg`, the signature line.
- `video/` — `vibratore-loop.mp4`, an 8 s seamless loop for the home hero, and
  its first frame.

## Regenerating

```bash
sh brand/render-all.sh            # all renders and the video side by side, then the posters (~2 h on a dual-core laptop)
sh brand/render-all.sh stills     # or: video, compose
sh brand/render-all.sh compose    # posters and plates only, from the renders already there
node brand/compose/compose.mjs specs   # only the ids that contain "specs"
```

Blender 3.4 or later (Cycles on CPU; Eevee for the exploded lines and the loop),
ffmpeg, and Node with Playwright — `compose.mjs` takes Playwright from the
project or from `_research/`, and falls back to the system Chrome.

## Rules of the system

- Backgrounds are only **Nero** `#0F0E12` or **Carta** `#F0EFE9`.
- **Blu Vibrolux** `#21406E` is the mark and the machines' bases. **Arancio PU**
  `#F55A0A`, sampled from the bowls' polyurethane lining in the brochure
  photos, appears once per picture and always marks the result.
- Two labels per poster, always in the same place: mark + subject at the top,
  ■ + Chivo Mono at the bottom. Geist Light for numbers and titles.
- Only real numbers: those in the brochure and the ISO certificate.

## To confirm with Vibrolux

The brochure names ceramic inserts, vegetable granulate, hot air and
"microsfere"; it doesn't name the blasting grit or the burnishing media.
Corindone (sabbiatura) and the steel balls (brillantatura) are the usual
choices, shown as such — check them before the posters are captioned in print.
