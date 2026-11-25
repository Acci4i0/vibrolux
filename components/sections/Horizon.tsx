'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { ANIM } from '@/config/animations';
import { brighter, fullscreenTriangle, glProgram, tokenRgb } from '@/lib/gl';
import s from './Horizon.module.css';

const C = ANIM.horizon;

/**
 * A dark chapter between two white sections, after the reference's sunrise seen from orbit, in Vibrolux blue.
 * In: the dark rises from below as the edge of a planet, glowing white in the middle and blue toward the sides, its
 * curve flattening as it climbs. Then it fills the screen and holds one word. Out: the dark lifts away, its lower edge
 * hanging from the top (the corners clear first) and straightening into a flat glow over the section that follows.
 * One fragment shader on a canvas that stays on screen while the section passes (sticky), drawn only when the
 * scroll moves it. Without WebGL2: a plain black band with a still glow above and below.
 */
export function Horizon({ data }: { data: { title: string } }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const stopGL = startGL(reduced);
      const el = title.current!;
      if (reduced) el.dataset.reveal = 'done';
      else
        gsap.from(el, {
          ...C.title,
          autoAlpha: 0,
          immediateRender: true,
          onStart: () => void (el.dataset.reveal = 'done'),
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: body.current, start: C.titleStart, once: true },
        });
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
    const brand = tokenRgb('--color-brand', [0.13, 0.25, 0.43]);
    gl.uniform3fv(u('uDark'), tokenRgb('--color-black', [0.06, 0.05, 0.07]));
    gl.uniform3fv(u('uBrand'), brand);
    gl.uniform3fv(u('uBright'), brighter(brand));
    gl.uniform3fv(u('uIce'), brighter(brand, 0.8, 0.88));

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
        <div className={s.hold}>
          <h2 ref={title} className={s.title} data-reveal="">
            {data.title}
          </h2>
        </div>
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
uniform vec3 uBrand;
uniform vec3 uBright;
uniform vec3 uIce;
out vec4 outColor;

// the glow from the edge outwards: white where the sun is, ice, a bright blue, toward the navy, then the page
vec3 ramp(float t) {
  vec3 c = mix(vec3(1.0), uIce, smoothstep(0.0, 0.14, t));
  c = mix(c, uBright, smoothstep(0.12, 0.45, t));
  return mix(c, mix(uBright, uBrand, 0.5), smoothstep(0.42, 0.8, t));
}

void main() {
  float W = uRes.x / uDpr;
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  // the dark is inside both circles: the upper edge bulges up (centre below), the lower edge hangs down (centre above)
  float dTop = length(p - vec2(0.5 * W, uTop + uRTop)) - uRTop;
  float dBot = length(p - vec2(0.5 * W, uBot - uRBot)) - uRBot;
  float d = max(dTop, dBot);               // > 0 on the page, < 0 in the dark
  float u = (p.x - 0.5 * W) / (0.5 * W);
  float sun = exp(-u * u * 2.5);           // 1 in the middle, toward 0 at the sides

  // the glow reaches furthest and starts hottest in the middle; at the sides it is thinner and starts already blue
  float t = max(d, 0.0) / (uReach * mix(0.3, 1.0, sun)) + (1.0 - sun) * 0.3;
  float ga = (1.0 - smoothstep(0.3, 0.95, t)) * mix(0.6, 1.0, sun);
  vec3 sky = ramp(t) * ga;

  // the dark, with a faint blue haze just inside the edge
  float haze = exp(min(d, 0.0) / 40.0) * mix(0.1, 0.22, sun);
  vec3 dark = mix(uDark, uBright, haze);
  float cov = clamp(0.5 - d, 0.0, 1.0);

  vec3 col = sky * (1.0 - cov) + dark * cov;
  float a = ga * (1.0 - cov) + cov;
  // a hairline rim: white where the sun is, blue toward the sides
  float rim = exp(-abs(d) / 0.9) * mix(0.55, 1.0, sun);
  col = mix(uBright, vec3(1.0), sun) * rim + col * (1.0 - rim);
  a = rim + a * (1.0 - rim);
  outColor = vec4(col, a);
}`;
