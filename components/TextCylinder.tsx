'use client';

import { useEffect, useRef, useState } from 'react';
import s from './TextCylinder.module.css';

type Letter = { ch: string; angle: number; row: number };

/**
 * A word wrapped twice around a cylinder in a single ring; the cylinder spins on its axis while the
 * axis tumbles (CSS 3D, the letters are real text in the display face). Sizes are in em of a font-size set in container
 * units, so the cylinder scales with its box without measuring again. Reduced motion stops on the front view.
 */
export function TextCylinder({ word, className }: { word: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ letters: Letter[]; radius: number } | null>(null);

  useEffect(() => {
    const face = root.current?.querySelector(`.${s.tumble}`);
    if (!face) return;
    let cancelled = false;
    const font = `700 100px ${getComputedStyle(face).fontFamily}`;
    // measure once the display face is in (or with the fallback if it never arrives)
    const measure = () => {
      if (cancelled) return;
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return;
      ctx.font = font;
      const chars = [...word];
      const adv = chars.map((ch) => ctx.measureText(ch).width / 100); // em
      const wordW = adv.reduce((a, b) => a + b, 0);
      const span = wordW + GAP;
      const circ = COPIES * span;
      const letters: Letter[] = [];
      ROWS.forEach(({ row, offset }) => {
        let x = offset * span;
        for (let k = 0; k < COPIES; k++) {
          chars.forEach((ch, i) => {
            letters.push({ ch, row, angle: ((x + adv[i] / 2) / circ) * 360 });
            x += adv[i];
          });
          x += GAP;
        }
      });
      setLayout({ letters, radius: circ / (2 * Math.PI) });
    };
    document.fonts.load(font).then(measure, measure);
    return () => {
      cancelled = true;
    };
  }, [word]);

  // spinning only while on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (el.dataset.paused = e.isIntersecting ? 'false' : 'true'));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className={`${s.box} ${className ?? ''}`} role="img" aria-label={word}>
      <div className={s.stage}>
        <div className={s.tumble}>
          <div className={s.spin} aria-hidden="true">
            {layout?.letters.map((l, i) => (
              <span
                key={i}
                className={s.ch}
                style={{
                  transform: `translate(-50%, -50%) rotateY(${l.angle}deg) translateZ(${layout.radius}em) translateY(${l.row * ROW_HEIGHT}em)`,
                }}
              >
                {l.ch}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const COPIES = 2; // the word goes round twice
const GAP = 0.9; // em between the copies
const ROW_HEIGHT = 0.82; // em between rows
const ROWS = [{ row: 0, offset: 0 }]; // a single ring
