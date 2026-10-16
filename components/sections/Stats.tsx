'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Button } from '../Button';
import { Media, type MediaData } from '../Media';
import s from './Stats.module.css';

type Data = {
  eyebrow: string;
  text: string;
  cta: { label: string; href: string };
  items: { value: string; caption: string }[];
  media: MediaData;
};

export function Stats({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(eyebrow.current);
        revealStagger(list.current, list.current!.children, {
          delay: ANIM.stats.statsDelay,
          stagger: ANIM.stats.statsStagger,
        });
        reveal(content.current, { delay: ANIM.stats.contentDelay });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} className={s.stats}>
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{data.eyebrow}</h2>
        </div>
        <div ref={content} className={s.contentCol} data-reveal="">
          <div className={s.content}>
            <p className="t-large">{data.text}</p>
            <Button href={data.cta.href} label={data.cta.label} variant="outline" className={s.cta} />
          </div>
          <div ref={list} className={s.list}>
            {data.items.map((it, i) => (
              <div key={i} className={s.stat} data-reveal="">
                <div className={s.value}>{it.value}</div>
                <div className={`t-mono ${s.caption}`}>{it.caption}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.media}>
          <Media {...data.media} />
        </div>
      </div>
    </section>
  );
}
