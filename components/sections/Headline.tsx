'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import s from './Headline.module.css';

type Data = { id?: string; title: string; sub?: string };

/** A page that opens on white (reference: t1energy.com/company, module-headline): the title, and under it in grey where it comes from. */
export function Headline({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(
    (_, contextSafe) => afterMount(() => reveal(title.current, { delay: ANIM.hero.headlineDelay }), contextSafe!, ANIM.hero.setupDelay),
    { scope: root },
  );

  return (
    <section ref={root} id={data.id} className={s.headline}>
      <h1 ref={title} className={s.title} data-reveal="">
        {data.title}
        {data.sub && <span className={s.sub}>{data.sub}</span>}
      </h1>
    </section>
  );
}
