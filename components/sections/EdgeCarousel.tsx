'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import { Icon } from '../Icon';
import { brighter, fullscreenTriangle, glProgram, tokenRgb } from '@/lib/gl';
import s from './EdgeCarousel.module.css';

type Item = { media: MediaData; label: string; href: string };
type Data = { eyebrow: string; title: string; sub: string; items: Item[] };

const C = ANIM.edgeCarousel;
const MAX_DISCS = 16; // uScale[] in the shader

/**
 * A row of discs that drifts on its own, follows the page scroll and the drag, and is never cut at the screen edge:
 * near each side the row bends into a streak, with a blue rim at its outer end, and grows back out of one on the other
 * side. One fragment shader draws it (WebGL2); the photos are packed in one texture. Without WebGL2, or with reduced
 * motion, the same discs are a plain row of links that scrolls sideways. The links stay in the page either way (focus,
 * screen readers, the page transition's click handling).
 */
export function EdgeCarousel({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const focusDisc = useRef<(i: number) => void>(() => {});
  const [label, setLabel] = useState(-1);

  useGSAP(
    (_, contextSafe) => {
      const stopGL = prefersReducedMotion() ? undefined : startGL();
      const stopReveal = afterMount(() => {
        reveal(head.current);
        reveal(stage.current, { delay: 0.1 });
        reveal(foot.current, { delay: 0.2 });
      }, contextSafe!);
      return () => {
        stopReveal();
        stopGL?.();
      };
    },
    { scope: root },
  );

  function startGL() {
    const cv = canvas.current!;
    const st = stage.current!;
    const gl = cv.getContext('webgl2', { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) return;
    const prog = glProgram(gl, FRAG);
    if (!prog) return;
    st.dataset.gl = 'on';

    const n = Math.min(data.items.length, MAX_DISCS);
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = {
      res: u('uRes'), dpr: u('uDpr'), offset: u('uOffset'), d: u('uD'), p: u('uP'), n: u('uN'), e: u('uE'),
      g0: u('uG0'), squeeze: u('uSqueeze'), pull: u('uPull'), scale: u('uScale'), atlas: u('uAtlas'),
      grid: u('uGrid'), rimIn: u('uRimIn'), rimOut: u('uRimOut'),
    };
    gl.useProgram(prog);
    const buf = fullscreenTriangle(gl);

    // the rim: Vibrolux navy at the disc, turning to a brighter blue of the same hue toward the screen edge
    const brand = tokenRgb('--color-brand', [0.13, 0.25, 0.43]);
    gl.uniform3fv(U.rimIn, brand);
    gl.uniform3fv(U.rimOut, brighter(brand));
    gl.uniform1f(U.n, n);
    gl.uniform2f(U.grid, cols, rows);
    gl.uniform1f(U.g0, C.hidden);
    gl.uniform1f(U.squeeze, C.squeeze);
    gl.uniform1i(U.atlas, 0);

    // photos → one texture, a square cell each, cropped to cover
    const CELL = 512;
    const tex = gl.createTexture();
    let ready = false;
    Promise.all(data.items.slice(0, n).map((it) => load(it.media.src!))).then((imgs) => {
      const pack = document.createElement('canvas');
      pack.width = cols * CELL;
      pack.height = rows * CELL;
      const ctx = pack.getContext('2d')!;
      imgs.forEach((im, i) => {
        if (!im) return;
        // the centred square of the photo, so nothing spills into the next cell
        const side = Math.min(im.naturalWidth, im.naturalHeight);
        const sx = (im.naturalWidth - side) / 2;
        const sy = (im.naturalHeight - side) / 2;
        ctx.drawImage(im, sx, sy, side, side, (i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
      });
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pack);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
    });

    // geometry, in CSS px
    let W = 0, H = 0, D = 0, P = 0, E = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = st.clientWidth;
      H = st.clientHeight;
      D = H / 1.6; // the stage is 1.6 discs tall (CSS)
      P = D * (1 + C.gap);
      E = Math.max(W * C.band, D * C.bandMinDiscs);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(st);

    // the row's position: target moves with drift, scroll and drag; offset follows it smoothly
    let target = 0, offset = 0, momentum = 0;
    let hover = -1, focused = -1, inView = false;
    const scales = new Float32Array(MAX_DISCS).fill(1);
    const L = () => n * P;

    /** screen x → position along the row (the inverse of nothing: the shader does the same) */
    const g = (t: number) => C.hidden + (2 - 3 * C.hidden) * t * t + (2 * C.hidden - 1) * t * t * t;
    const toRow = (x: number) => (x < E ? E * g(x / E) : x > W - E ? W - E * g((W - x) / E) : x);
    /** the disc under a point of the stage, or -1 */
    const hit = (x: number, y: number) => {
      const r = toRow(x);
      const local = (((r - offset) % L()) + L()) % L();
      const cell = Math.floor(local / P);
      const dx = local - (cell + 0.5) * P;
      const dy = y - H / 2;
      return x > E && x < W - E && dx * dx + dy * dy < (D / 2) ** 2 * scales[cell] ** 2 ? cell : -1;
    };

    focusDisc.current = (i: number) => {
      focused = i;
      if (i < 0) return;
      // bring disc i to the middle, the nearest way round
      let to = W / 2 - (i + 0.5) * P;
      to += L() * Math.round((target - to) / L());
      target = to;
      momentum = 0;
    };

    // drag (pointer), click (a disc → its process, through the real link)
    let down: { x: number; t: number; moved: number } | null = null;
    let vel = 0;
    const local = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top] as const;
    };
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, t: performance.now(), moved: 0 };
      vel = 0;
      momentum = 0;
      cv.setPointerCapture(e.pointerId);
      st.dataset.drag = 'on';
    };
    const onMove = (e: PointerEvent) => {
      if (down) {
        const dx = e.clientX - down.x;
        const now = performance.now();
        vel = (dx / Math.max(now - down.t, 1)) * 16.67; // px per frame
        target += dx;
        down.moved += Math.abs(dx);
        down.x = e.clientX;
        down.t = now;
      }
      const [x, y] = local(e);
      const h = down && down.moved > 4 ? -1 : hit(x, y);
      if (h !== hover) {
        hover = h;
        setLabel(h);
        st.dataset.hover = h >= 0 ? 'on' : '';
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const click = down.moved < 6;
      down = null;
      st.dataset.drag = '';
      if (click) {
        const [x, y] = local(e);
        const i = hit(x, y);
        if (i >= 0) list.current?.children[i]?.querySelector('a')?.click();
      } else momentum = vel;
    };
    const onLeave = () => {
      if (down) return;
      hover = -1;
      setLabel(focused);
      st.dataset.hover = '';
    };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('pointerleave', onLeave);

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (inView) target -= (y - lastY) * C.scroll;
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (_t: number, dtMs: number) => {
      const f = Math.min(dtMs / 16.67, 4); // frames at 60 fps
      if (!down) {
        if (hover < 0 && focused < 0) target -= (C.drift * dtMs) / 1000;
        target += momentum * f;
        momentum *= C.inertia ** f;
      }
      offset += (target - offset) * (1 - (1 - C.follow) ** f);
      for (let i = 0; i < n; i++) {
        const want = i === hover || i === focused ? C.hoverScale : 1;
        scales[i] += (want - scales[i]) * (1 - 0.85 ** f);
      }
      if (!ready) return;
      gl.uniform2f(U.res, cv.width, cv.height);
      gl.uniform1f(U.dpr, dpr);
      gl.uniform1f(U.offset, offset);
      gl.uniform1f(U.d, D);
      gl.uniform1f(U.p, P);
      gl.uniform1f(U.e, E);
      gl.uniform1f(U.pull, E * C.rim);
      gl.uniform1fv(U.scale, scales);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // draw only while the row is on screen
    const io = new IntersectionObserver(([en]) => {
      inView = en.isIntersecting;
      lastY = window.scrollY;
      if (inView) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    });
    io.observe(st);

    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      window.removeEventListener('scroll', onScroll);
      cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerup', onUp);
      cv.removeEventListener('pointercancel', onUp);
      cv.removeEventListener('pointerleave', onLeave);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      focusDisc.current = () => {};
      delete st.dataset.gl;
    };
  }

  const shown = label >= 0 ? data.items[label] : undefined;

  return (
    <section ref={root} className={s.edge}>
      <div ref={head} className={s.head} data-reveal="">
        <h2 className="t-eyebrow">{data.eyebrow}</h2>
        <p className={s.title}>
          {data.title}
          <span className={s.sub}>{data.sub}</span>
        </p>
      </div>
      <div ref={stage} className={s.stage} data-reveal="">
        <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
        <ul ref={list} className={s.list}>
          {data.items.map((it, i) => (
            <li key={i} className={s.disc}>
              <a
                href={it.href}
                aria-label={it.media.alt ? `${it.label}: ${it.media.alt}` : it.label}
                onFocus={() => (focusDisc.current(i), setLabel(i))}
                onBlur={() => (focusDisc.current(-1), setLabel(-1))}
              >
                <Media {...it.media} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div ref={foot} className={s.foot} data-reveal="">
        <p className={s.label} aria-hidden="true" data-on={shown ? '' : undefined}>
          {shown?.label}
          <Icon name="arrow-out" />
        </p>
      </div>
    </section>
  );
}

/* ───────── WebGL ───────── */

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;      // canvas, device px
uniform float uDpr;
uniform float uOffset;  // row position, CSS px
uniform float uD;       // disc diameter
uniform float uP;       // pitch: diameter + gap
uniform float uN;       // discs
uniform float uE;       // band at each side
uniform float uG0;      // share of the band the row skips
uniform float uSqueeze; // streak height at the very edge
uniform float uPull;    // how far the blue copy runs ahead, at the edge
uniform float uScale[${MAX_DISCS}];
uniform sampler2D uAtlas;
uniform vec2 uGrid;     // atlas columns, rows
uniform vec3 uRimIn;
uniform vec3 uRimOut;
out vec4 outColor;

// the band's bend: g(0) = g0 with g'(0) = 0 (a sliver of row stretched into a streak), g(1) = 1 with g'(1) = 1 (no seam)
float bend(float t) {
  return uG0 + (2.0 - 3.0 * uG0) * t * t + (2.0 * uG0 - 1.0) * t * t * t;
}

// screen x → (row x, closeness to the edge 0…1, side -1 left / 1 right / 0 middle)
vec3 toRow(float x, float W) {
  if (x < uE) { float t = x / uE; return vec3(uE * bend(t), 1.0 - t, -1.0); }
  if (x > W - uE) { float t = (W - x) / uE; return vec3(W - uE * bend(t), 1.0 - t, 1.0); }
  return vec3(x, 0.0, 0.0);
}

// the disc at row x, y from the row's centre line: colour, and coverage in a
vec3 disc(float r, float y, float edge, out float a) {
  float L = uN * uP;
  float local = mod(r - uOffset, L);
  float cell = min(floor(local / uP), uN - 1.0);
  float dx = local - (cell + 0.5) * uP;
  float R = 0.5 * uD * uScale[int(cell)];
  float dy = y / mix(1.0, uSqueeze, edge * edge);
  float dist = length(vec2(dx, dy));
  a = 1.0 - smoothstep(R - 1.0, R + 0.5, dist);
  vec2 uv = clamp(vec2(dx, dy) / (2.0 * R) + 0.5, 0.0, 1.0);
  vec2 cellXY = vec2(mod(cell, uGrid.x), floor(cell / uGrid.x));
  return texture(uAtlas, (cellXY + uv) / uGrid).rgb;
}

void main() {
  float W = uRes.x / uDpr;
  float x = gl_FragCoord.x / uDpr;
  float y = (uRes.y - gl_FragCoord.y) / uDpr - 0.5 * uRes.y / uDpr;
  vec3 m = toRow(x, W);
  float a1; vec3 c1 = disc(m.x, y, m.y, a1);
  // a copy pulled a little further toward the edge: where it reaches past the disc, the streak turns blue
  float a2; vec3 c2 = disc(m.x - m.z * uPull * m.y * m.y, y, m.y, a2);
  float rim = a2 * (1.0 - a1);
  vec3 blue = mix(uRimIn, uRimOut, m.y);
  vec3 col = c1 * a1 + mix(blue, c2, 0.2) * rim;
  outColor = vec4(col, a1 + rim);
}`;

function load(src: string) {
  return new Promise<HTMLImageElement | null>((done) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => done(im);
    im.onerror = () => done(null);
    im.src = src;
  });
}
