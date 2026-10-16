import { Media, type MediaData } from '../Media';
import s from './MediaCardGroup.module.css';

type Card = { label: string; href: string; media: MediaData };

/** One media card (reference: module-mediaCard): square photo, large radius, the label in a centred blurred pill with an arrow. */
export function MediaCard({ label, href, media, ...rest }: Card & Record<`data-${string}`, string | undefined>) {
  return (
    <a href={href} className={s.card} {...rest}>
      <div className={s.media}>
        <Media {...media} className={s.mediaInner} motion="reveal" />
        <div className={s.ctaWrap}>
          <span className={s.cta}>
            <span>{label}</span>
            <span className={s.icon} aria-hidden>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}

/** Two equal media cards with a centred blurred pill CTA. Hover only (no scroll animation). */
export function MediaCardGroup({ cards }: { cards: Card[] }) {
  return (
    <section className={s.group} data-module="media">
      <div className={s.inner}>
        {cards.map((c, i) => (
          <MediaCard key={i} {...c} />
        ))}
      </div>
    </section>
  );
}
