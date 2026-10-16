'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Button } from '../Button';
import s from './TextModule.module.css';

type Data = { id?: string; eyebrow: string; paragraphs: string[]; cta?: { label: string; href: string } };

export function TextModule({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(eyebrow.current, { delay: ANIM.text.eyebrowDelay });
        reveal(body.current, { delay: ANIM.text.contentDelay });
        reveal(cta.current, { delay: ANIM.text.contentDelay + ANIM.text.ctaAfterLines });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} id={data.id} className={s.text}>
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{data.eyebrow}</h2>
        </div>
        <div className={s.content}>
          <div ref={body} className={`t-large ${s.body}`} data-reveal="" data-lines="p">
            {data.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {data.cta && <Button ref={cta} href={data.cta.href} label={data.cta.label} variant="outline" data-reveal="" />}
        </div>
      </div>
    </section>
  );
}
