'use client';

import { useEffect, useRef } from 'react';
import { CIRCLE, V } from './logoData';
import s from './LogoShatter.module.css';

/**
 * The Vibrolux mark comes apart and back together (after the reference loop): the logo rests; thin fragments
 * drift in from the edges and turn to face us; the mark breaks, its pieces and the visitors whirl round the centre in
 * 3D with motion blur; the mark's own pieces land back home while the visitors fly out to the edges, turn edge-on and
 * fade; the logo rests again.
 *
 * Drawn on a canvas: every piece is the real vector mark clipped to a cell (circle in brand navy, the V white with a
 * black line round it, cut edges included), pre-rendered once, then drawn with the 2D projection of its 3D rotation
 * and a perspective scale. Fast pieces are drawn several times along their path at low opacity: the motion blur.
 * Reduced motion: the still logo.
 */

// ── the mark, in its viewBox units (0 0 66 50) ──
const VB_W = 66;
const VB_H = 50;
const CX = 33.68;
const CY = 24.76;
const R = 24.76;
const R_CORE = R * 0.5;
const OUTLINE = 0.7; // black line round the white V, viewBox units
const GHOST = 0.42; // line of a piece seen as a bare outline (arriving and leaving visitors)

const LOOP = 6200; // ms, one cycle
const MARK = 0.46; // mark width, fraction of the box
const PERSPECTIVE = 2.6; // camera distance, box widths
const SHUTTER = 0.011; // fraction of the loop the motion blur covers
const BLUR_STEP = 1.2; // px between the copies of a blurred piece
const BLUR_MAX = 28;
const VISITORS = 12;

type Kind = 'circle' | 0 | 1; // 0, 1: the two strokes of the V
type Cell = { kind: Kind; cell: string };

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
const sector = (r0: number, r1: number, a0: number, a1: number) => {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  if (r0 === 0) return `M${CX} ${CY}L${pt(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${pt(r1, a1)}Z`;
  return `M${pt(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${pt(r0, a0)}Z`;
};

// few, large pieces, as in the reference: five arcs of the ring, the whole core disc, the V in four
const RING = [-110, -32, 38, 112, 180, 250];
const CELLS: Cell[] = [
  ...RING.slice(0, -1).map((a, i) => ({ kind: 'circle' as const, cell: sector(R_CORE, R + 1, rad(a), rad(RING[i + 1])) })),
  { kind: 'circle', cell: sector(0, R_CORE + 0.4, rad(0), rad(359.9)) },
  { kind: 1, cell: 'M-2 -2H40V19H-2Z' },
  { kind: 1, cell: 'M-2 19H40V52H-2Z' },
  { kind: 0, cell: 'M18 -2H68V20H18Z' },
  { kind: 0, cell: 'M18 20H68V52H18Z' },
];

// ── pre-rendered pieces ──
type Sprite = { img: HTMLCanvasElement; ghost: HTMLCanvasElement; ax: number; ay: number; w: number; h: number; cx: number; cy: number; kind: Kind };

function drawMark(ctx: CanvasRenderingContext2D, brand: string, ink: string, cell?: Path2D, kind?: Kind) {
  const circle = new Path2D(CIRCLE);
  const vs = V.map((d) => new Path2D(d));
  if (kind === undefined || kind === 'circle') {
    ctx.save();
    if (cell) ctx.clip(cell);
    ctx.fillStyle = brand;
    ctx.fill(circle);
    ctx.restore();
  }
  vs.forEach((v, i) => {
    if (kind !== undefined && kind !== i) return;
    ctx.save();
    if (cell) ctx.clip(cell);
    ctx.clip(v);
    ctx.fillStyle = '#fff';
    ctx.fill(v);
    // the line runs inside the shape: its outline, and the cut edges of the piece
    ctx.strokeStyle = ink;
    ctx.lineWidth = OUTLINE * 2;
    ctx.lineJoin = 'round';
    ctx.stroke(v);
    if (cell) ctx.stroke(cell);
    ctx.restore();
  });
}

/** the same piece as a bare outline: its edge, cut edges included, drawn inside it */
function drawGhost(ctx: CanvasRenderingContext2D, ink: string, cell: Path2D, kind: Kind) {
  const shape = new Path2D(kind === 'circle' ? CIRCLE : V[kind]);
  ctx.save();
  ctx.clip(cell);
  ctx.clip(shape);
  ctx.strokeStyle = ink;
  ctx.lineWidth = GHOST * 2;
  ctx.lineJoin = 'round';
  ctx.stroke(shape);
  ctx.stroke(cell);
  ctx.restore();
}

function makeSprites(res: number, brand: string, ink: string): Sprite[] {
  return CELLS.map(({ kind, cell }) => {
    // the whole mark area, then cropped to the ink
    const pad = 2;
    const full = document.createElement('canvas');
    full.width = Math.ceil((VB_W + pad * 2) * res);
    full.height = Math.ceil((VB_H + pad * 2) * res);
    const fx = full.getContext('2d')!;
    fx.setTransform(res, 0, 0, res, pad * res, pad * res);
    drawMark(fx, brand, ink, new Path2D(cell), kind);
    const data = fx.getImageData(0, 0, full.width, full.height).data;
    let x0 = full.width, y0 = full.height, x1 = 0, y1 = 0, sx = 0, sy = 0, n = 0;
    for (let y = 0; y < full.height; y++) {
      for (let x = 0; x < full.width; x++) {
        const a = data[(y * full.width + x) * 4 + 3];
        if (a > 8) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
          sx += x * a;
          sy += y * a;
          n += a;
        }
      }
    }
    const img = document.createElement('canvas');
    img.width = x1 - x0 + 3;
    img.height = y1 - y0 + 3;
    img.getContext('2d')!.drawImage(full, -x0 + 1, -y0 + 1);
    const ghost = document.createElement('canvas');
    ghost.width = img.width;
    ghost.height = img.height;
    const gc = ghost.getContext('2d')!;
    gc.setTransform(res, 0, 0, res, pad * res - x0 + 1, pad * res - y0 + 1);
    drawGhost(gc, ink, new Path2D(cell), kind);
    const gx = sx / n, gy = sy / n; // centre of mass, in pixels of `full`
    return {
      img,
      ghost,
      kind,
      w: img.width / res,
      h: img.height / res,
      ax: (gx - x0 + 1) / res, // centre of mass inside the sprite, viewBox units
      ay: (gy - y0 + 1) / res,
      cx: gx / res - pad, // centre of mass on the mark, viewBox units
      cy: gy / res - pad,
    };
  });
}

// ── choreography ──
/** a: opacity; f: 1 = the solid piece, 0 = its bare outline */
type Key = { t: number; x: number; y: number; z: number; rx: number; ry: number; rz: number; a: number; f: number; hold?: boolean };
type Actor = { sprite: number; scale: number; keys: Key[]; home: boolean };
type State = Omit<Key, 't' | 'hold'>;
const FIELDS = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'a', 'f'] as const;

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** home position of a sprite's centre of mass, in box units (box = 1 × 1, centre 0.5) */
const homeOf = (sp: Sprite) => ({ x: 0.5 + ((sp.cx - VB_W / 2) / VB_W) * MARK, y: 0.5 + ((sp.cy - VB_H / 2) / VB_W) * MARK });

function choreography(sprites: Sprite[]): Actor[] {
  const r = rng(11);
  const between = (a: number, b: number) => a + (b - a) * r();
  const sign = () => (r() < 0.5 ? -1 : 1);
  const turn = () => Math.round(between(1, 2.4)) * 360 * sign();
  const polar = (rad_: number, ang: number) => ({ x: 0.5 + rad_ * Math.cos(ang), y: 0.5 + rad_ * Math.sin(ang) });
  const SWIRL = 1; // clockwise on screen

  const actors: Actor[] = sprites.map((sp, i) => {
    const h = homeOf(sp);
    const a0 = Math.atan2(h.y - 0.5, h.x - 0.5);
    const isV = sp.kind !== 'circle';
    const tb = between(0.3, 0.37) - (isV ? 0.02 : 0); // the V lets go first
    const end = [turn(), turn(), Math.round(between(0, 1)) * 360 * sign()];
    const loosen = { ...h, x: h.x + between(-0.04, 0.04), y: h.y + between(-0.04, 0.04) };
    const p1 = polar(between(0.1, 0.3), a0 + SWIRL * rad(between(60, 130)));
    const p2 = polar(between(0.08, 0.32), a0 + SWIRL * rad(between(170, 260)));
    const near = { x: h.x + between(-0.05, 0.05), y: h.y + between(-0.05, 0.05) };
    const land = between(0.76, 0.81);
    return {
      sprite: i,
      scale: 1,
      home: true,
      keys: [
        { t: 0, ...h, z: 0, rx: 0, ry: 0, rz: 0, a: 1, f: 1, hold: true },
        { t: tb, ...h, z: 0, rx: 0, ry: 0, rz: 0, a: 1, f: 1, hold: true },
        { t: tb + 0.07, ...loosen, z: between(0, 0.12), rx: between(-70, 70), ry: between(-90, 90), rz: between(-25, 25), a: 1, f: 1 },
        { t: between(0.47, 0.51), ...p1, z: between(-0.3, 0.8), rx: end[0] * 0.45, ry: end[1] * 0.4, rz: end[2] * 0.4 + between(-40, 40), a: 1, f: 1 },
        { t: between(0.59, 0.63), ...p2, z: between(-0.3, 0.6), rx: end[0] * 0.8, ry: end[1] * 0.75, rz: end[2] * 0.8, a: 1, f: 1 },
        { t: land - 0.06, ...near, z: between(0.02, 0.1), rx: end[0] + between(-25, 25), ry: end[1] + between(-25, 25), rz: end[2], a: 1, f: 1 },
        { t: land, ...h, z: 0, rx: end[0], ry: end[1], rz: end[2], a: 1, f: 1, hold: true },
        { t: 1, ...h, z: 0, rx: end[0], ry: end[1], rz: end[2], a: 1, f: 1, hold: true },
      ],
    };
  });

  // visitors: copies of the pieces drifting in from the edges, through the whirl, and out again
  for (let k = 0; k < VISITORS; k++) {
    const sprite = Math.floor(r() * sprites.length);
    const aIn = (k / VISITORS) * Math.PI * 2 + between(-0.25, 0.25);
    const aOut = aIn + SWIRL * rad(between(150, 260));
    const p0 = polar(between(0.4, 0.58), aIn);
    const pIn = polar(between(0.33, 0.45), aIn + SWIRL * rad(between(5, 25)));
    const pApp = polar(between(0.18, 0.32), aIn + SWIRL * rad(between(30, 70)));
    const pS1 = polar(between(0.06, 0.3), aIn + SWIRL * rad(between(90, 150)));
    const pS2 = polar(between(0.1, 0.34), aIn + SWIRL * rad(between(150, 220)));
    const pOut = polar(between(0.36, 0.48), aOut);
    const pEnd = polar(between(0.45, 0.62), aOut + SWIRL * rad(between(5, 20)));
    const edge = sign() * between(78, 88); // almost edge-on: a thin sliver
    const spin = [turn(), turn(), between(-120, 120)];
    const fadeIn = between(0.17, 0.25);
    const fadeOut = between(0.86, 0.93);
    actors.push({
      sprite,
      scale: between(0.85, 1.35),
      home: false,
      keys: [
        { t: 0, ...p0, z: between(-0.3, 0), rx: 0, ry: edge, rz: between(-60, 60), a: 0, f: 0, hold: true },
        { t: fadeIn - 0.08, ...p0, z: between(-0.3, 0), rx: 0, ry: edge, rz: between(-60, 60), a: 0, f: 0 },
        { t: fadeIn, ...pIn, z: between(-0.2, 0.1), rx: between(-20, 20), ry: edge * 0.92, rz: between(-60, 60), a: 0.7, f: 0 },
        { t: between(0.3, 0.36), ...pApp, z: between(-0.1, 0.25), rx: spin[0] * 0.2, ry: edge * 0.4, rz: spin[2] * 0.3, a: 1, f: 0.7 },
        { t: between(0.46, 0.5), ...pS1, z: between(-0.3, 0.9), rx: spin[0] * 0.55, ry: spin[1] * 0.5, rz: spin[2] * 0.6, a: 1, f: 1 },
        { t: between(0.58, 0.62), ...pS2, z: between(-0.3, 0.45), rx: spin[0] * 0.85, ry: spin[1] * 0.8, rz: spin[2] * 0.9, a: 1, f: 1 },
        { t: between(0.72, 0.77), ...pOut, z: between(-0.2, 0.15), rx: spin[0], ry: spin[1] + edge * 0.6, rz: spin[2], a: 0.9, f: 0.2 },
        { t: fadeOut, ...pEnd, z: between(-0.3, 0), rx: spin[0], ry: spin[1] + edge, rz: spin[2], a: 0.6, f: 0 },
        { t: 0.97, ...pEnd, z: between(-0.35, -0.1), rx: spin[0], ry: spin[1] + edge, rz: spin[2], a: 0, f: 0, hold: true },
        { t: 1, ...pEnd, z: -0.3, rx: spin[0], ry: spin[1] + edge, rz: spin[2], a: 0, f: 0, hold: true },
      ],
    });
  }
  return actors;
}

/** cubic Hermite through the keys; tangents from the neighbours, zero at holds */
function sample(keys: Key[], t: number): State {
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const dt = k1.t - k0.t || 1e-6;
  const u = Math.min(Math.max((t - k0.t) / dt, 0), 1);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const tangent = (j: number, f: (typeof FIELDS)[number]) => {
    const k = keys[j];
    if (k.hold) return 0;
    const a = keys[Math.max(j - 1, 0)], b = keys[Math.min(j + 1, keys.length - 1)];
    return (b[f] - a[f]) / (b.t - a.t || 1e-6);
  };
  const out = {} as State;
  for (const f of FIELDS) {
    out[f] = h00 * k0[f] + h10 * dt * tangent(i, f) + h01 * k1[f] + h11 * dt * tangent(i + 1, f);
  }
  out.a = k0.a + (k1.a - k0.a) * u; // opacity and fill: straight
  out.f = k0.f + (k1.f - k0.f) * u;
  return out;
}

/** 2 × 2 projection of the piece's plane after rotating X, then Y, then Z */
function plane(rx: number, ry: number, rz: number) {
  const [a, b, c] = [rad(rx), rad(ry), rad(rz)];
  const [ca, sa, cb, sb, cc, sc] = [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b), Math.cos(c), Math.sin(c)];
  // R = Rz · Ry · Rx; columns 0 and 1, rows 0 and 1
  const m00 = cc * cb, m01 = cc * sb * sa - sc * ca;
  const m10 = sc * cb, m11 = sc * sb * sa + cc * ca;
  return [m00, m10, m01, m11];
}

export function LogoShatter({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = root.current, cv = canvas.current;
    if (!box || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const css = getComputedStyle(box);
    const brand = css.getPropertyValue('--color-brand').trim() || '#21406e';
    const ink = css.getPropertyValue('--color-black').trim() || '#0f0e12';
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let size = 0, dpr = 1, sprites: Sprite[] = [], actors: Actor[] = [];
    let raf = 0, visible = false, start = performance.now(), pausedAt = 0;

    const setup = () => {
      size = box.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(size * dpr);
      cv.height = Math.round(size * dpr);
      const res = ((size * MARK) / VB_W) * dpr * 1.6; // sprite pixels per viewBox unit, room for close-ups
      sprites = makeSprites(res, brand, ink);
      actors = choreography(sprites);
    };

    const drawStill = () => {
      const k = (size * MARK) / VB_W;
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (size - VB_W * k) / 2, dpr * (size - VB_H * k) / 2);
      drawMark(ctx, brand, ink);
    };

    const drawActor = (act: Actor, st: State, alpha: number) => {
      const sp = sprites[act.sprite];
      if (alpha <= 0.001) return;
      const k = (size * MARK) / VB_W; // css px per viewBox unit at rest
      const persp = PERSPECTIVE / (PERSPECTIVE - st.z);
      const sx = 0.5 + (st.x - 0.5) * persp, sy = 0.5 + (st.y - 0.5) * persp;
      const [m00, m10, m01, m11] = plane(st.rx, st.ry, st.rz);
      const sc = k * persp * act.scale * dpr;
      ctx.setTransform(m00 * sc, m10 * sc, m01 * sc, m11 * sc, sx * size * dpr, sy * size * dpr);
      if (st.f < 1) {
        ctx.globalAlpha = alpha * (1 - st.f);
        ctx.drawImage(sp.ghost, -sp.ax, -sp.ay, sp.w, sp.h);
      }
      if (st.f > 0) {
        ctx.globalAlpha = alpha * st.f;
        ctx.drawImage(sp.img, -sp.ax, -sp.ay, sp.w, sp.h);
      }
    };

    const atRest = (a: Actor, t: number) => {
      const k = a.keys;
      return t <= k[1].t || t >= k[k.length - 2].t;
    };
    const zOf = (i: number, st: State) => st.z + (sprites[actors[i].sprite].kind !== 'circle' ? 1e-3 : 0); // the V over the circle

    const frame = (now: number) => {
      const t = (((now - start) % LOOP) + LOOP) % LOOP / LOOP;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cv.width, cv.height);

      const states = actors.map((a) => sample(a.keys, t));
      // the intact logo whenever every piece of the mark is home: no seams
      const homeIdle = actors.every((a) => !a.home || atRest(a, t));
      if (homeIdle) drawStill();

      const order = actors.map((a, i) => i).filter((i) => !(homeIdle && actors[i].home));
      order.sort((i, j) => zOf(i, states[i]) - zOf(j, states[j]));
      for (const i of order) {
        const act = actors[i], st = states[i];
        if (st.a <= 0.001) continue;
        const prev = sample(act.keys, Math.max(t - SHUTTER, 0));
        const sp = sprites[act.sprite];
        const reach = (Math.hypot(sp.w, sp.h) / 2) * ((size * MARK) / VB_W) * act.scale; // px from the centre to the edge
        const turned = rad(Math.abs(st.rx - prev.rx) + Math.abs(st.ry - prev.ry) + Math.abs(st.rz - prev.rz));
        const move = Math.hypot(st.x - prev.x, st.y - prev.y) * size + turned * reach;
        const n = Math.min(Math.ceil(move / BLUR_STEP), BLUR_MAX);
        if (n < 2 || t < SHUTTER) {
          drawActor(act, st, st.a);
        } else {
          const a = (1 - Math.pow(0.05, 1 / n)) * st.a;
          for (let j = n - 1; j >= 0; j--) drawActor(act, sample(act.keys, t - (SHUTTER * j) / (n - 1)), a);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (raf || still || !visible) return;
      start += performance.now() - pausedAt;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      pausedAt = performance.now();
    };

    setup();
    pausedAt = performance.now();
    if (still) drawStill();

    const ro = new ResizeObserver(() => {
      if (Math.abs(box.clientWidth - size) < 1) return;
      setup();
      if (still || !raf) drawStill();
    });
    ro.observe(box);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(box);
    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={root} className={`${s.box} ${className ?? ''}`} role="img" aria-label="Vibrolux">
      <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
    </div>
  );
}
