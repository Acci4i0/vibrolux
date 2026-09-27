'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { company, content } from '@/content/site';
import { useLang } from '@/lib/i18n';
import s from './Contact.module.css';

/** Address + mail list (one address per need) + contact rows + map, laid out like the text modules. */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const t = content[useLang()];
  const c = t.contatti;
  const rows = [
    [c.keys.tel, company.tel, company.telHref],
    [c.keys.pec, company.pec, `mailto:${company.pec}`],
    [c.keys.vat, company.vatNumber],
  ];

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        const [eyebrow, content, map] = root.current!.querySelectorAll('[data-reveal]');
        reveal(eyebrow, { delay: ANIM.text.eyebrowDelay });
        reveal(content, { delay: ANIM.text.contentDelay });
        reveal(map);
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} id="dove-siamo" className={s.contact}>
      <div className={s.inner}>
        <div className={s.eyebrow} data-reveal="">
          <h2 className="t-eyebrow">{c.eyebrow}</h2>
        </div>
        <div className={s.content} data-reveal="">
          <address className="t-large">
            {[company.name, ...t.address].map((l) => (
              <span key={l} className={s.line}>
                {l}
              </span>
            ))}
          </address>
          <ul className={s.mails}>
            {c.emails.map((m) => (
              <li key={m.address}>
                <a href={`mailto:${m.address}`}>{m.address}</a>
                <span className={`t-mono ${s.use}`}>{m.use}</span>
              </li>
            ))}
          </ul>
          <ul className={`t-mono ${s.rows}`}>
            {rows.map(([k, v, href]) => (
              <li key={k}>
                <span className={s.key}>{k}</span>
                {href ? <a href={href}>{v}</a> : <span>{v}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={s.map} data-reveal="">
        {/* Google's card/controls sit on the iframe edges and got cut by the rounded corners:
            the real map is inset so they stay whole; an oversized, inert, blurred copy of the view
            (its own UI pushed far outside the box) makes a frosted rim up to the rounded edge.
            Blurred on purpose: two Google embeds of different sizes never align pixel-perfect. */}
        <iframe className={s.mapBackdrop} src={company.maps} title="" aria-hidden tabIndex={-1} loading="lazy" />
        <iframe className={s.mapFront} src={company.maps} title={c.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </section>
  );
}
