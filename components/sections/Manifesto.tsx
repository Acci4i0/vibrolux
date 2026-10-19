'use client';

import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import s from './Manifesto.module.css';

type Data = { eyebrow: string; text: string };

/**
 * A statement on a full-width card in the brand colour (reference: on.energy's manifesto): the words light up
 * one after another as the card scrolls through the screen.
 */
export function Manifesto({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useRef<HTMLHeadingElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (!prefersReducedMotion()) {
        const { from, start, end } = ANIM.manifesto;
        gsap.fromTo(
          text.current!.children,
          { opacity: from },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: text.current, start, end, scrub: true } },
        );
      }
      return afterMount(() => reveal(eyebrow.current), contextSafe!);
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.section}>
      <div className={s.card}>
        <h2 ref={eyebrow} className="t-eyebrow" data-reveal="">
          {data.eyebrow}
        </h2>
        <p ref={text} className={s.text}>
          {data.text.split(' ').map((w, i) => (
            <span key={i}>{w} </span>
          ))}
        </p>
      </div>
    </section>
  );
}
