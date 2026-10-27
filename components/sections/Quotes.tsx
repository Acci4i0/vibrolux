'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { content } from '@/content/site';
import { useLang } from '@/lib/i18n';
import { Logo } from '../Logo';
import s from './Quotes.module.css';

type Data = { items: string[] };

/**
 * Statements in quotes, one at a time, as the method on fase2: the arrows turn them (the one going fades out, then the
 * next fades in), and under each the V of the logo in its colours. In the right half, as the text modules.
 */
export function Quotes({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const ui = content[useLang()].ui;
  const [index, setIndex] = useState(0);
  // a click on an arrow hides it with its quote: keyboard focus moves to the same arrow on the next one
  const refocus = useRef<'next' | 'prev' | null>(null);

  const go = (dir: 'next' | 'prev', e: React.MouseEvent<HTMLButtonElement>) => {
    refocus.current = document.activeElement === e.currentTarget ? dir : null;
    setIndex((i) => (i + (dir === 'next' ? 1 : -1) + data.items.length) % data.items.length);
  };

  useEffect(() => {
    if (!refocus.current) return;
    stack.current!.children[index].querySelector<HTMLButtonElement>(`[data-dir="${refocus.current}"]`)?.focus();
    refocus.current = null;
  }, [index]);

  useGSAP((_, contextSafe) => afterMount(() => reveal(stack.current), contextSafe!), { scope: root });

  return (
    <section ref={root} className={s.quotes} aria-roledescription="carousel">
      <div className={s.inner}>
        <div ref={stack} className={s.stack} data-reveal="" aria-live="polite">
          {data.items.map((q, i) => (
            <article key={q} className={`${s.item} ${i === index ? s.active : ''}`} aria-hidden={i !== index} inert={i !== index}>
              <p className={`t-large ${s.quote}`}>{q}</p>
              <div className={s.row}>
                <Logo className={s.logo} mark />
                <div className={s.controls}>
                  {(['prev', 'next'] as const).map((dir) => (
                    <button key={dir} type="button" className={`${s.button} ${s[dir]}`} data-dir={dir} onClick={(e) => go(dir, e)} aria-label={ui[dir]}>
                      <svg viewBox="0 0 14 14" aria-hidden>
                        <path d="M1 7h12M8 2l5 5-5 5" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
