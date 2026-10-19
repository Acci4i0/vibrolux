'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import type { MediaData } from '../Media';
import { MediaCard } from './MediaCardGroup';
import s from './LavorazioniGrid.module.css';

type Tile = { title: string; href: string; media: MediaData };

/**
 * Lavorazioni tiles: an optional eyebrow and a grid of the reference's media cards
 * (t1energy.com/technology): square photo, large radius, the name in a blurred pill with an arrow.
 */
export function LavorazioniGrid({ eyebrow, tiles }: { eyebrow?: string; tiles: Tile[] }) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        root.current!.querySelectorAll('[data-reveal]:not([data-tile])').forEach((el, i) => reveal(el, { delay: i * 0.1 }));
        revealStagger(grid.current, grid.current!.children, { stagger: ANIM.news.listStagger });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} className={`${s.section} ${eyebrow ? '' : s.bare}`}>
      {eyebrow && (
        <div className={s.head}>
          <h2 className="t-eyebrow" data-reveal="">
            {eyebrow}
          </h2>
        </div>
      )}

      <div ref={grid} className={s.grid} data-total={tiles.length}>
        {tiles.map((t) => (
          <MediaCard key={t.href} label={t.title} href={t.href} media={t.media} data-reveal="" data-tile="" />
        ))}
      </div>
    </section>
  );
}
