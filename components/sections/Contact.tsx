'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { afterMount, reveal, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { company, content, maps, place } from '@/content/site';
import { useLang } from '@/lib/i18n';
import { Logo, logoTimeline } from '../Logo';
import s from './Contact.module.css';

/**
 * Two halves on the page: on the left the eyebrow, under it the V of the logo, which builds with the scroll as the
 * wordmark in the footer, and at the foot the address and the VAT number, level with the last line of the list; on the
 * right the three mail addresses and the telephone, one a row on hairlines (what each is for, the address; the whole
 * row is the link).
 * Then the plant as the reference's factory card (aerial photo, its name, a map card that opens Google Maps, a stats card).
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const mark = useRef<SVGSVGElement>(null);
  const t = content[useLang()];
  const c = t.contatti;
  const rows = [
    ...c.emails.map((m) => ({ key: m.use, value: m.address, href: `mailto:${m.address}` })),
    { key: c.keys.tel, value: company.tel, href: company.telHref },
  ];
  // name, street, then town and country on one line: three lines, so the block ends level with the list
  const address = [company.name, company.street[0], `${company.street[1]}, ${t.address.at(-1)}`];

  useGSAP(
    (_, contextSafe) => {
      if (!prefersReducedMotion())
        gsap.to(logoTimeline(mark.current!), {
          progress: 1,
          ease: 'none',
          scrollTrigger: { trigger: mark.current, start: ANIM.logo.footerScrubStart, end: ANIM.logo.markScrubEnd, scrub: ANIM.logo.footerScrub },
        });
      return afterMount(() => {
        const [eyebrow, details, factory] = root.current!.querySelectorAll('[data-reveal]');
        const list = root.current!.querySelector('[data-list]');
        reveal(eyebrow, { delay: ANIM.text.eyebrowDelay });
        revealStagger(list, list!.children);
        reveal(details, { delay: ANIM.text.contentDelay });
        reveal(factory);
      }, contextSafe!);
    },
    { scope: root },
  );

  return (
    <section ref={root} id="dove-siamo" className={s.contact}>
      <div className={s.inner}>
        <div className={s.side}>
          <div>
            <h2 className="t-eyebrow" data-reveal="">
              {c.eyebrow}
            </h2>
            <div className={s.mark}>
              <Logo ref={mark} mark />
            </div>
          </div>
          <dl className={s.details} data-reveal="">
            <div>
              <dt className="t-mono">{c.keys.address}</dt>
              <dd>
                {address.map((l) => (
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
        </div>
        <ul className={s.list} data-list="">
          {rows.map((r) => (
            <li key={r.value}>
              <a className={s.row} href={r.href}>
                <span>
                  <span className={`t-mono ${s.key}`}>{r.key}</span>
                  <span className={s.value}>{r.value}</span>
                </span>
                <svg className={s.arrow} viewBox="0 0 24 24" aria-hidden>
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
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
    </section>
  );
}
