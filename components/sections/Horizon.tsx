'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { ANIM } from '@/config/animations';
import { fullscreenTriangle, glProgram, tokenRgb } from '@/lib/gl';
import s from './Horizon.module.css';

const C = ANIM.horizon;

/**
 * A dark chapter between two white sections, after the reference's sunrise seen from orbit, redrawn as light on steel.
 * In: the dark rises from below, its edge lit like a polished part, white in the middle and steel toward the sides, its
 * curve flattening as it climbs. Then it fills the screen and holds the section inside it, in white. Out: the dark lifts away, its lower edge
 * hanging from the top (the corners clear first) and straightening into a flat glow over the section that follows.
 * One fragment shader on a canvas that stays on screen while the section passes (sticky), drawn only when the
 * scroll moves it. Without WebGL2: a plain black band with a still glow above and below.
 */
export function Horizon({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stopGL = startGL(prefersReducedMotion());
      return () => stopGL?.();
    },
    { scope: root },
  );

  function startGL(reduced: boolean) {
    const cv = canvas.current!;
    const el = root.current!;
    const gl = cv.getContext('webgl2', { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) return;
    const prog = glProgram(gl, FRAG);
    if (!prog) return;
    el.dataset.gl = 'on';
    gl.useProgram(prog);
    const buf = fullscreenTriangle(gl);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = { res: u('uRes'), dpr: u('uDpr'), top: u('uTop'), bot: u('uBot'), rTop: u('uRTop'), rBot: u('uRBot'), reach: u('uReach') };
    // the dark is the site's steel black; the blues come from the Vibrolux navy
    // light on steel: the palette's own greys, a touch of the Vibrolux navy at the far end; the dark is the footer's black
    gl.uniform3fv(u('uDark'), tokenRgb('--color-black', [0.06, 0.05, 0.07]));
    gl.uniform3fv(u('uSurface'), tokenRgb('--color-grey4', [0.93, 0.94, 0.95]));
    gl.uniform3fv(u('uSteel'), tokenRgb('--color-grey3', [0.73, 0.75, 0.78]));
    gl.uniform3fv(u('uGraphite'), tokenRgb('--color-grey2', [0.37, 0.4, 0.44]));
    gl.uniform3fv(u('uBrand'), tokenRgb('--color-brand', [0.13, 0.25, 0.43]));

    let dpr = 1;
    let last = '';
    /** an edge's curve from where it is on the screen: round as it comes in at the bottom, flat by the top */
    const radius = (screenY: number, W: number, vh: number) => {
      const q = reduced ? 1 : gsap.utils.clamp(0, 1, (vh - screenY) / vh);
      return W * (C.radiusStart + (C.radiusEnd - C.radiusStart) * q ** C.flatten);
    };
    const draw = (force = false) => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const c = cv.getBoundingClientRect();
      const W = c.width;
      const top = r.top + sky.current!.offsetHeight; // the dark's upper edge, on screen
      const bot = r.top + body.current!.offsetTop + body.current!.offsetHeight; // its lower edge
      const key = `${top}|${bot}|${W}|${c.top}`;
      if (!force && key === last) return;
      last = key;
      gl.uniform2f(U.res, cv.width, cv.height);
      gl.uniform1f(U.dpr, dpr);
      gl.uniform1f(U.top, top - c.top);
      gl.uniform1f(U.bot, bot - c.top);
      gl.uniform1f(U.rTop, radius(top, W, vh));
      gl.uniform1f(U.rBot, radius(bot, W, vh));
      gl.uniform1f(U.reach, sky.current!.offsetHeight * C.reach);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const resize = () => {
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(4e6 / (W * H)));
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      draw(true);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    // follow the scroll only while the section is on screen
    const tick = () => draw();
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)));
    io.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      gsap.ticker.remove(tick);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      delete el.dataset.gl;
    };
  }

  return (
    <section ref={root} className={s.horizon}>
      {/* the canvas rides along the section, always covering the part of it on screen */}
      <div className={s.stage} aria-hidden="true">
        <canvas ref={canvas} className={s.canvas} />
      </div>
      <div ref={sky} className={s.sky} />
      <div ref={body} className={s.body}>
        {children}
      </div>
      <div className={s.sky} />
    </section>
  );
}

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;    // canvas, device px
uniform float uDpr;
uniform float uTop;   // the dark's upper edge, CSS px from the canvas top
uniform float uBot;   // its lower edge
uniform float uRTop;  // radius of each edge's curve
uniform float uRBot;
uniform float uReach; // glow height off the edge, in the middle
uniform vec3 uDark;
uniform vec3 uSurface;
uniform vec3 uSteel;
uniform vec3 uGraphite;
uniform vec3 uBrand;
out vec4 outColor;

// the light off the edge: white where it is brightest, the surface grey, steel, then steel with a breath of navy
vec3 ramp(float t) {
  vec3 c = mix(vec3(1.0), uSurface, smoothstep(0.0, 0.2, t));
  c = mix(c, uSteel, smoothstep(0.15, 0.55, t));
  return mix(c, mix(uSteel, uBrand, 0.35), smoothstep(0.5, 0.9, t));
}

void main() {
  float W = uRes.x / uDpr;
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  // the dark is inside both circles: the upper edge bulges up (centre below), the lower edge hangs down (centre above)
  float dTop = length(p - vec2(0.5 * W, uTop + uRTop)) - uRTop;
  float dBot = length(p - vec2(0.5 * W, uBot - uRBot)) - uRBot;
  float d = max(dTop, dBot);               // > 0 on the page, < 0 in the dark
  float u = (p.x - 0.5 * W) / (0.5 * W);
  float sun = exp(-u * u * 1.2);           // brightest in the middle, a long even band toward the sides

  // a short band hugging the edge, a little taller and whiter in the middle
  float t = max(d, 0.0) / (uReach * mix(0.55, 1.0, sun)) + (1.0 - sun) * 0.15;
  float ga = (1.0 - smoothstep(0.25, 0.9, t)) * mix(0.7, 1.0, sun);
  vec3 sky = ramp(t) * ga;

  // the dark, with a faint graphite sheen just inside the edge
  float haze = exp(min(d, 0.0) / 30.0) * mix(0.12, 0.25, sun);
  vec3 dark = mix(uDark, uGraphite, haze);
  float cov = clamp(0.5 - d, 0.0, 1.0);

  vec3 col = sky * (1.0 - cov) + dark * cov;
  float a = ga * (1.0 - cov) + cov;
  // a crisp hairline: white in the middle, steel toward the sides, like the lit edge of a polished part
  float rim = exp(-abs(d) / 0.7) * mix(0.75, 1.0, sun);
  col = mix(uSteel, vec3(1.0), sun) * rim + col * (1.0 - rim);
  a = rim + a * (1.0 - rim);
  outColor = vec4(col, a);
}`;
