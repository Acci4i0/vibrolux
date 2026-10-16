'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, countUp, reveal, revealStagger } from '@/lib/reveal';
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
  const content = useRef<HTMLParagraphElement>(null);
  const cta = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(eyebrow.current);
        const items = list.current!.children;
        revealStagger(list.current, items, {
          delay: ANIM.stats.statsDelay,
          stagger: ANIM.stats.statsStagger,
        });
        // each number counts up as its stat rises (ours, ANIM.countUp)
        Array.from(items).forEach((it, i) =>
          countUp(it.firstElementChild as HTMLElement, { delay: ANIM.stats.statsDelay + i * ANIM.stats.statsStagger, trigger: list.current }),
        );
        reveal(content.current, { delay: ANIM.stats.contentDelay });
        reveal(cta.current, { delay: ANIM.stats.contentDelay + ANIM.text.ctaAfterLines });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} className={s.stats}>
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{data.eyebrow}</h2>
        </div>
        <div className={s.contentCol}>
          <div className={s.content}>
            <p ref={content} className="t-large" data-reveal="" data-lines="">
              {data.text}
            </p>
            <Button ref={cta} href={data.cta.href} label={data.cta.label} variant="outline" className={s.cta} data-reveal="" />
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
          <Media {...data.media} motion="drift" />
        </div>
      </div>
    </section>
  );
}
