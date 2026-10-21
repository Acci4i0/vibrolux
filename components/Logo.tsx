'use client';

import { useId } from 'react';
import { gsap } from '@/lib/gsap';
import { CIRCLE, V, WORD, WORD_OFFSET, VIEWBOX, MARK_VIEWBOX } from './logoData';

/**
 * Vibrolux logo (vector, from the brochure). Circle = brand navy, V + wordmark = currentColor.
 * Under the logo sits a hidden black copy of the V and the letters ([data-ink]): shown, on white pages, it draws the line
 * round the white logo and fills the hairline cuts between the parts of the letters, as the dark ground does on the
 * original. All the black is drawn first and all the white on top, so where parts overlap no line shows.
 * logoTimeline(svg) is the build animation (0→1): circle grows from a point, the V halves drop in,
 * letters rise out of a slot left → right. Header plays it after the loader, footer scrubs it on scroll.
 */
export function logoTimeline(svg: SVGSVGElement) {
  const q = gsap.utils.selector(svg);
  return gsap
    .timeline({ paused: true })
    .from(q('[data-circle]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(1.7)' }, 0)
    .from(q('[data-v]'), { y: -40, autoAlpha: 0, duration: 0.3, stagger: byIndex(0.08), ease: 'power3.out' }, 0.15)
    .from(q('[data-letter]'), { y: 44, duration: 0.3, stagger: byIndex(0.012), ease: 'power3.out' }, 0.35);
}

/** a white shape and its black copy share an index, so they move together */
function byIndex(step: number) {
  return (_: number, el: Element) => Number(el.getAttribute('data-i')) * step;
}

type Props = { className?: string; mark?: boolean; ref?: React.Ref<SVGSVGElement> };

export function Logo({ className, mark = false, ref }: Props) {
  const clip = useId();
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
    <svg ref={ref} className={className} viewBox={mark ? MARK_VIEWBOX : VIEWBOX} fill="currentColor" role="img" aria-label="Vibrolux">
      <clipPath id={clip}>
        <rect x={-2} y={-10} width={272} height={48.5} />
      </clipPath>
      <path data-circle d={CIRCLE} fill="var(--color-brand)" />
      <g data-ink visibility="hidden">
        {V.map((d, i) => (
          <path key={i} data-v data-i={i} d={d} />
        ))}
        {word()}
      </g>
      {V.map((d, i) => (
        <path key={i} data-v data-i={i} d={d} />
      ))}
      {word()}
    </svg>
  );
}
