'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Scene } from '@/lib/vibratorScene';
import { prefersReducedMotion } from '@/lib/gsap';
import { Media, type MediaData } from './Media';

/** Seconds into the motion shown as the still (reduced motion), and where the motion starts. */
const STILL_AT = 10;
/** The build on arrival: it waits for the loader and the hero's own reveal, then brings the machine in. */
const INTRO = { delay: 1.6, duration: 4.5 };
const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));

/**
 * Draws the scene while the canvas is on screen and the tab visible (one still with reduced motion);
 * resolution steps down while the machine can't keep about 40 fps. Returns the teardown.
 */
function runScene(el: HTMLCanvasElement, s: Scene) {
  const still = prefersReducedMotion();
  let raf = 0, onScreen = true, t = STILL_AT, age = 0, last = 0;
  let maxDpr = 2, frames = 0, spent = 0;
  const loop = (now: number) => {
    if (last) {
      const dt = Math.min((now - last) / 1000, 0.1);
      t += dt;
      age += dt;
      if (maxDpr > 1 && ++frames > 10) {
        spent += (now - last) / 1000;
        if (frames === 70) {
          if (spent / 60 > 1 / 40) maxDpr = Math.max(1, maxDpr - 0.5);
          frames = spent = 0;
        }
      }
    }
    last = now;
    s.draw(t, maxDpr, ease((age - INTRO.delay) / INTRO.duration));
    raf = requestAnimationFrame(loop);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    last = frames = spent = 0;
    if (still) s.draw(STILL_AT);
    else if (onScreen && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    run();
  });
  io.observe(el);
  document.addEventListener('visibilitychange', run);
  const ro = new ResizeObserver(() => still && s.draw(STILL_AT));
  ro.observe(el);
  run();
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', run);
    s.dispose();
  };
}

/**
 * The circular vibrator, cut open, as a hero background: a canvas in the box Media would use. three.js loads
 * with this component only; without WebGL the photo stays.
 */
export function VibratorHero({ fallback, className, style }: { fallback: MediaData; className?: string; style?: CSSProperties }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = canvas.current!;
    const small = window.matchMedia('(max-width: 767px)').matches;
    let stop = () => {};
    let cancelled = false;
    import('@/lib/vibratorScene')
      .then(({ createVibratorScene }) => {
        if (cancelled) return;
        const scene = createVibratorScene(el, { chips: small ? 4500 : 11000, gears: small ? 6 : 10, shadows: !small });
        if (scene) stop = runScene(el, scene);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  if (failed) return <Media {...fallback} className={className} style={style} />;
  return (
    <div className={className} style={{ position: 'relative', width: '100%', display: 'block', background: '#000', ...style }}>
      <canvas
        ref={canvas}
        data-fill
        aria-hidden
        style={{ width: '100%', height: '100%', display: 'block', aspectRatio: fallback.aspect ?? 16 / 9 }}
      />
    </div>
  );
}
