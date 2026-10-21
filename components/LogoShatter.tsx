'use client';

import { useEffect, useRef } from 'react';
import { CIRCLE, V } from './logoData';
import s from './LogoShatter.module.css';

/**
 * The Vibrolux mark opens and closes, in order (after the reference loop, made calm and symmetric):
 *
 *  1. rest    the logo, still
 *  2. open    the ring parts into eight equal arcs that step out one after the other, clockwise from the top;
 *             the two strokes of the V lift towards us and part; the core turns like a coin
 *  3. orbit   the arcs travel half a turn round the centre as one figure, each turning once on its own radius
 *             (a wave that runs round the ring), a fading outline of each one following it; from outside, a second
 *             ring of outlines closes in and turns the other way
 *  4. close   in the same order the arcs come home (half a turn on, each lands where its twin was: the ring is the
 *             same), the outer outlines go back out, the V lands last
 *  5. rest
 *
 * Drawn on a canvas: every piece is the real vector mark clipped to a cell (circle in brand navy, the V white with a
 * black line round it, cut edges included), pre-rendered once, then drawn with the 2D projection of its turn and a
 * perspective scale. Reduced motion: the still logo.
 */

// ── the mark, in its viewBox units (0 0 66 50) ──
const VB_W = 66;
const VB_H = 50;
const CX = 33.68;
const CY = 24.76;
const R = 24.76;
const R_CORE = R * 0.5;
const OUTLINE = 0.7; // black line round the white V, viewBox units
const GHOST = 0.4; // line of a piece drawn as a bare outline

const LOOP = 7.2; // s, one cycle
const MARK = 0.46; // mark width, fraction of the box
const PERSPECTIVE = 2.6; // camera distance, box widths
const ARCS = 8;

type Kind = 'circle' | 0 | 1; // 0, 1: the two strokes of the V
type Cell = { kind: Kind; cell?: string };

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const pt = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(3)} ${(CY + r * Math.sin(a)).toFixed(3)}`;
const sector = (r0: number, r1: number, a0: number, a1: number) =>
  `M${pt(r1, a0)}A${r1} ${r1} 0 0 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0} ${r0} 0 0 0 ${pt(r0, a0)}Z`;

// eight equal arcs starting at the top, the core, the two strokes of the V
const STEP = 360 / ARCS;
const RC = R_CORE + 0.4;
const CELLS: Cell[] = [
  ...Array.from({ length: ARCS }, (_, i) => ({
    kind: 'circle' as const,
    cell: sector(R_CORE, R + 1, rad(-90 - STEP / 2 + i * STEP), rad(-90 + STEP / 2 + i * STEP)),
  })),
  { kind: 'circle', cell: `M${CX - RC} ${CY}a${RC} ${RC} 0 1 0 ${2 * RC} 0a${RC} ${RC} 0 1 0 ${-2 * RC} 0Z` },
  { kind: 1 },
  { kind: 0 },
];
const CORE = ARCS;
const V_LEFT = ARCS + 1;
const V_RIGHT = ARCS + 2;

// ── pre-rendered pieces ──
type Sprite = { img: HTMLCanvasElement; ghost: HTMLCanvasElement; ax: number; ay: number; w: number; h: number; cx: number; cy: number };

function drawMark(ctx: CanvasRenderingContext2D, brand: string, ink: string, cell?: Path2D, kind?: Kind) {
  if (kind === undefined || kind === 'circle') {
    ctx.save();
    if (cell) ctx.clip(cell);
    ctx.fillStyle = brand;
    ctx.fill(new Path2D(CIRCLE));
    ctx.restore();
  }
  V.forEach((d, i) => {
    if (kind !== undefined && kind !== i) return;
    const v = new Path2D(d);
    ctx.save();
    if (cell) ctx.clip(cell);
    ctx.clip(v);
    ctx.fillStyle = '#fff';
    ctx.fill(v);
    // the line runs inside the shape, so the pieces and the whole mark match to the pixel
    ctx.strokeStyle = ink;
    ctx.lineWidth = OUTLINE * 2;
    ctx.lineJoin = 'round';
    ctx.stroke(v);
    if (cell) ctx.stroke(cell);
    ctx.restore();
  });
}

function drawGhost(ctx: CanvasRenderingContext2D, ink: string, cell: Path2D | undefined, kind: Kind) {
  const shape = new Path2D(kind === 'circle' ? CIRCLE : V[kind]);
  ctx.save();
  if (cell) ctx.clip(cell);
  ctx.clip(shape);
  ctx.strokeStyle = ink;
  ctx.lineWidth = GHOST * 2;
  ctx.lineJoin = 'round';
  ctx.stroke(shape);
  if (cell) ctx.stroke(cell);
  ctx.restore();
}

function makeSprites(res: number, brand: string, ink: string): Sprite[] {
  return CELLS.map(({ kind, cell }) => {
    const pad = 2;
    const full = document.createElement('canvas');
    full.width = Math.ceil((VB_W + pad * 2) * res);
    full.height = Math.ceil((VB_H + pad * 2) * res);
    const fx = full.getContext('2d', { willReadFrequently: true })!;
    fx.setTransform(res, 0, 0, res, pad * res, pad * res);
    const path = cell ? new Path2D(cell) : undefined;
    drawMark(fx, brand, ink, path, kind);
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
    const crop = (paint: (c: CanvasRenderingContext2D) => void) => {
      const c = document.createElement('canvas');
      c.width = x1 - x0 + 3;
      c.height = y1 - y0 + 3;
      paint(c.getContext('2d')!);
      return c;
    };
    const img = crop((c) => c.drawImage(full, -x0 + 1, -y0 + 1));
    const ghost = crop((c) => {
      c.setTransform(res, 0, 0, res, pad * res - x0 + 1, pad * res - y0 + 1);
      drawGhost(c, ink, path, kind);
    });
    const gx = sx / n, gy = sy / n;
    return {
      img,
      ghost,
      w: img.width / res,
      h: img.height / res,
      ax: (gx - x0 + 1) / res,
      ay: (gy - y0 + 1) / res,
      cx: gx / res - pad,
      cy: gy / res - pad,
    };
  });
}

// ── timing ──
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x: number) => 1 - Math.pow(1 - x, 4);
const inOutQuint = (x: number) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2);
/** 0 → 1 over [a, a + d] seconds, eased */
const span = (T: number, a: number, d: number, ease = inOut) => ease(clamp01((T - a) / d));

/** a piece at one moment: position (box units, centre 0.5), depth, its turns on itself, opacity, size */
type State = { x: number; y: number; z: number; spin: number; flip: number; axis: number; a: number; scale: number };

const OPEN = 1.2; // s: the ring starts to part
const WAVE = 0.075; // s between one arc and the next
const SHUT = 6.05; // s: everything is home

/** 2 × 2 projection: turned by `flip` round an axis at `axis` degrees in the screen plane, then by `spin` in the plane */
function project(spin: number, flip: number, axis: number) {
  const c = Math.cos(rad(axis)), s_ = Math.sin(rad(axis)), k = Math.cos(rad(flip));
  const a00 = c * c + k * s_ * s_, a01 = c * s_ - k * c * s_, a11 = s_ * s_ + k * c * c; // Rz(axis)·diag(1,k)·Rz(−axis)
  const cs = Math.cos(rad(spin)), ss = Math.sin(rad(spin));
  return [cs * a00 - ss * a01, ss * a00 + cs * a01, cs * a01 - ss * a11, ss * a01 + cs * a11];
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

    let size = 0, dpr = 1, sprites: Sprite[] = [];
    let raf = 0, visible = false, start = performance.now(), pausedAt = performance.now();

    const centre = { x: 0.5 + ((CX - VB_W / 2) / VB_W) * MARK, y: 0.5 + ((CY - VB_H / 2) / VB_W) * MARK };
    const homeOf = (i: number) => ({
      x: 0.5 + ((sprites[i].cx - VB_W / 2) / VB_W) * MARK,
      y: 0.5 + ((sprites[i].cy - VB_H / 2) / VB_W) * MARK,
    });

    // ── the choreography: one rule per kind of piece, all on the same clock ──
    const arc = (i: number, T: number): State => {
      const h = homeOf(i);
      const r0 = Math.hypot(h.x - centre.x, h.y - centre.y);
      const a0 = Math.atan2(h.y - centre.y, h.x - centre.x);
      const t0 = OPEN + i * WAVE;
      const e = span(T, t0, 1.1, out) * (1 - span(T, t0 + 2.75, 1.4, inOut)); // out, hold, back
      const turn = 180 * span(T, t0, 4.15, inOutQuint); // half a turn round the centre: each arc lands on its twin's place
      const a = a0 + rad(turn);
      const r = r0 + 0.15 * e;
      return {
        x: centre.x + r * Math.cos(a),
        y: centre.y + r * Math.sin(a),
        z: 0.08 * e,
        spin: turn,
        flip: 360 * span(T, t0 + 0.3, 3.4, inOut), // once round its own radius
        axis: deg(a0), // in the sprite's own frame, before the spin
        a: 1,
        scale: 1,
      };
    };
    const outer = (i: number, T: number): State => {
      // a second ring of outlines, larger, closing in from beyond the box and turning the other way
      const t0 = OPEN + 0.35 + i * WAVE;
      const e = span(T, t0, 1.3, out) * (1 - span(T, t0 + 2.3, 1.4, inOut));
      const a0 = rad(-90 + i * STEP);
      const turn = -60 * span(T, t0, 4, inOut);
      const a = a0 + rad(turn);
      const r = 0.62 - 0.17 * e;
      return {
        x: centre.x + r * Math.cos(a),
        y: centre.y + r * Math.sin(a),
        z: 0,
        spin: turn,
        flip: -180 * span(T, t0, 4, inOut),
        axis: deg(a0),
        a: 0.5 * e,
        scale: 1.5,
      };
    };
    const core = (T: number): State => {
      const e = span(T, OPEN + 0.2, 1, out) * (1 - span(T, OPEN + 3.2, 1.3, inOut));
      return { ...centre, z: -0.12 * e, spin: 0, flip: 360 * span(T, OPEN + 0.3, 4, inOutQuint), axis: 90, a: 1, scale: 1 };
    };
    const vee = (i: number, T: number): State => {
      const h = homeOf(i);
      const side = i === V_LEFT ? -1 : 1;
      const e = span(T, OPEN + 0.15, 1.2, out) * (1 - span(T, OPEN + 3.35, 1.45, inOut));
      return {
        x: h.x + side * 0.1 * e,
        y: h.y - 0.03 * e,
        z: 0.32 * e,
        spin: side * 8 * e,
        flip: -side * 360 * span(T, OPEN + 0.4, 3.95, inOutQuint), // the two strokes turn towards each other
        axis: 90,
        a: 1,
        scale: 1,
      };
    };

    const setup = () => {
      size = box.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(size * dpr);
      cv.height = Math.round(size * dpr);
      sprites = makeSprites(((size * MARK) / VB_W) * dpr * 1.6, brand, ink);
    };

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
    const drawStill = () => {
      const k = (size * MARK) / VB_W;
      clear();
      ctx.setTransform(dpr * k, 0, 0, dpr * k, (dpr * (size - VB_W * k)) / 2, (dpr * (size - VB_H * k)) / 2);
      drawMark(ctx, brand, ink);
    };

    const draw = (i: number, st: State, ghost = false) => {
      if (st.a <= 0.002) return;
      const sp = sprites[i];
      const k = (size * MARK) / VB_W;
      const persp = PERSPECTIVE / (PERSPECTIVE - st.z);
      const sx = 0.5 + (st.x - 0.5) * persp, sy = 0.5 + (st.y - 0.5) * persp;
      const [a, b, c, d] = project(st.spin, st.flip, st.axis);
      const sc = k * persp * st.scale * dpr;
      ctx.setTransform(a * sc, b * sc, c * sc, d * sc, sx * size * dpr, sy * size * dpr);
      ctx.globalAlpha = st.a;
      ctx.drawImage(ghost ? sp.ghost : sp.img, -sp.ax, -sp.ay, sp.w, sp.h);
    };

    const frame = (now: number) => {
      const T = ((((now - start) / 1000) % LOOP) + LOOP) % LOOP;
      if (T < OPEN || T > SHUT) {
        drawStill(); // at rest: the whole mark, no seams
      } else {
        clear();
        // back to front: outer outlines, the arcs' trailing outlines, the core, the arcs, the V
        for (let i = 0; i < ARCS; i++) draw(i, outer(i, T), true);
        for (let i = 0; i < ARCS; i++) {
          const h = homeOf(i), cur = arc(i, T);
          const away = clamp01((Math.hypot(cur.x - h.x, cur.y - h.y) / 0.15) * 1.5);
          draw(i, { ...arc(i, T - 0.14), a: 0.3 * away }, true);
          draw(i, { ...arc(i, T - 0.28), a: 0.14 * away }, true);
        }
        draw(CORE, core(T));
        for (let i = 0; i < ARCS; i++) draw(i, arc(i, T));
        draw(V_LEFT, vee(V_LEFT, T));
        draw(V_RIGHT, vee(V_RIGHT, T));
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
    drawStill();

    const ro = new ResizeObserver(() => {
      if (Math.abs(box.clientWidth - size) < 1) return;
      setup();
      drawStill();
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
