'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import s from './LavorazioniGrid.module.css';

type Tile = { label: string; title: string; text: string; href: string; media: MediaData };
type Intro = { eyebrow: string; headline: string; text: string; facts: { label: string; value: string }[] };

/**
 * Lavorazioni index: optional intro (headline + facts row) and a grid of full-bleed image tiles
 * in the T1 media-card language — blurred number pill, arrow button, title on a gradient,
 * one-line description and image zoom on hover.
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
          <a key={t.href} href={t.href} className={s.tile} data-reveal="" data-tile="">
            <Media {...t.media} className={s.media} style={{ position: 'absolute', inset: 0, height: '100%' }} />
            <span className={`t-mono ${s.num}`}>{t.label}</span>
            <span className={s.arrow} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </span>
            <span className={s.body}>
              <span className={s.title}>{t.title}</span>
              <span className={s.desc}>{t.text}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
