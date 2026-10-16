// The vector half of the identity: technical drawings in the manner of T1's "Specs" sheets,
// drawn from Vibrolux's own numbers (brochure, pp. 4–5, 8–9, 18–21 and the back cover).
// Every drawing returns { html: the overlay for the poster, svg: the drawing alone, for the site }.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ───────────── helpers ─────────────
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;
const pts = (a) => a.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** A roughness trace: a few octaves of sines plus grain, peaks a little sharpened. Values in [-1, 1]. */
export function roughness(n, seed = 7) {
  const r = rng(seed);
  const comps = [
    [180, 0.55],
    [97, 0.8],
    [53, 0.6],
    [29, 0.45],
    [13, 0.3],
    [7, 0.2],
  ].map(([p, a]) => [p, a, r() * Math.PI * 2]);
  const out = [];
  for (let i = 0; i < n; i++) {
    let y = comps.reduce((s, [p, a, ph]) => s + a * Math.sin((2 * Math.PI * i) / p + ph), 0) + (r() - 0.5) * 0.35;
    out.push(Math.sign(y) * Math.pow(Math.abs(y), 0.85));
  }
  const m = Math.max(...out.map(Math.abs));
  return out.map((y) => y / m);
}

const text = (x, y, s, { size = 15, anchor = 'start', mono = true, weight, fill, ls, rotate } = {}) =>
  `<text x="${f(x)}" y="${f(y)}" font-size="${size}" text-anchor="${anchor}" fill="${fill ?? 'currentColor'}" stroke="none" ` +
  `${rotate ? `transform="rotate(${rotate} ${f(x)} ${f(y)})"` : ''} ` +
  `style="font-family:${mono ? "var(--font-secondary,'Chivo Mono'),'Chivo Mono',monospace" : "var(--font-primary,Geist),Geist,Helvetica,sans-serif"};` +
  `font-weight:${weight ?? (mono ? 460 : 320)};${mono ? `letter-spacing:${ls ?? 0.06}em;text-transform:uppercase;` : `letter-spacing:${ls ?? -0.01}em;`}">${s}</text>`;

function svg(W, H, ink, body, { standalone = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" stroke="${ink}" ` +
    `stroke-linecap="round" stroke-linejoin="round" style="${standalone ? '' : 'position:absolute;inset:0;'}color:${ink}">` +
    body +
    `</svg>`;
}

/** Dimension line with architect's ticks; the label sits beside it. */
function dim(x1, y1, x2, y2, label, side = -1) {
  const vertical = x1 === x2;
  const t = 9;
  const tick = (x, y) => `<line x1="${x - t}" y1="${y + t}" x2="${x + t}" y2="${y - t}" stroke-width="1.6"/>`;
  const ext = vertical
    ? `<line x1="${x1 - 14}" y1="${y1}" x2="${x1 + 14}" y2="${y1}" stroke-width="1"/><line x1="${x2 - 14}" y1="${y2}" x2="${x2 + 14}" y2="${y2}" stroke-width="1"/>`
    : `<line x1="${x1}" y1="${y1 - 14}" x2="${x1}" y2="${y1 + 14}" stroke-width="1"/><line x1="${x2}" y1="${y2 - 14}" x2="${x2}" y2="${y2 + 14}" stroke-width="1"/>`;
  const lbl = vertical
    ? text(x1 + side * -26, (y1 + y2) / 2, label, { size: 30, mono: false, anchor: 'middle', rotate: -90 })
    : text((x1 + x2) / 2, y1 + side * 22, label, { size: 30, mono: false, anchor: 'middle' });
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="1.2"/>${tick(x1, y1)}${tick(x2, y2)}${ext}${lbl}`;
}

// ───────────── the drawings ─────────────
// Each takes { lang }: 'it' for the posters and the Italian site, 'en' for the plates under /en.
const tr = (lang) => (it, en) => (lang === 'en' ? en : it);

export const drawings = {
  /** Tribofinitura isotropica: the same profile before and after — Ra 0,01 (brochure p. 18). */
  rugosita({ W, H, T, ink, lang }) {
    const L = tr(lang);
    const x0 = 160;
    const x1 = W - 160;
    const n = x1 - x0;
    const raw = roughness(Math.ceil(n / 2) + 1, 11);
    const trace = (cy, amp, k = 1) => raw.map((y, i) => [x0 + i * 2, cy + y * amp * k]);
    const hatch = `<defs><pattern id="h" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke-width="1" stroke-opacity="0.45"/></pattern></defs>`;
    const panel = (cy, amp, n0, title, after) => {
      const tr = trace(cy, amp);
      const area = [...tr, [x1, cy], [x0, cy]];
      const ticks = Array.from({ length: Math.floor(n / 40) + 1 }, (_, i) => {
        const x = x0 + i * 40;
        const big = i % 5 === 0;
        return `<line x1="${x}" y1="${cy + 150}" x2="${x}" y2="${cy + 150 - (big ? 14 : 6)}" stroke-width="1"/>`;
      }).join('');
      return (
        text(x0, cy - 170, n0, { size: 16 }) +
        text(x0 + 56, cy - 170, title, { size: 16 }) +
        `<line x1="${x0}" y1="${cy + 150}" x2="${x1}" y2="${cy + 150}" stroke-width="1"/>${ticks}` +
        `<line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" stroke-width="1" stroke-dasharray="2 7"/>` +
        (after
          ? `<polyline points="${pts(tr)}" stroke="${T.arancio}" stroke-width="3"/>` +
            text(x1, cy - 40, L('Ra 0,01', 'Ra 0.01'), { size: 76, mono: false, anchor: 'end', weight: 280 })
          : `<polygon points="${pts(area)}" fill="url(#h)" stroke="none"/><polyline points="${pts(tr)}" stroke-width="2"/>`) +
        text(x1, cy + 182, after ? L('linea media · scarto ≤ 0,01', 'mean line · deviation ≤ 0.01') : L('linea media', 'mean line'), { size: 13, anchor: 'end' })
      );
    };
    const body =
      hatch +
      panel(700, 118, '01', L('Prima del trattamento', 'Before treatment')) +
      panel(1290, 0.9, '02', L('Dopo il trattamento', 'After treatment'), true) +
      text(x0, H - 250, L('Processo ottenuto tramite vibrofinitura, assolutamente non aggressivo:', 'Obtained by vibratory finishing, entirely non-aggressive:'), { size: 22, mono: false }) +
      text(x0, H - 218, L('rugosità molto basse e superfici molto lucide.', 'very low roughness and very bright surfaces.'), { size: 22, mono: false });
    return { html: svg(W, H, ink, body), svg: svg(W, H, ink, body, { standalone: true }) };
  },

  /** La sede: 3500 m², 2000 coperti, 1500 scoperti, 400 di magazzino (brochure p. 5). */
  sede({ W, H, T, ink, lang }) {
    const L = tr(lang);
    const s = 11.2;
    const c30 = Math.cos(Math.PI / 6);
    const cx = W / 2;
    const cy = 880;
    const iso = (x, y, z = 0) => [cx + (x - 35 - (y - 25)) * c30 * s, cy + (x - 35 + (y - 25)) * 0.5 * s - z * s];
    const P = (...a) => pts(a.map((p) => iso(...p)));
    const h = 9;
    const bg = T.carta;
    // windows: a ribbon on both front faces
    const ribbon = (face) => {
      let out = '';
      for (let i = 0; i < (face === 'x' ? 10 : 8); i++) {
        const a = 2 + i * 5;
        const b = a + 3.6;
        out +=
          face === 'x'
            ? `<polygon points="${P([a, 40, 5.4], [b, 40, 5.4], [b, 40, 7.4], [a, 40, 7.4])}" stroke-width="1"/>`
            : `<polygon points="${P([50, a, 5.4], [50, b, 5.4], [50, b, 7.4], [50, a, 7.4])}" stroke-width="1"/>`;
      }
      return out;
    };
    // the warehouse corner of the roof, hatched
    let roofHatch = '';
    for (let k = 1; k < 20; k++) roofHatch += `<line x1="${f(iso(k, 0, h)[0])}" y1="${f(iso(k, 0, h)[1])}" x2="${f(iso(0, k, h)[0])}" y2="${f(iso(0, k, h)[1])}" stroke-width="0.9" stroke-opacity="0.6"/>`;
    for (let k = 1; k < 20; k++) roofHatch += `<line x1="${f(iso(20, k, h)[0])}" y1="${f(iso(20, k, h)[1])}" x2="${f(iso(k, 20, h)[0])}" y2="${f(iso(k, 20, h)[1])}" stroke-width="0.9" stroke-opacity="0.6"/>`;
    // parking stripes in the open area along x = 50..70
    let stripes = '';
    for (let y = 6; y < 48; y += 3.2) stripes += `<line x1="${f(iso(58, y)[0])}" y1="${f(iso(58, y)[1])}" x2="${f(iso(66, y)[0])}" y2="${f(iso(66, y)[1])}" stroke-width="1" stroke-opacity="0.55"/>`;
    const marker = (p, n) => {
      const [x, y] = iso(...p);
      return `<circle cx="${f(x)}" cy="${f(y)}" r="17" fill="${bg}" stroke-width="1.2"/>` + text(x, y + 5, n, { size: 13, anchor: 'middle' });
    };
    const rows = [
      ['01', '3500 m²', L('superficie complessiva', 'total area')],
      ['02', '2000 m²', L('fabbricati: lavorazioni, stoccaggio, uffici', 'buildings: processing, storage, offices')],
      ['03', '1500 m²', L('aree scoperte: movimentazione e logistica', 'open areas: handling and logistics')],
      ['04', '400 m²', L('magazzino per lo stoccaggio', 'warehouse for storage')],
    ];
    const table = rows
      .map(([n, v, l], i) => {
        const y = 1430 + i * 92;
        return (
          `<line x1="160" y1="${y - 56}" x2="${W - 160}" y2="${y - 56}" stroke-width="1" stroke-opacity="0.35"/>` +
          text(160, y, n, { size: 14 }) +
          text(230, y + 6, v, { size: 46, mono: false, weight: 280 }) +
          text(560, y, l, { size: 15 })
        );
      })
      .join('');
    const body =
      `<polygon points="${P([0, 0], [70, 0], [70, 50], [0, 50])}" stroke-width="1.2" stroke-dasharray="3 7"/>` +
      stripes +
      // building: top, then the two front faces (filled, so the plot line behind disappears)
      `<polygon points="${P([50, 0, 0], [50, 40, 0], [50, 40, h], [50, 0, h])}" fill="${bg}" stroke-width="1.8"/>` +
      `<polygon points="${P([0, 40, 0], [50, 40, 0], [50, 40, h], [0, 40, h])}" fill="${bg}" stroke-width="1.8"/>` +
      `<polygon points="${P([0, 0, h], [50, 0, h], [50, 40, h], [0, 40, h])}" fill="${bg}" stroke-width="1.8"/>` +
      `<polyline points="${P([20, 0, h], [20, 20, h], [0, 20, h])}" stroke-width="1.4"/>` +
      roofHatch +
      ribbon('x') +
      ribbon('y') +
      // loading doors on the long front
      `<polygon points="${P([28, 40, 0], [33, 40, 0], [33, 40, 4.5], [28, 40, 4.5])}" stroke-width="1.2"/>` +
      `<polygon points="${P([36, 40, 0], [41, 40, 0], [41, 40, 4.5], [36, 40, 4.5])}" stroke-width="1.2"/>` +
      marker([70, 50, 0], '01') +
      marker([30, 20, h], '02') +
      marker([62, 28, 0], '03') +
      marker([10, 10, h], '04') +
      text(iso(0, 50)[0] - 30, iso(0, 50)[1] + 100, '45.09064° N · 7.37769° E', { size: 13, anchor: 'middle' }) +
      table;
    return { html: svg(W, H, ink, body), svg: svg(W, H, ink, body, { standalone: true }) };
  },

  /** Sabbiatrice a grappolo: parts hung on a cluster, up to 1300 × 1800 mm (brochure p. 9). */
  grappolo({ W, H, T, ink, lang }) {
    const L = tr(lang);
    const k = 0.5; // px per mm
    const ew = 1300 * k;
    const eh = 1800 * k;
    const ex = (W - ew) / 2;
    const ey = 470;
    const cx = W / 2;
    const bg = T.carta;
    const part = (x, y, r, i) => {
      // a turned bushing seen face-on: two circles and, every other one, four slots
      let p = `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${bg}" stroke-width="1.6"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.46)}" stroke-width="1.2"/>`;
      if (i % 2)
        for (let q = 0; q < 4; q++) {
          const a = (q * Math.PI) / 2 + Math.PI / 4;
          p += `<line x1="${f(x + Math.cos(a) * r * 0.62)}" y1="${f(y + Math.sin(a) * r * 0.62)}" x2="${f(x + Math.cos(a) * r * 0.84)}" y2="${f(y + Math.sin(a) * r * 0.84)}" stroke-width="1.2"/>`;
        }
      return p;
    };
    let body = '';
    // rail and hook above the envelope
    body += `<line x1="${cx - 260}" y1="${ey - 70}" x2="${cx + 260}" y2="${ey - 70}" stroke-width="2"/>`;
    body += `<path d="M${cx} ${ey - 70} v26 a14 14 0 1 0 14 14" stroke-width="2"/>`;
    body += `<line x1="${cx}" y1="${ey - 16}" x2="${cx}" y2="${ey + eh - 60}" stroke-width="2.4"/>`;
    // five arms, both sides, parts on hooks
    let pi = 0;
    for (let a = 0; a < 5; a++) {
      const y = ey + 90 + a * 165;
      const reach = 250 - a * 6;
      body += `<line x1="${cx - reach}" y1="${y}" x2="${cx + reach}" y2="${y}" stroke-width="2"/>`;
      for (const side of [-1, 1]) {
        for (let j = 0; j < 3; j++) {
          const hx = cx + side * (70 + j * ((reach - 70) / 2.2));
          const r = 30 - a * 1.2 + (j === 1 ? 4 : 0);
          body += `<line x1="${f(hx)}" y1="${y}" x2="${f(hx)}" y2="${f(y + 26)}" stroke-width="1.4"/>`;
          body += part(hx, y + 26 + r, r, pi++);
        }
      }
    }
    // the envelope and its dimensions
    body += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" stroke-width="1.2" stroke-dasharray="10 8"/>`;
    body += dim(ex, ey + eh + 70, ex + ew, ey + eh + 70, '1300', 1.6);
    body += dim(ex + ew + 70, ey, ex + ew + 70, ey + eh, '1800', -1);
    body += text(ex + ew + 120, ey + eh + 102, 'mm', { size: 13 });
    body += text(160, H - 250, L('Ingombro massimo mm 1300 × 1800,', 'Maximum envelope 1300 × 1800 mm,'), { size: 22, mono: false });
    body += text(160, H - 218, L('anche per materiale delicato.', 'delicate material included.'), { size: 22, mono: false });
    return { html: svg(W, H, ink, body), svg: svg(W, H, ink, body, { standalone: true }) };
  },

  /** Qualità: a dial gauge reading zero — the measuring instruments behind ISO 9001:2015 (brochure p. 5, back cover). */
  qualita({ W, H, T, ink, lang }) {
    const L = tr(lang);
    const cx = W / 2;
    const cy = 900;
    const R = 430;
    let body = `<circle cx="${cx}" cy="${cy}" r="${R + 40}" stroke-width="1.2" stroke-opacity="0.5"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="${R}" stroke-width="2"/>`;
    for (let i = 0; i < 100; i++) {
      const a = (i / 100) * Math.PI * 2 - Math.PI / 2;
      const l = i % 10 === 0 ? 46 : i % 5 === 0 ? 30 : 16;
      const sw = i % 10 === 0 ? 2.2 : 1.1;
      body += `<line x1="${f(cx + Math.cos(a) * R)}" y1="${f(cy + Math.sin(a) * R)}" x2="${f(cx + Math.cos(a) * (R - l))}" y2="${f(cy + Math.sin(a) * (R - l))}" stroke-width="${sw}"/>`;
      if (i % 10 === 0) {
        const v = i <= 50 ? i : 100 - i;
        body += text(cx + Math.cos(a) * (R - 92), cy + Math.sin(a) * (R - 92) + 10, String(v), { size: 28, mono: false, anchor: 'middle', weight: 300 });
      }
    }
    body += `<circle cx="${cx}" cy="${cy}" r="${R * 0.22}" stroke-width="1" stroke-opacity="0.5"/>`;
    // the needle on zero, in the accent
    body += `<line x1="${cx}" y1="${cy + 70}" x2="${cx}" y2="${cy - R + 24}" stroke="${T.arancio}" stroke-width="5"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="22" fill="${T.arancio}" stroke="none"/>`;
    body += text(cx, cy + R * 0.42, L('0,01 mm', '0.01 mm'), { size: 14, anchor: 'middle' });
    body += text(cx, 1560, 'ISO 9001:2015', { size: 96, mono: false, anchor: 'middle', weight: 260 });
    body += text(cx, 1630, L('Certificato N° 9190.VILU · IMQ', 'Certificate No. 9190.VILU · IMQ'), { size: 15, anchor: 'middle' });
    body += text(cx, 1720, L('Strumenti di misura e verifica per gli standard', 'Measuring and testing instruments for the quality'), { size: 22, mono: false, anchor: 'middle' });
    body += text(cx, 1752, L('qualitativi richiesti da ciascun cliente.', 'standards each customer requires.'), { size: 22, mono: false, anchor: 'middle' });
    return { html: svg(W, H, ink, body), svg: svg(W, H, ink, body, { standalone: true }) };
  },

  /** The exploded vibrator (Freestyle lines from Blender) with its five parts called out. */
  vibratore({ W, H, ink, renders, lang }) {
    const L = tr(lang);
    const file = join(renders, 'specs-vibratore.json');
    const at = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
    const names = [
      ['rivestimento', L('Rivestimento in PU', 'PU lining')],
      ['vasca', L('Vasca', 'Bowl')],
      ['molle', L('Molle', 'Springs')],
      ['motore', L('Motovibratore', 'Vibratory motor')],
      ['basamento', L('Basamento', 'Base')],
    ];
    const lx = 1250;
    let body = '';
    names.forEach(([k, label], i) => {
      if (!at[k]) return;
      const x = at[k][0] * W;
      const y = at[k][1] * H;
      body += `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${ink}" stroke="none"/>`;
      body += `<line x1="${f(x + 10)}" y1="${f(y)}" x2="${lx - 16}" y2="${f(y)}" stroke-width="1"/>`;
      body += text(lx, y - 4, String(i + 1).padStart(2, '0'), { size: 13 });
      body += text(lx, y + 26, label, { size: 24, mono: false });
    });
    return { html: svg(W, H, ink, body), plate: '', svg: null };
  },
};

/** The signature: one measured line that goes from rough to flat, left to right — "il profilo". */
export function profilo({ w = 1600, h = 160, ink = '#322D2A', accent = '#F55A0A', animated = false } = {}) {
  const raw = roughness(Math.ceil(w / 2) + 1, 11);
  const cy = h / 2;
  const tr = raw.map((y, i) => {
    const x = i * 2;
    const env = 1 - smooth(0.32, 0.72, x / w) * 0.985;
    return [x, cy + y * (h * 0.42) * env];
  });
  const split = tr.findIndex(([x]) => x >= w * 0.72);
  const rough = tr.slice(0, split + 1);
  const flat = tr.slice(split);
  const len = Math.round(w * 2.2);
  const anim = animated
    ? `<style>.p{stroke-dasharray:${len};stroke-dashoffset:${len};animation:draw 2.4s cubic-bezier(.42,0,0,1) forwards}.q{animation-delay:1.1s;animation-duration:1.6s}@keyframes draw{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.p{animation:none;stroke-dashoffset:0}}</style>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    anim +
    `<polyline class="p" points="${pts(rough)}" stroke="${ink}" stroke-width="2"/>` +
    `<polyline class="p q" points="${pts(flat)}" stroke="${accent}" stroke-width="3"/>` +
    `</svg>`
  );
}
