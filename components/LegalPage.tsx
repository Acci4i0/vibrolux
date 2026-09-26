'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import s from './LegalPage.module.css';

export type LegalSection = { id: string; title: string; content: React.ReactNode };

type Props = { title: string; intro: React.ReactNode; updated: string; sections: LegalSection[] };

/** Text page (Privacy, Termini): title + intro, sticky numbered index, numbered sections. */
export function LegalPage({ title, intro, updated, sections }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        root.current!.querySelectorAll('[data-reveal]').forEach((el) => reveal(el));
      }, contextSafe!),
    { scope: root },
  );

  const num = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <main ref={root} className={s.page}>
      <header className={s.top} data-reveal="">
        <h1 className={s.title}>{title}</h1>
        <div className={`t-large ${s.intro}`}>{intro}</div>
        <p className={`t-mono ${s.updated}`}>Ultimo aggiornamento · {updated}</p>
      </header>

      <div className={s.body}>
        <nav className={`t-mono ${s.index}`} aria-label="Indice">
          <ol>
            {sections.map((sec, i) => (
              <li key={sec.id}>
                <a href={`#${sec.id}`}>
                  <span className={s.num}>{num(i)}</span>
                  <span>{sec.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={s.sections}>
          {sections.map((sec, i) => (
            <section key={sec.id} id={sec.id} className={s.section} data-reveal="">
              <h2 className={s.h2}>
                <span className={`t-mono ${s.h2num}`}>{num(i)}</span>
                {sec.title}
              </h2>
              <div className={s.text}>{sec.content}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
