'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import type { MediaData } from '../Media';
import { MediaCard } from './MediaCardGroup';
import s from './LavorazioniGrid.module.css';

type Tile = { title: string; href: string; media: MediaData };
type Intro = { eyebrow: string; headline: string; text: string; facts: { label: string; value: string }[] };

/**
 * Lavorazioni index: optional intro (headline + facts row) and a grid of the reference's media cards
 * (t1energy.com/technology): square photo, large radius, the name in a blurred pill with an arrow.
 */
export function LavorazioniGrid({ intro, eyebrow, tiles }: { intro?: Intro; eyebrow?: string; tiles: Tile[] }) {
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
    <section ref={root} className={s.section}>
      {(intro || eyebrow) && (
        <div className={s.head}>
          <h2 className="t-eyebrow" data-reveal="">
            {intro?.eyebrow ?? eyebrow}
          </h2>
          {intro && (
            <>
              <p className={s.headline} data-reveal="">
                {intro.headline}
              </p>
              <div className={s.sub} data-reveal="">
                <p className={s.text}>{intro.text}</p>
              </div>
              <dl className={s.facts} data-reveal="">
                {intro.facts.map((f) => (
                  <div key={f.label} className={s.fact}>
                    <dt className="t-mono">{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
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
