import { Rings } from '../Rings';
import s from './Divider.module.css';

/**
 * The signature on a hairline, between two sections. One a page, always in the same place: it opens the page's closing
 * section (Home: «Perché Vibrolux»; Azienda: quality; a process: the other processes).
 */
export function Divider() {
  return (
    <div className={s.divider} aria-hidden>
      <Rings className={s.rings} rings={4} />
      <span className={s.line} />
    </div>
  );
}
