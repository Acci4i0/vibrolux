'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM, MOTION_OK } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import { Icon } from '../Icon';
import s from './MaterialsAccordion.module.css';

type Item = { id?: string; title: string; text: string; media: MediaData; href?: string };

export function MaterialsAccordion({ data }: { data: { eyebrow: string; more: string; items: Item[] } }) {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(0);

  // /page#item-id opens that item (links from nav/footer)
  useEffect(() => {
    const fromHash = () => {
      const i = data.items.findIndex((it) => it.id && `#${it.id}` === location.hash);
      if (i >= 0) setActive(i);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [data.items]);

  useGSAP(
    (_, contextSafe) => {
      const { scrub } = ANIM.accordion;
      gsap.matchMedia().add(`${scrub.media} and ${MOTION_OK}`, () => {
        gsap.to(bg.current, {
          scale: () => (100 - scrub.shrinkK / window.innerWidth) / 100,
          borderRadius: scrub.borderRadius,
          ease: 'none',
          force3D: true,
          scrollTrigger: { trigger: bg.current, start: scrub.start, end: scrub.end, scrub: true },
        });
      });
      return afterMount(() => {
        root.current!.querySelectorAll('[data-reveal]').forEach((el) => reveal(el));
      }, contextSafe!);
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.module}>
      <div ref={bg} className={s.bg} />
      <div className={s.inner}>
        <div className={s.mediaCol}>
          {data.items.map((it, i) => (
            <div key={i} className={`${s.media} ${active === i ? s.isActive : ''}`}>
              <Media {...it.media} />
            </div>
          ))}
        </div>
        <div className={s.content}>
          <div className={s.accordions}>
            <div className={s.heading} data-reveal="">
              <h2 className="t-eyebrow">{data.eyebrow}</h2>
            </div>
            {data.items.map((it, i) => (
              <div key={i} id={it.id} className={`${s.dropdown} ${active === i ? s.isOpen : ''}`} data-reveal="">
                <button type="button" className={s.header} aria-expanded={active === i} onClick={() => setActive(active === i ? null : i)}>
                  <span className={s.title}>{it.title}</span>
                  <span className={s.toggle} aria-hidden>
                    <Icon name="plus" className={s.plus} />
                    <Icon name="minus" className={s.minus} />
                  </span>
                </button>
                <div className={s.panel}>
                  <div className={`t-mono ${s.panelInner}`}>
                    <p>{it.text}</p>
                    {it.href && (
                      <a href={it.href} className={s.more}>
                        {data.more} <Icon name="arrow" className={s.moreIcon} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
