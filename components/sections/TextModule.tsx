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
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(eyebrow.current, { delay: ANIM.text.eyebrowDelay });
        reveal(content.current, { delay: ANIM.text.contentDelay });
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} id={data.id} className={s.text}>
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{data.eyebrow}</h2>
        </div>
        <div ref={content} className={s.content} data-reveal="">
          <div className={`t-large ${s.body}`}>
            {data.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {data.cta && <Button href={data.cta.href} label={data.cta.label} variant="outline" />}
        </div>
      </div>
    </section>
  );
}
