import { Media, type MediaData } from '../Media';
import s from './Band.module.css';

/** A photo edge to edge, no card, closing the page right above the footer (reference: t1energy.com/company, the prefooter). */
export function Band({ media }: { media: MediaData }) {
  return (
    <section className={s.band}>
      <Media {...media} className={s.media} />
    </section>
  );
}
