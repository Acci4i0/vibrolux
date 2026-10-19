'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { company, content, maps, place } from '@/content/site';
import { useLang } from '@/lib/i18n';
import { useMapsHref } from '@/lib/maps';
import s from './Contact.module.css';

/**
 * The office on a brand-colour card (as the Lavorazioni manifesto, after on.energy): the address large, the three
 * mail addresses in columns with what each is for, phone and VAT number at the foot; then the plant as the
 * reference's factory card (aerial photo, its name, a map card that opens Google Maps, a stats card); then
 * Sant'Ambrogio in a photo, with the way to Maps in its corner.
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const t = content[useLang()];
  const c = t.contatti;
  const rows = [
    [c.keys.tel, company.tel, company.telHref],
    [c.keys.vat, company.vatNumber],
  ];
  const mapsHref = useMapsHref(maps.google, maps.apple);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        const [card, factory, photo] = root.current!.querySelectorAll('[data-reveal]');
        reveal(card, { delay: ANIM.text.eyebrowDelay });
        reveal(factory);
        reveal(photo);
      }, contextSafe!),
    { scope: root },
  );

  return (
    <section ref={root} id="dove-siamo" className={s.contact}>
      <div className={s.card} data-reveal="">
        <div className={s.cardTop}>
          <h2 className="t-eyebrow">{c.eyebrow}</h2>
          <span className={`t-mono ${s.company}`}>{company.name}</span>
        </div>
        <address className={s.address}>
          {t.address.map((l) => (
            <span key={l} className={s.line}>
              {l}
            </span>
          ))}
        </address>
        <ul className={s.mails}>
          {c.emails.map((m) => (
            <li key={m.address}>
              <a href={`mailto:${m.address}`}>
                <span>{m.address}</span>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
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
      <figure className={s.place} data-reveal="">
        <div className={s.photo}>
          <picture>
            <source media="(max-width: 767px)" srcSet={place.srcSquare} />
            <img src={place.src} alt={c.place.alt} loading="lazy" decoding="async" />
          </picture>
          <p className={`t-eyebrow ${s.coords}`}>{place.coords}</p>
          <a className={s.go} href={mapsHref} target="_blank" rel="noreferrer" aria-label={c.place.maps}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>
      </figure>
    </section>
  );
}
