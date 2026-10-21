'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import { LogoShatter } from '../LogoShatter';
import s from './MediaPair.module.css';

/**
 * Two squares, a large one leading and a small one beside it, tops aligned (reference: module-group is-left-leading).
 * 'logo' in place of a photo puts the animated mark (LogoShatter) in that square.
 */
export function MediaPair({ media }: { media: (MediaData | 'logo')[] }) {
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
          {m === 'logo' ? <LogoShatter /> : <Media {...m} aspect={1} className={s.media} />}
        </div>
      ))}
    </section>
  );
}
