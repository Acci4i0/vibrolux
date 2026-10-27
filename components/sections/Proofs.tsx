'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import s from './Proofs.module.css';

type Data = { eyebrow: string; items: { figure: string; text: string; link: { label: string; href: string } }[] };

/**
 * «Perché Vibrolux»: facts that can be checked instead of adjectives. Four columns on a hairline, each with the figure,
 * a line on it and the page that bears it out.
 */
export function Proofs({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(eyebrow.current);
        revealStagger(list.current, list.current!.children, { delay: ANIM.news.listDelay, stagger: ANIM.news.listStagger });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} className={s.proofs}>
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{data.eyebrow}</h2>
        </div>
      </div>
      <ul ref={list} className={s.list}>
        {data.items.map((it) => (
          <li key={it.figure} className={s.item} data-reveal="">
            <p className={s.figure}>{it.figure}</p>
            <p className={s.text}>{it.text}</p>
            <a className={s.link} href={it.link.href}>
              {it.link.label}
              <svg viewBox="0 0 14 14" aria-hidden>
                <path d="M1 7h12M8 2l5 5-5 5" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
