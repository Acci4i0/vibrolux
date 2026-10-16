'use client';

import { gsap, SplitText, prefersReducedMotion } from './gsap';
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
  if (el instanceof HTMLElement && el.dataset.lines !== undefined) return revealLines(el, { delay: opts.delay, split: el.dataset.lines || undefined });
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
 * Photo entrance (ours, see ANIM.media): the box starts as a sharp-cornered inset and opens into its rounded frame
 * (the parent clips it: overflow hidden + radius) while the picture settles from a zoom. `drift` then slides the
 * picture inside the frame with the scroll, so it keeps a little extra scale. The pre-state lives in CSS
 * ([data-media-reveal]) so nothing flashes before this runs.
 */
export function revealMedia(box: HTMLElement | null, { drift = false }: { drift?: boolean } = {}) {
  if (!box) return;
  const m = ANIM.media;
  const done = () => (box.dataset.mediaReveal = 'done');
  if (prefersReducedMotion()) return done();
  const rest = drift ? m.drift.scale : 1;
  const from = m.scale * rest;
  // the box is zoomed too, so the inset must be cut deeper to leave `open` of the frame visible
  const inset = `${(((1 - m.open / from) / 2) * 100).toFixed(2)}%`;
  gsap.fromTo(
    box,
    { clipPath: `inset(${inset} ${inset} ${inset} ${inset})`, scale: from },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: rest,
      duration: m.duration,
      ease: m.ease,
      immediateRender: true,
      onStart: done,
      clearProps: 'clipPath',
      scrollTrigger: { trigger: box, start: m.start, once: true },
    },
  );
  if (drift)
    gsap.fromTo(
      box,
      { yPercent: -m.drift.yPercent },
      { yPercent: m.drift.yPercent, ease: 'none', scrollTrigger: { trigger: box.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
}

/**
 * Line-by-line entrance for large text (ours, see ANIM.lines): `el` (the [data-reveal] holder) or its `split`
 * descendants are cut into masked lines that rise into place once; re-split on resize (autoSplit) without replaying.
 * reveal() comes here by itself for elements marked data-lines (data-lines="p": split the paragraphs inside).
 */
export function revealLines(el: HTMLElement | null, opts: { delay?: number; split?: string } = {}) {
  if (!el) return;
  if (prefersReducedMotion()) return done(el);
  const targets = opts.split ? Array.from(el.querySelectorAll<HTMLElement>(opts.split)) : [el];
  const { yPercent, duration, stagger, ease } = ANIM.lines;
  let played = false;
  SplitText.create(targets, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self) {
      done(el);
      if (played) return;
      return gsap.from(self.lines, {
        yPercent,
        duration,
        stagger,
        ease,
        delay: opts.delay ?? 0,
        onStart: () => void (played = true),
        scrollTrigger: { trigger: el, start: ANIM.reveal.start, once: true },
      });
    },
  });
}

/** Counts the number at the start of `el` up from zero (keeps its decimals and whatever follows: "2000 mq", "0,01"). */
export function countUp(el: HTMLElement, opts: { delay?: number; trigger?: Element | null } = {}) {
  const m = el.textContent?.match(/^(\d+)(?:([.,])(\d+))?/);
  if (!m || prefersReducedMotion()) return;
  const [whole, int, sep = '', dec = ''] = m;
  const rest = el.textContent!.slice(whole.length);
  const target = parseFloat(`${int}.${dec || 0}`);
  const n = { v: 0 };
  const paint = () => (el.textContent = n.v.toFixed(dec.length).replace('.', sep) + rest);
  gsap.to(n, {
    v: target,
    duration: ANIM.countUp.duration,
    ease: ANIM.countUp.ease,
    delay: opts.delay ?? 0,
    immediateRender: true,
    onUpdate: paint,
    onStart: paint,
    scrollTrigger: { trigger: opts.trigger ?? el, start: ANIM.reveal.start, once: true },
  });
  paint();
}

/**
 * Runs `setup` after the original's 500ms mount delay, inside the caller's gsap.context
 * (contextSafe) so everything is reverted on unmount.
 */
export function afterMount(setup: () => void, contextSafe: (fn: () => void) => () => void, delay: number = ANIM.revealSetupDelay) {
  const id = window.setTimeout(contextSafe(setup), delay);
  return () => window.clearTimeout(id);
}
