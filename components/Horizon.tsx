'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { ANIM } from '@/config/animations';
import { content } from '@/content/site';
import { langOf, pagePath } from '@/lib/i18n';
import { brighter, fullscreenTriangle, glProgram, tokenRgb } from '@/lib/gl';
import { Icon } from './Icon';
import s from './Horizon.module.css';

const C = ANIM.horizon;

/**
 * Every page ends on the horizon: after a stretch of white sky the footer rises as the night side of a planet, its edge
 * glowing white in the middle and blue toward the sides, and the curve flattens as you scroll until the dark fills the
 * screen and becomes the footer. There «Richiedi un preventivo» rises in (not on Contatti, which is that page).
 * One fragment shader (WebGL2), drawn only when the scroll moves it; without WebGL2 a still glow over a black band.
 */
export function Horizon() {
  const pathname = usePathname();
  const t = content[langOf(pathname)];
  const cta = pagePath(pathname) !== '/contatti';
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const link = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const stopGL = startGL(reduced);
      const el = link.current;
      if (el && !reduced) {
        gsap.from(el, {
          ...C.cta,
          autoAlpha: 0,
          immediateRender: true,
          onStart: () => void (el.dataset.reveal = 'done'),
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: body.current, start: C.ctaStart, once: true },
        });
      } else if (el) el.dataset.reveal = 'done';
      return () => stopGL?.();
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
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
    const U = { res: u('uRes'), dpr: u('uDpr'), limb: u('uLimb'), r: u('uR'), reach: u('uReach') };
    // the planet is the footer's own black; the blues come from the Vibrolux navy
    const brand = tokenRgb('--color-brand', [0.13, 0.25, 0.43]);
    gl.uniform3fv(u('uPlanet'), tokenRgb('--color-black', [0.06, 0.05, 0.07]));
    gl.uniform3fv(u('uBrand'), brand);
    gl.uniform3fv(u('uBright'), brighter(brand));
    gl.uniform3fv(u('uIce'), brighter(brand, 0.8, 0.88));

    let W = 0, sky = 0, dpr = 1;
    const state = { p: 0 };
    const draw = () => {
      const vh = window.innerHeight;
      // the edge's way up the screen: 0 as it comes in at the bottom, 1 at the top
      const q = reduced ? C.still : gsap.utils.clamp(0, 1, (state.p * (sky + vh) - sky) / vh);
      const R = W * (C.radiusStart + (C.radiusEnd - C.radiusStart) * q ** C.flatten);
      gl.uniform2f(U.res, cv.width, cv.height);
      gl.uniform1f(U.dpr, dpr);
      gl.uniform1f(U.limb, sky);
      gl.uniform1f(U.r, R);
      gl.uniform1f(U.reach, sky * C.reach);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const resize = () => {
      W = el.clientWidth;
      sky = body.current!.offsetTop;
      // below the deepest point of the roundest curve (and its haze) the planet is plain black: CSS does it
      const R0 = W * C.radiusStart;
      const z = Math.ceil(R0 - Math.sqrt(Math.max(R0 * R0 - (W / 2) ** 2, 0)) + 140);
      const h = sky + z;
      el.style.setProperty('--z', `${z - 2}px`); // the black starts just under the canvas's last rows: no seam
      cv.style.height = `${h}px`;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(5e6 / (W * h)));
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(h * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const tween = reduced
      ? null
      : gsap.to(state, {
          p: 1,
          ease: 'none',
          onUpdate: draw,
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: () => `+=${body.current!.offsetTop + window.innerHeight}`,
            scrub: C.scrub,
            invalidateOnRefresh: true,
          },
        });

    return () => {
      ro.disconnect();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      delete el.dataset.gl;
    };
  }

  return (
    <div ref={root} className={s.horizon} data-horizon="" data-cta={cta ? '' : undefined}>
      <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
      <div className={s.sky} />
      <div ref={body} className={s.body}>
        {/* where the dark begins: the header steps aside from here (Header.tsx, useInFooter) */}
        <span className={s.edge} data-footer-edge="" />
        {cta && (
          <a ref={link} href={t.to('/contatti')} className={s.cta} data-reveal="">
            {t.ui.requestQuote}
            <Icon name="arrow" />
          </a>
        )}
      </div>
    </div>
  );
}

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;    // canvas, device px
uniform float uDpr;
uniform float uLimb;  // top of the planet, CSS px from the canvas top
uniform float uR;     // its radius
uniform float uReach; // glow height above the edge, in the middle
uniform vec3 uPlanet;
uniform vec3 uBrand;
uniform vec3 uBright;
uniform vec3 uIce;
out vec4 outColor;

// the glow from the edge outwards: white where the sun is, ice, a bright blue, the Vibrolux navy, then the page
vec3 ramp(float t) {
  vec3 c = mix(vec3(1.0), uIce, smoothstep(0.0, 0.14, t));
  c = mix(c, uBright, smoothstep(0.12, 0.45, t));
  // toward the navy, but only halfway: navy thinned over white reads as grey smoke
  return mix(c, mix(uBright, uBrand, 0.5), smoothstep(0.42, 0.8, t));
}

void main() {
  float W = uRes.x / uDpr;
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 c = vec2(0.5 * W, uLimb + uR);
  float d = length(p - c) - uR;            // > 0 in the sky, < 0 on the planet
  float u = (p.x - c.x) / (0.5 * W);
  float sun = exp(-u * u * 2.5);           // 1 in the middle, toward 0 at the sides

  // the glow reaches furthest and starts hottest in the middle; at the sides it is thinner and starts already blue
  float t = max(d, 0.0) / (uReach * mix(0.3, 1.0, sun)) + (1.0 - sun) * 0.3;
  float ga = (1.0 - smoothstep(0.3, 0.95, t)) * mix(0.6, 1.0, sun);
  vec3 sky = ramp(t) * ga;

  // the planet, with a faint blue haze just inside the edge
  float haze = exp(min(d, 0.0) / 40.0) * mix(0.1, 0.22, sun);
  vec3 planet = mix(uPlanet, uBright, haze);
  float cov = clamp(0.5 - d, 0.0, 1.0);

  vec3 col = sky * (1.0 - cov) + planet * cov;
  float a = ga * (1.0 - cov) + cov;
  // a hairline rim: white where the sun is, blue toward the sides
  float rim = exp(-abs(d) / 0.9) * mix(0.55, 1.0, sun);
  col = mix(uBright, vec3(1.0), sun) * rim + col * (1.0 - rim);
  a = rim + a * (1.0 - rim);
  outColor = vec4(col, a);
}`;
