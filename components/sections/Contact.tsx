'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, reveal, revealMedia } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { company, content, maps, place } from '@/content/site';
import { useLang } from '@/lib/i18n';
import { useMapsHref } from '@/lib/maps';
import s from './Contact.module.css';

/** Address + mail list (one address per need) + contact rows, laid out like the text modules; then Sant'Ambrogio in a photo, with the way to Maps in its corner. */
export function Contact() {
  const root = useRef<HTMLElement>(null);
  const t = content[useLang()];
  const c = t.contatti;
  const rows = [
    [c.keys.tel, company.tel, company.telHref],
    [c.keys.pec, company.pec, `mailto:${company.pec}`],
    [c.keys.vat, company.vatNumber],
  ];
  const mapsHref = useMapsHref(maps.google, maps.apple);

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        const [eyebrow, content, photo] = root.current!.querySelectorAll('[data-reveal]');
        reveal(eyebrow, { delay: ANIM.text.eyebrowDelay });
        reveal(content, { delay: ANIM.text.contentDelay });
        reveal(photo);
        revealMedia(photo.querySelector('picture'), { drift: true });
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
      <figure className={s.place} data-reveal="">
        <div className={s.photo}>
          <picture data-media-reveal="">
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
        <figcaption className={`t-mono ${s.credit}`}>
          <a href={place.credit.href} target="_blank" rel="noreferrer">
            {c.place.photo}: {place.credit.author} · {place.credit.license}
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
