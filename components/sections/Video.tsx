'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { ANIM, MOTION_OK } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import s from './Video.module.css';

/**
 * A full-width film between two texts (reference: t1energy.com/company, a module-hero with only a video). As it
 * leaves the screen it shrinks to a rounded card, scrubbed like the Hero. Until the film arrives: the black placeholder.
 */
export function Video({ media }: { media: MediaData }) {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const { scrub } = ANIM.hero;
      gsap.matchMedia().add(`${scrub.media} and ${MOTION_OK}`, () => {
        gsap.to(bg.current, {
          scale: () => (100 - scrub.shrinkK / window.innerWidth) / 100,
          borderRadius: scrub.borderRadius,
          ease: 'none',
          force3D: true,
          scrollTrigger: { trigger: bg.current, start: scrub.start, end: scrub.end, scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.video}>
      <div ref={bg} className={s.bg}>
        <Media {...media} className={s.media} />
      </div>
    </section>
  );
}
