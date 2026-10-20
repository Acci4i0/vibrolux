'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import s from './MediaPair.module.css';

/** Two square photos, a large one leading and a small one beside it, tops aligned (reference: module-group is-left-leading). */
export function MediaPair({ media }: { media: MediaData[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(
        () => revealStagger(root.current, root.current!.querySelectorAll('[data-reveal]'), { delay: ANIM.hero.ctaDelay }),
        contextSafe!,
        ANIM.hero.setupDelay,
      ),
    { scope: root },
  );

  return (
    <section ref={root} className={s.pair}>
      {media.map((m, i) => (
        <div key={i} className={s.card} data-reveal="">
          <Media {...m} aspect={1} className={s.media} />
        </div>
      ))}
    </section>
  );
}
