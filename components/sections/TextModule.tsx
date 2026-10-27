'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Button } from '../Button';
import { Rings } from '../Rings';
import s from './TextModule.module.css';

type Data = { id?: string; eyebrow?: string; paragraphs: string[]; cta?: { label: string; href: string } };

/** `rings`: the signature, large and faint, behind the text (Lavorazioni only) */
export function TextModule({ data, rings = false }: { data: Data; rings?: boolean }) {
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
    <section ref={root} id={data.id} className={`${s.text} ${rings ? s.withRings : ''}`}>
      {rings && <Rings className={s.rings} rings={9} />}
      <div className={s.inner}>
        <div ref={eyebrow} className={s.eyebrow} data-reveal="">
          {data.eyebrow && <h2 className="t-eyebrow">{data.eyebrow}</h2>}
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
