'use client';

import { useId } from 'react';
import { gsap } from '@/lib/gsap';
import { CIRCLE, V, WORD, WORD_OFFSET, VIEWBOX, MARK_VIEWBOX } from './logoData';

/**
 * Vibrolux logo (vector, from the brochure). Circle = brand navy, V + wordmark = currentColor.
 * The svg carries a silver gradient as --logo-silver: on white pages the header paints the V with it and the letters
 * navy, the logo's own colours on white (as on vibrolux.it).
 * logoTimeline(svg) is the build animation (0→1): circle grows from a point, the V halves drop in,
 * letters rise out of a slot left → right. Header plays it after the loader, footer scrubs it on scroll.
 */
export function logoTimeline(svg: SVGSVGElement) {
  const q = gsap.utils.selector(svg);
  const tl = gsap
    .timeline({ paused: true })
    .from(q('[data-circle]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(1.7)' }, 0)
    .from(q('[data-v]'), { y: -40, autoAlpha: 0, duration: 0.3, stagger: byIndex(0.08), ease: 'power3.out' }, 0.15);
  // the mark alone (Contatti) has no letters
  const letters = q('[data-letter]');
  if (letters.length) tl.from(letters, { y: 44, duration: 0.3, stagger: byIndex(0.012), ease: 'power3.out' }, 0.35);
  return tl;
}

/** the staggers follow the order of the parts */
function byIndex(step: number) {
  return (_: number, el: Element) => Number(el.getAttribute('data-i')) * step;
}

type Props = { className?: string; mark?: boolean; ref?: React.Ref<SVGSVGElement> };

export function Logo({ className, mark = false, ref }: Props) {
  const clip = useId();
  const silver = useId();
  const word = () =>
    !mark && (
      <g transform={`translate(${WORD_OFFSET[0]} ${WORD_OFFSET[1]})`}>
        {/* the "slot": letters rising from below stay hidden until they cross the baseline */}
        <g clipPath={`url(#${clip})`}>
          {WORD.map((w, i) => (
            <path key={i} data-letter data-i={i} d={w.d} fillRule={w.eo ? 'evenodd' : 'nonzero'} />
          ))}
        </g>
      </g>
    );
  return (
    <svg
      ref={ref}
      className={className}
      viewBox={mark ? MARK_VIEWBOX : VIEWBOX}
      fill="currentColor"
      role="img"
      aria-label="Vibrolux"
      style={{ '--logo-silver': `url("#${silver}")` } as React.CSSProperties}
    >
      <clipPath id={clip}>
        <rect x={-2} y={-10} width={272} height={48.5} />
      </clipPath>
      <linearGradient id={silver} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e6e8eb" />
        <stop offset="0.45" stopColor="#aeb4bc" />
        <stop offset="0.55" stopColor="#d2d6db" />
        <stop offset="1" stopColor="#848b95" />
      </linearGradient>
      <path data-circle d={CIRCLE} fill="var(--color-brand)" />
      {V.map((d, i) => (
        <path key={i} data-v data-i={i} d={d} />
      ))}
      {word()}
    </svg>
  );
}
