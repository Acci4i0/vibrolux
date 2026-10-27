'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { company, content, maps, place } from '@/content/site';
import { useLang } from '@/lib/i18n';
import s from './Contact.module.css';

/**
 * The three mail addresses as cards (what each is for, the address; the whole card writes the mail), the telephone,
 * the address and the VAT number in a row underneath; then the plant as the reference's factory card (aerial photo,
 * its name, a map card that opens Google Maps, a stats card).
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const t = content[useLang()];
  const c = t.contatti;

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        const [head, details, factory] = root.current!.querySelectorAll('[data-reveal]');
        reveal(head, { delay: ANIM.text.eyebrowDelay });
        const cards = root.current!.querySelector('[data-cards]');
        revealStagger(cards, cards!.children);
        reveal(details);
        reveal(factory);
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} id="dove-siamo" className={s.contact}>
      <div className={s.head} data-reveal="">
        <h2 className={`t-eyebrow ${s.eyebrow}`}>{c.eyebrow}</h2>
        <p className={s.lead}>{c.lead}</p>
      </div>
      <ul className={s.cards} data-cards="">
        {c.emails.map((m, i) => (
          <li key={m.address}>
            <a className={s.card} href={`mailto:${m.address}`}>
              <span className={`t-mono ${s.index}`}>{String(i + 1).padStart(2, '0')}</span>
              <svg className={s.arrow} viewBox="0 0 24 24" aria-hidden>
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
              <span className={s.cardText}>
                <span className={`t-mono ${s.use}`}>{m.use}</span>
                <span className={s.address}>{m.address}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <dl className={s.details} data-reveal="">
        <div>
          <dt className="t-mono">{c.keys.tel}</dt>
          <dd>
            <a href={company.telHref}>{company.tel}</a>
          </dd>
        </div>
        <div>
          <dt className="t-mono">{c.keys.address}</dt>
          <dd>
            {[company.name, ...t.address].map((l) => (
              <span key={l} className={s.line}>
                {l}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="t-mono">{c.keys.vat}</dt>
          <dd>{company.vatNumber}</dd>
        </div>
      </dl>
      <div className={s.factory} data-reveal="">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.factoryImg} src={c.factory.media.src} alt={c.factory.alt} loading="lazy" decoding="async" />
        <div className={s.factoryContent}>
          <h2 className={s.headline}>{c.factory.headline}</h2>
        </div>
        <div className={s.modules}>
          <a className={`${s.module} ${s.map}`} href={maps.google} target="_blank" rel="noreferrer" aria-label={c.factory.maps}>
            {/* the embed is larger than the card, so Google's place card and controls stay outside it; the card is the link */}
            <iframe src={maps.embed} title="" aria-hidden tabIndex={-1} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <p className={`t-eyebrow ${s.pill} ${s.mapCoords}`}>{place.coords}</p>
            <p className={`t-mono ${s.pill} ${s.mapLink}`}>
              {c.factory.mapsLabel}
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </p>
          </a>
          <div className={`${s.module} ${s.stats}`}>
            <p className="t-eyebrow">{c.factory.statsLabel}</p>
            <ul className={s.statsList}>
              {c.factory.stats.map((x) => (
                <li key={x.value}>
                  <span className={s.statsValue}>{x.value}</span>
                  <span className={`t-mono ${s.statsCaption}`}>{x.caption}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
