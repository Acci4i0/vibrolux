import { Media, type MediaData } from '../Media';
import s from './MediaCardGroup.module.css';

type Card = { label: string; href: string; media: MediaData };

/** Two equal media cards with a centred blurred pill CTA. Hover only (no scroll animation). */
export function MediaCardGroup({ cards }: { cards: Card[] }) {
  return (
    <section className={s.group} data-module="media">
      <div className={s.inner}>
        {cards.map((c, i) => (
          <a key={i} href={c.href} className={s.card}>
            <div className={s.media}>
              <Media {...c.media} className={s.mediaInner} />
              <div className={s.ctaWrap}>
                <span className={s.cta}>
                  <span>{c.label}</span>
                  <span className={s.icon} aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
