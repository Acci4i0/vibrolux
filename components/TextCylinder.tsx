'use client';

import { useEffect, useRef } from 'react';
import { CIRCLE, V } from './logoData';
import s from './TextCylinder.module.css';

/**
 * A word (and the logo mark after it) wrapped round a ring, twice so the near side always holds the whole word, that
 * spins on its axis while the axis tumbles —
 * the motion of the reference loop. Drawn on a canvas with its own 3D projection, so it looks the same in every
 * browser (CSS 3D gets flattened by WebKit, i.e. every browser on iPad and iPhone).
 *
 * The lettering is painted once on a long strip (the ring unrolled); every frame the strip is cut into narrow slices,
 * each slice is placed on the ring, turned with the ring, projected with perspective and drawn far to near. Slices
 * seen from behind come out mirrored, as on a transparent ring, and faint, so the word on the near side always reads.
 * The camera stands well back: near and far letters keep almost the same size, a cylinder and not a funnel.
 * Reduced motion: one still frame, the ring facing us.
 */

const LOOP = 5.4; // s
const FONT = 0.3; // letter size, fraction of the box, for a word that goes round once (REPEAT divides it)
const PERSPECTIVE = 4; // camera distance, fraction of the box: far enough that near letters are only ~10% larger than far ones
const LINE = 1.2; // em: height of the band the lettering sits on
const BASELINE = 0.955; // em from the top of the band (capitals 0.7 em tall above it)
const MARK_H = 0.8; // em: a touch taller than the capitals, as a round shape needs
const MARK_W = (MARK_H * 66) / 50; // the mark's viewBox is 66 × 50
const MARK_SPACE = 0.3; // em on each side of the mark
const SLICE = 0.055; // em: width of a slice
const LEAN = 18; // degrees: facing us, the ring is seen from a little above, so near and far sides make two rows
const BACK = 0.16; // brightness of the letters on the far side, seen from behind
const SHADES = 6; // the lettering painted at this many brightness steps, from BACK to white
const REPEAT = 2; // how many times the word goes round the ring

const rad = (d: number) => (d * Math.PI) / 180;

/** the reference's motion at u ∈ [0, 1): axis angle on screen, tilt, turn of the ring on its axis (degrees) */
function pose(u: number) {
  const g = u + (0.847 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI); // fast while facing us, slow while tipping
  const h = u - Math.sin(2 * Math.PI * u) / (2 * Math.PI); // flat at the ends, through the view from above at ½
  return { z: -180 * g, x: 180 * h - LEAN * Math.cos(Math.PI * u), y: -540 * u };
}

/** CSS rotateZ(z) rotateX(x) rotateY(y) as a 3 × 3 matrix (y axis down, z towards the viewer) */
function matrix(zd: number, xd: number, yd: number) {
  const [cz, sz, cx, sx, cy, sy] = [Math.cos(rad(zd)), Math.sin(rad(zd)), Math.cos(rad(xd)), Math.sin(rad(xd)), Math.cos(rad(yd)), Math.sin(rad(yd))];
  const Z = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  const X = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const Y = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const mul = (a: number[], b: number[]) =>
    [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]));
  return mul(mul(Z, X), Y);
}

export function TextCylinder({ word, className }: { word: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = root.current, cv = canvas.current;
    if (!box || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const css = getComputedStyle(box);
    const family = css.getPropertyValue('--font-display').trim() || 'sans-serif';
    const ink = '#fff';
    const brand = css.getPropertyValue('--color-brand').trim() || '#21406e';
    const ground = css.getPropertyValue('--color-black').trim() || '#0f0e12';
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let size = 0, dpr = 1, em = 0, circ = 0, band: HTMLCanvasElement | null = null, res = 1;
    let shades: HTMLCanvasElement[] = [];
    let raf = 0, visible = false, start = performance.now(), pausedAt = performance.now();
    let cancelled = false;

    /** the ring unrolled: the word, a space, the mark, a space (REPEAT times) — painted once, at every shade */
    const paint = () => {
      size = box.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(size * dpr);
      cv.height = Math.round(size * dpr);
      em = (size * FONT) / REPEAT; // css px: a ring twice as long has half-size letters, so it stays inside the box
      res = em * dpr * 1.25; // band pixels per em: room for the near side, which comes closer
      const m = document.createElement('canvas').getContext('2d')!;
      m.font = `700 ${res}px ${family}`;
      const chars = [...word];
      const adv = chars.map((ch) => m.measureText(ch).width / res);
      const unit = adv.reduce((a, b) => a + b, 0) + MARK_SPACE * 2 + MARK_W;
      circ = unit * REPEAT;
      band = document.createElement('canvas');
      band.width = Math.ceil(circ * res);
      band.height = Math.ceil(LINE * res);
      const b = band.getContext('2d')!;
      b.font = `700 ${res}px ${family}`;
      b.fillStyle = ink;
      b.textBaseline = 'alphabetic';
      for (let r = 0; r < REPEAT; r++) {
        let x = r * unit;
        chars.forEach((ch, i) => {
          b.fillText(ch, x * res, BASELINE * res);
          x += adv[i];
        });
        // the mark, centred on the capitals
        const k = (MARK_H * res) / 50;
        const top = (BASELINE - 0.35 - MARK_H / 2) * res;
        b.save();
        b.setTransform(k, 0, 0, k, (x + MARK_SPACE) * res, top);
        b.fillStyle = brand;
        b.fill(new Path2D(CIRCLE));
        b.fillStyle = ink;
        V.forEach((d) => b.fill(new Path2D(d)));
        b.restore();
      }
      // the same strip darkened towards the background, opaque: overlapping slices of the far side stay even
      // (with transparency their overlaps would show as stripes)
      shades = Array.from({ length: SHADES }, (_, j) => {
        const t = BACK + ((1 - BACK) * j) / (SHADES - 1);
        if (j === SHADES - 1) return band!;
        const c = document.createElement('canvas');
        c.width = band!.width;
        c.height = band!.height;
        const g = c.getContext('2d')!;
        g.drawImage(band!, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.globalAlpha = 1 - t;
        g.fillStyle = ground;
        g.fillRect(0, 0, c.width, c.height);
        return c;
      });
    };

    const draw = (u: number) => {
      if (!band) return;
      const p = pose(u);
      const M = matrix(p.z, p.x, p.y);
      const R = circ / (2 * Math.PI); // em
      const P = (size * PERSPECTIVE) / em; // camera distance in em
      const c = size / 2; // css px
      const half = LINE / 2;
      const n = Math.ceil(circ / SLICE);
      const w = circ / n;
      // a point on the ring: band x (em), band y (em from the band's centre) → screen px and depth
      const at = (bx: number, by: number) => {
        const a = (bx / circ) * Math.PI * 2;
        const lx = R * Math.sin(a), ly = by, lz = R * Math.cos(a);
        const X = M[0] * lx + M[1] * ly + M[2] * lz;
        const Y = M[3] * lx + M[4] * ly + M[5] * lz;
        const Z = M[6] * lx + M[7] * ly + M[8] * lz;
        const k = P / (P - Z);
        return [c + X * k * em, c + Y * k * em, Z];
      };
      const slices: [number, number][] = [];
      for (let i = 0; i < n; i++) slices.push([i, at((i + 0.5) * w, 0)[2]]);
      slices.sort((a, b) => a[1] - b[1]); // far first
      // how much a slice faces the camera: the z of its outward normal (sin a, 0, cos a) once turned with the ring
      const facing = (i: number) => {
        const a = (((i + 0.5) * w) / circ) * Math.PI * 2;
        const t = Math.min(1, Math.max(0, (M[6] * Math.sin(a) + M[8] * Math.cos(a) + 0.25) / 0.5));
        return Math.round(t * t * (3 - 2 * t) * (SHADES - 1));
      };

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const pad = SLICE * 0.45; // em: each slice reaches into its neighbours, so no seam shows even edge-on
      for (const [i] of slices) {
        const x0 = i * w - pad, x1 = (i + 1) * w + pad;
        const [ax, ay] = at(x0, -half), [bx, by] = at(x1, -half), [cx_, cy_] = at(x0, half);
        // texture slice (x0..x1, whole height) → parallelogram a, b, c
        const sw = (x1 - x0) * res, sh = LINE * res;
        ctx.setTransform(((bx - ax) / sw) * dpr, ((by - ay) / sw) * dpr, ((cx_ - ax) / sh) * dpr, ((cy_ - ay) / sh) * dpr, ax * dpr, ay * dpr);
        const sx = Math.max(0, x0 * res);
        ctx.drawImage(shades[facing(i)], sx, 0, Math.min(sw, band.width - sx), band.height, sx - x0 * res, 0, Math.min(sw, band.width - sx), band.height);
      }
    };

    const frame = (now: number) => {
      draw(((((now - start) / 1000) % LOOP) + LOOP) % LOOP / LOOP);
      raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (raf || still || !visible || !band) return;
      start += performance.now() - pausedAt;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      pausedAt = performance.now();
    };

    // paint once the display face is in (or with the fallback if it never arrives)
    document.fonts.load(`700 40px ${family}`).then(
      () => !cancelled && (paint(), draw(0), play()),
      () => !cancelled && (paint(), draw(0), play()),
    );
    const ro = new ResizeObserver(() => {
      if (!band || Math.abs(box.clientWidth - size) < 1) return;
      paint();
      draw(0);
    });
    ro.observe(box);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(box);
    return () => {
      cancelled = true;
      pause();
      ro.disconnect();
      io.disconnect();
    };
  }, [word]);

  return (
    <div ref={root} className={`${s.box} ${className ?? ''}`} role="img" aria-label={word}>
      <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
    </div>
  );
}
