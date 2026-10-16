// Lays the renders and the vector drawings out as Vibrolux identity posters, in the grammar of T1's:
// the mark and a subject at the top, a square and a mono label at the bottom, nothing else.
//
//   node brand/compose/compose.mjs            → public/assets/identity/{posters,plates,svg}
//
// Needs Playwright (Chromium). It is looked up in the project, then in _research/.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { drawings, profilo } from './drawings.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RENDERS = join(ROOT, 'brand', 'renders');
const OUT = join(ROOT, 'public', 'assets', 'identity');

let chromium;
for (const base of [ROOT, join(ROOT, '_research')]) {
  try {
    ({ chromium } = createRequire(join(base, 'package.json'))('playwright'));
    break;
  } catch {}
}
if (!chromium) throw new Error('Playwright not found: npm i -D playwright (or keep _research/ installed)');

// ───────────── Tokens (the same as app/globals.css, plus Arancio) ─────────────
export const T = {
  nero: '#0F0E12',
  carta: '#F0EFE9',
  grafite: '#322D2A',
  grigio: '#625B58',
  acciaio: '#BFB8B5',
  blu: '#21406E',
  arancio: '#F55A0A',
};

// The mark: navy circle and a white V, as on the brochure; on light pages the V gets a thin ink outline
// so its tips, which overhang the circle, don't vanish into the paper (components/logoData.ts, app/icon.svg)
const logo = readFileSync(join(ROOT, 'components', 'logoData.ts'), 'utf8');
const CIRCLE = logo.match(/CIRCLE = '([^']+)'/)[1];
const V = [...logo.matchAll(/^\s+'(M[^']+)',$/gm)].map((m) => m[1]);
export const mark = (ink, h = 30, light = ink !== T.carta) =>
  `<svg viewBox="0 0 66 50" height="${h}" style="display:block;overflow:visible"><path d="${CIRCLE}" fill="${T.blu}"/>${V.map(
    (d) => `<path d="${d}" fill="#fff"${light ? ` stroke="${T.nero}" stroke-width="1.6" paint-order="stroke"` : ''}/>`,
  ).join('')}</svg>`;

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Chivo+Mono:wght@100..900&display=block" rel="stylesheet">';

const W = 1600;
/** plates go on the web: a little lighter than the posters */
const PLATE_Q = 84;
const H = 2000;

function page({ w = W, h = H, bg, ink, img, blend, labels = true, top, bottom, overlay = '' }) {
  const bgc = T[bg];
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;background:${bgc};overflow:hidden}
  body{position:relative;color:${ink};font-family:Geist,Helvetica,sans-serif;-webkit-font-smoothing:antialiased}
  .plate{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;${blend ? 'mix-blend-mode:screen;' : ''}}
  .top{position:absolute;left:0;right:0;top:${Math.round(h * 0.038)}px;display:flex;justify-content:center;align-items:center;gap:14px;
       font-weight:340;font-size:${Math.round(w * 0.019)}px;letter-spacing:-0.01em;line-height:1}
  .bottom{position:absolute;left:0;right:0;bottom:${Math.round(h * 0.036)}px;display:flex;justify-content:center;align-items:center;gap:14px;
          font-family:'Chivo Mono',monospace;font-weight:460;font-size:${Math.round(w * 0.0105)}px;letter-spacing:0.06em;text-transform:uppercase;line-height:1}
  .sq{width:${Math.round(w * 0.0075)}px;height:${Math.round(w * 0.0075)}px;background:currentColor}
  .ov{position:absolute;inset:0}
  .mono{font-family:'Chivo Mono',monospace;font-weight:460;text-transform:uppercase;letter-spacing:0.06em}
  </style></head><body>
  ${img ? `<img class="plate" src="${pathToFileURL(img)}">` : ''}
  <div class="ov">${overlay}</div>
  ${labels && top ? `<div class="top">${mark(ink, Math.round(w * 0.019))}<span>${top}</span></div>` : ''}
  ${labels && bottom ? `<div class="bottom"><span class="sq"></span><span>${bottom}</span></div>` : ''}
  </body></html>`;
}

// ───────────── The set ─────────────
// bg: the page; renders on Nero are opaque (black floor) and get screened onto Nero, those on Carta are transparent.
const POSTERS = [
  { id: 'materia-corindone', src: 'materia-corindone', bg: 'carta', top: 'Materia', bottom: 'Corindone' },
  { id: 'materia-microsfere', src: 'materia-microsfere', bg: 'nero', top: 'Materia', bottom: 'Microsfere di vetro' },
  { id: 'materia-chips', src: 'materia-chips', bg: 'carta', top: 'Materia', bottom: 'Chips ceramici' },
  { id: 'materia-sfere', src: 'materia-sfere', bg: 'nero', top: 'Materia', bottom: 'Sfere d’acciaio' },
  { id: 'materia-granulato', src: 'materia-granulato', bg: 'carta', top: 'Materia', bottom: 'Granulato vegetale' },
  { id: 'materia-acciaio', src: 'materia-acciaio', bg: 'nero', top: 'Materia', bottom: 'Acciaio · Ra 0,01' },
  { id: 'materia-acqua', src: 'materia-acqua', bg: 'nero', top: 'Materia', bottom: 'Acqua · dewatering' },
  { id: 'lavaggio-cesto', src: 'lavaggio-cesto', bg: 'carta', top: 'Lavaggio statico', bottom: 'Particolari delicati' },
  { id: 'vibrofinitura-vibratore', src: 'hero-vibratore-45', bg: 'nero', top: 'Vibrofinitura', bottom: 'Vibratore' },
  { id: 'tribofinitura-prima-dopo', src: 'hero-ingranaggio-45', bg: 'nero', top: 'Tribofinitura', bottom: 'Prima | Dopo' },
  { id: 'specs-vibratore', src: 'specs-vibratore', bg: 'carta', top: 'Vibratore', bottom: 'Specs', draw: 'vibratore' },
  { id: 'specs-rugosita', bg: 'carta', top: 'Tribofinitura isotropica', bottom: 'Specs', draw: 'rugosita' },
  { id: 'specs-sede', bg: 'carta', top: 'Sede', bottom: 'Specs', draw: 'sede' },
  { id: 'specs-grappolo', bg: 'carta', top: 'Sabbiatrice a grappolo', bottom: 'Specs', draw: 'grappolo' },
  { id: 'specs-qualita', bg: 'nero', top: 'Qualità', bottom: 'ISO 9001:2015', draw: 'qualita' },
];

// 16:9 plates for the site's full-bleed heroes: no labels, the site writes its own.
const WIDE = [
  { id: 'vibratore-16x9', src: 'hero-vibratore', bg: 'nero' },
  { id: 'prima-dopo-16x9', src: 'hero-ingranaggio', bg: 'nero' },
];

const only = process.argv.slice(2);
const want = (id) => !only.length || only.some((o) => id.includes(o));

// Playwright's own Chromium if it is installed, the system Chrome otherwise
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const pg = await ctx.newPage();

// the page is loaded from a file, so it may read the renders (a setContent page may not)
const TMP = join(tmpdir(), 'vibrolux-poster.html');

async function shoot(html, file, w, h, quality = 90) {
  await pg.setViewportSize({ width: w, height: h });
  writeFileSync(TMP, html);
  await pg.goto(pathToFileURL(TMP).href, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(file), { recursive: true });
  await pg.screenshot({ path: file, type: 'jpeg', quality });
  console.log('→', file.replace(ROOT + '/', ''));
}

for (const p of POSTERS) {
  if (!want(p.id)) continue;
  const ink = p.bg === 'nero' ? T.carta : T.grafite;
  const img = p.src && join(RENDERS, p.src + '.png');
  if (img && !existsSync(img)) {
    console.log('skip', p.id, '(no render yet)');
    continue;
  }
  const d = p.draw ? drawings[p.draw]({ W, H, T, ink, renders: RENDERS, lang: 'it' }) : null;
  const common = { bg: p.bg, ink, img, blend: p.bg === 'nero' && p.src, top: p.top, bottom: p.bottom };
  await shoot(page({ ...common, overlay: d?.html ?? '' }), join(OUT, 'posters', p.id + '.jpg'), W, H);
  // the plate: the same picture without the labels, for the site's own cards
  await shoot(page({ ...common, labels: false, overlay: d?.plate ?? d?.html ?? '' }), join(OUT, 'plates', p.id + '.jpg'), W, H, PLATE_Q);
  // drawings carry words: the English site gets its own plate, under plates/en/
  if (p.draw) {
    const e = drawings[p.draw]({ W, H, T, ink, renders: RENDERS, lang: 'en' });
    await shoot(page({ ...common, labels: false, overlay: e.plate ?? e.html }), join(OUT, 'plates', 'en', p.id + '.jpg'), W, H, PLATE_Q);
  }
  if (d?.svg) {
    mkdirSync(join(OUT, 'svg'), { recursive: true });
    writeFileSync(join(OUT, 'svg', p.id + '.svg'), d.svg);
    console.log('→', `public/assets/identity/svg/${p.id}.svg`);
  }
}

for (const p of WIDE) {
  if (!want(p.id)) continue;
  const img = join(RENDERS, p.src + '.png');
  if (!existsSync(img)) {
    console.log('skip', p.id, '(no render yet)');
    continue;
  }
  await shoot(page({ w: 1920, h: 1080, bg: p.bg, ink: T.carta, img, blend: p.bg === 'nero', labels: false }), join(OUT, 'plates', p.id + '.jpg'), 1920, 1080, PLATE_Q);
}

// the signature line, for the site: on Carta, on Nero, and drawing itself in
if (want('profilo')) {
  mkdirSync(join(OUT, 'svg'), { recursive: true });
  writeFileSync(join(OUT, 'svg', 'profilo.svg'), profilo({ ink: T.grafite }));
  writeFileSync(join(OUT, 'svg', 'profilo-nero.svg'), profilo({ ink: T.carta }));
  writeFileSync(join(OUT, 'svg', 'profilo-animato.svg'), profilo({ ink: T.grafite, animated: true }));
  console.log('→ public/assets/identity/svg/profilo*.svg');
}

await browser.close();
rmSync(TMP, { force: true });
