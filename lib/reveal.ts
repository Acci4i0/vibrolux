'use client';

import { gsap, prefersReducedMotion } from './gsap';
import { ANIM } from '@/config/animations';

type RevealOpts = { delay?: number; y?: number; duration?: number; ease?: string };

const done = (els: Element | Element[]) =>
  gsap.utils.toArray<HTMLElement>(els).forEach((el) => (el.dataset.reveal = 'done'));

/**
 * Single-element reveal (original `v-animate-in`): from y:40 / autoAlpha:0,
 * ScrollTrigger "top bottom", once. Elements carry data-reveal so CSS keeps them
 * hidden until JS takes over (no flash before hydration).
 */
export function reveal(el: Element | null, opts: RevealOpts = {}) {
  if (!el) return;
  if (prefersReducedMotion()) return done(el);
  const { y, duration, ease, start } = ANIM.reveal;
  return gsap.from(el, {
    y: opts.y ?? y,
    autoAlpha: 0,
    duration: opts.duration ?? duration,
    ease: opts.ease ?? ease,
    delay: opts.delay ?? 0,
    force3D: true,
    immediateRender: true,
    onStart: () => done(el),
    clearProps: 'y,transform,opacity,visibility',
    scrollTrigger: { trigger: el, start, once: true },
  });
}

/** Staggered list reveal (original `v-animate-in-stagger`): trigger is the container. */
export function revealStagger(
  container: Element | null,
  children: ArrayLike<Element>,
  opts: RevealOpts & { stagger?: number } = {},
) {
  if (!container || !children.length) return;
  const els = Array.from(children);
  if (prefersReducedMotion()) return done(els);
  const { y, duration, ease, start } = ANIM.reveal;
  return gsap.from(els, {
    y: opts.y ?? y,
    autoAlpha: 0,
    duration: opts.duration ?? duration,
    ease: opts.ease ?? ease,
    delay: opts.delay ?? 0,
    stagger: opts.stagger ?? ANIM.revealStagger.stagger,
    force3D: true,
    immediateRender: true,
    onStart: () => done(els),
    clearProps: 'y,transform,opacity,visibility',
    scrollTrigger: { trigger: container, start, once: true },
  });
}

/**
 * Runs `setup` after the original's 500ms mount delay, inside the caller's gsap.context
 * (contextSafe) so everything is reverted on unmount.
 */
export function afterMount(setup: () => void, contextSafe: (fn: () => void) => () => void, delay: number = ANIM.revealSetupDelay) {
  const id = window.setTimeout(contextSafe(setup), delay);
  return () => window.clearTimeout(id);
}
