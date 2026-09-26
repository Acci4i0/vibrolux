'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import s from './Cards.module.css';

type Data = { eyebrow: string; text: string; items: { label: string; title: string; href: string; media: MediaData }[] };

/** Card row (reference: news module): label + title + media, staggered reveal. */
export function Cards({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(eyebrow.current);
        reveal(content.current, { delay: ANIM.news.contentDelay });
        revealStagger(list.current, list.current!.children, {
          delay: ANIM.news.listDelay,
          stagger: ANIM.news.listStagger,
        });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} className={s.news}>
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{data.eyebrow}</h2>
        </div>
        <div ref={content} className={s.content} data-reveal="">
          <p className="t-large">{data.text}</p>
        </div>
      </div>
      <div ref={list} className={s.list} data-total={data.items.length}>
        {data.items.map((it, i) => (
          <a key={i} href={it.href} className={s.card} data-reveal="">
            <div className={s.cardMedia}>
              <Media {...it.media} />
            </div>
            <div className={s.cardContent}>
              <div className="t-mono">{it.label}</div>
              <h3 className={s.cardTitle}>{it.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
