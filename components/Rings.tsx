'use client';

import { useId, useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { ANIM } from '@/config/animations';

/**
 * Vibrolux's graphic signature: concentric rings (rotation, the bowl seen from above, the marks of the lathe) cut along a
 * line at 58°, the angle of the arms of the V; one half has slipped along the cut, as a part does in the vibrating bowl.
 * Lines only, never filled, so it never reads as a second mark next to the full circle of the logo.
 * Used sparingly and always in the same places: the numbers of «Perché Vibrolux», the divider before a page's closing
 * section, faint behind the Lavorazioni text. With the scroll the half slips into place and the rings turn a few degrees.
 * Colour = currentColor; the lines keep their width at any size.
 */

const ANGLE = (58 * Math.PI) / 180;
const C = 50; // centre of the 100 × 100 box
const R = 46; // outer ring

type Props = { rings?: number; strokeWidth?: number; animate?: boolean; className?: string };

export function Rings({ rings = 6, strokeWidth = 1, animate = true, className }: Props) {
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  const r0 = R * 0.28;
  const step = (R - r0) / (rings - 1);
  const ux = Math.cos(ANGLE), uy = -Math.sin(ANGLE); // along the cut, up and to the right
  const nx = -uy, ny = ux; // across it
  const shift = step * 0.55; // how far the half slips: about half the space between two rings
  const gap = 1.6; // the cut itself
  // a half-plane on one side of the cut, as a long quadrilateral
  const half = (side: 1 | -1) =>
    [[(side * gap) / 2, -200], [side * 200, -200], [side * 200, 200], [(side * gap) / 2, 200]]
      .map(([a, b]) => `${(C + nx * a + ux * b).toFixed(2)},${(C + ny * a + uy * b).toFixed(2)}`)
      .join(' ');
  const circles = Array.from({ length: rings }, (_, i) => (
    <circle key={i} cx={C} cy={C} r={(r0 + i * step).toFixed(2)} vectorEffect="non-scaling-stroke" />
  ));

  useGSAP(
    () => {
      if (!animate || prefersReducedMotion()) return;
      const { turn, start, end, scrub } = ANIM.rings;
      gsap
        .timeline({ scrollTrigger: { trigger: svg.current, start, end, scrub } })
        .from(svg.current!.querySelector('[data-slip]'), { x: 0, y: 0, ease: 'none' }, 0)
        .from(svg.current!.querySelector('[data-turn]'), { rotation: turn, svgOrigin: `${C} ${C}`, ease: 'none' }, 0);
    },
    { scope: svg },
  );

  return (
    <svg ref={svg} className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden>
      <clipPath id={`${id}a`}>
        <polygon points={half(1)} />
      </clipPath>
      <clipPath id={`${id}b`}>
        <polygon points={half(-1)} />
      </clipPath>
      <g data-turn="">
        <g clipPath={`url(#${id}a)`}>{circles}</g>
        <g clipPath={`url(#${id}b)`}>
          <g data-slip="" transform={`translate(${(ux * shift).toFixed(2)} ${(uy * shift).toFixed(2)})`}>
            {circles}
          </g>
        </g>
      </g>
    </svg>
  );
}
