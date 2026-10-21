'use client';

import { useEffect, useRef } from 'react';
import { CIRCLE, V, MARK_VIEWBOX } from './logoData';
import s from './LogoShatter.module.css';

/**
 * The Vibrolux mark breaks into pieces that tumble in 3D, drift, and fall back into place, then rests (loop).
 * The circle is cut into ring sectors and a split core, each half of the V into two; every piece is the real vector
 * mark clipped to its cell. While the mark rests, the intact logo sits under the pieces so their seams never show.
 * Reduced motion: the logo stays still.
 */

// ── pieces, in the mark's viewBox units (0 0 66 50) ──
const CX = 33.68;
const CY = 24.76;
const R = 24.76;
const R_CORE = R * 0.5;

const pt = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
const sector = (r0: number, r1: number, a0: number, a1: number) => {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  if (r0 === 0) return `M${CX} ${CY}L${pt(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${pt(r1, a1)}Z`;
  return `M${pt(r1, a0)}A${r1} ${r1} 0 ${large} 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${pt(r0, a0)}Z`;
};
const deg = (d: number) => (d * Math.PI) / 180;

type Piece = { shape: 'circle' | 0 | 1; cell: string; cx: number; cy: number };

const PIECES: Piece[] = [
  // outer ring, eight uneven sectors
  ...[-100, -55, -20, 25, 62, 105, 150, 205, 260].slice(0, -1).map((a, i, arr) => {
    const b = i + 1 < arr.length ? arr[i + 1] : 260;
    const m = deg((a + b) / 2);
    return { shape: 'circle' as const, cell: sector(R_CORE, R + 1, deg(a), deg(b)), cx: CX + R * 0.75 * Math.cos(m), cy: CY + R * 0.75 * Math.sin(m) };
  }),
  // core, three wedges
  ...[
    [-90, 30],
    [30, 150],
    [150, 270],
  ].map(([a, b]) => {
    const m = deg((a + b) / 2);
    return { shape: 'circle' as const, cell: sector(0, R_CORE + 0.3, deg(a), deg(b)), cx: CX + R_CORE * 0.5 * Math.cos(m), cy: CY + R_CORE * 0.5 * Math.sin(m) };
  }),
  // the two strokes of the V, each cut in two
  { shape: 1, cell: 'M-1 -1H40V19H-1Z', cx: 10, cy: 10 },
  { shape: 1, cell: 'M-1 19H40V51H-1Z', cx: 25, cy: 29 },
  { shape: 0, cell: 'M20 -1H67V17H20Z', cx: 55, cy: 8 },
  { shape: 0, cell: 'M20 17H67V51H20Z', cx: 36, cy: 34 },
];

const LOOP = 6000; // ms
const REST = 'perspective(60em) translate3d(0%, 0%, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

/** seeded, so the choreography is the same at every visit */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function choreography() {
  const r = rng(7);
  const between = (a: number, b: number) => a + (b - a) * r();
  const sign = () => (r() < 0.5 ? -1 : 1);
  return PIECES.map((p) => {
    // away from the centre of the mark, plus some noise
    const dx = p.cx - CX + between(-8, 8);
    const dy = p.cy - CY + between(-8, 8);
    const len = Math.hypot(dx, dy) || 1;
    const dist = between(14, 42); // % of the mark's size
    const [ux, uy] = [dx / len, dy / len];
    const turns = [sign() * between(160, 420), sign() * between(160, 420), sign() * between(20, 120)];
    const t = (x: number, y: number, z: number, k: number) =>
      `perspective(60em) translate3d(${x.toFixed(1)}%, ${y.toFixed(1)}%, ${z.toFixed(0)}px) rotateX(${(turns[0] * k).toFixed(0)}deg) rotateY(${(turns[1] * k).toFixed(0)}deg) rotateZ(${(turns[2] * k).toFixed(0)}deg)`;
    const z1 = between(-120, 160);
    const out1 = t(ux * dist, uy * dist, z1, 1);
    const out2 = t(ux * dist * 0.8 + between(-14, 14), uy * dist * 0.8 + between(-14, 14), z1 * 0.6, 1.45);
    // land on a whole number of turns so the last frame is the logo again
    const full = (deg: number) => Math.round((deg * 1.45) / 360) * 360 || 360 * Math.sign(deg);
    const home = `perspective(60em) translate3d(0%, 0%, 0px) rotateX(${full(turns[0])}deg) rotateY(${full(turns[1])}deg) rotateZ(${full(turns[2])}deg)`;
    const d = between(-0.035, 0.035); // stagger
    return {
      d,
      origin: `${((p.cx / 66) * 100).toFixed(1)}% ${((p.cy / 50) * 100).toFixed(1)}%`,
      frames: [
        { offset: 0, transform: REST },
        { offset: 0.2 + d, transform: REST, easing: 'cubic-bezier(.6,0,.3,1)' },
        { offset: 0.44 + d, transform: out1, easing: 'cubic-bezier(.35,0,.65,1)' },
        { offset: 0.6 + d, transform: out2, easing: 'cubic-bezier(.55,0,.2,1)' },
        { offset: 0.84 + d, transform: home },
        { offset: 1, transform: home },
      ] as Keyframe[],
    };
  });
}

export function LogoShatter({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const plan = choreography();
    const pieces = el.querySelectorAll<HTMLElement>('[data-piece]');
    const anims = [...pieces].map((node, i) => {
      node.style.transformOrigin = plan[i].origin;
      return node.animate(plan[i].frames, { duration: LOOP, iterations: Infinity });
    });
    // the intact mark underneath, only while every piece is home: off as the first one leaves, on as the last one lands
    const leave = 0.2 + Math.min(...plan.map((p) => p.d));
    const back = 0.84 + Math.max(...plan.map((p) => p.d)) + 0.002;
    const intact = el.querySelector<HTMLElement>('[data-intact]')!;
    anims.push(
      intact.animate(
        [
          { offset: 0, opacity: 1 },
          { offset: leave, opacity: 1 },
          { offset: leave + 0.001, opacity: 0 },
          { offset: back - 0.001, opacity: 0 },
          { offset: back, opacity: 1 },
          { offset: 1, opacity: 1 },
        ],
        { duration: LOOP, iterations: Infinity },
      ),
    );
    const io = new IntersectionObserver(([e]) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause())));
    io.observe(el);
    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div ref={root} className={`${s.box} ${className ?? ''}`} role="img" aria-label="Vibrolux">
      <div className={s.mark} aria-hidden="true">
        <svg data-intact className={s.layer} viewBox={MARK_VIEWBOX}>
          <path d={CIRCLE} fill="var(--color-brand)" />
          {V.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
        {PIECES.map((p, i) => (
          <svg key={i} data-piece className={s.layer} viewBox={MARK_VIEWBOX}>
            <clipPath id={`vbx-piece-${i}`}>
              <path d={p.cell} />
            </clipPath>
            <path
              d={p.shape === 'circle' ? CIRCLE : V[p.shape]}
              fill={p.shape === 'circle' ? 'var(--color-brand)' : undefined}
              clipPath={`url(#vbx-piece-${i})`}
            />
          </svg>
        ))}
      </div>
    </div>
  );
}
