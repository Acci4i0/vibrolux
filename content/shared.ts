import type { MediaData } from '@/components/Media';
import type { Lang } from '@/lib/i18n';

/**
 * What doesn't change with the language: paths, media, contact details.
 * MEDIA: foto() = Vibrolux's own photos (public/assets/vibrolux, from vibrolux.it, to be retouched);
 * img()/video() = stock/Commons stand-ins still waiting for an original (public/assets/preview, see CREDITS.md).
 * img() without a file renders the black placeholder.
 */

/** Site sub-path on GitHub Pages ('' locally): media and internal links carry it, next/link and router.push add it themselves. */
export const BASE = process.env.BASE_PATH ?? '';
export const withBase = (path: string) => BASE + path;

/** An internal link in a language: to('en')('/azienda') → '/vibrolux/en/azienda' */
export const linker = (lang: Lang) => (path: string) => withBase(lang === 'it' ? path : path === '/' ? '/en' : `/en${path}`);

export const BROCHURE = withBase('/assets/vibrolux-brochure.pdf');
const P = withBase('/assets/preview/');
const V = withBase('/assets/vibrolux/');
/** where the subject sits in photos whose centre isn't the subject */
const FOCUS: Record<string, string> = { 'facciata.jpg': '64% 50%' };
/** stand-in from /assets/preview (stock / Commons, see CREDITS.md) */
export const img = (file?: string, aspect = 1): MediaData => ({ src: file && P + file, aspect, focus: file && FOCUS[file] });
export const video = (file: string): MediaData => ({ type: 'video', src: P + file, aspect: 16 / 9 });
/** Vibrolux's own photo from /assets/vibrolux (taken from vibrolux.it; to be retouched) */
export const foto = (file: string, aspect = 1): MediaData => ({ src: V + file, aspect, focus: FOCUS[file] });

export const company = {
  name: 'Vibrolux Srl',
  street: ['Via Don Emilio Berto, 6', '10057 Sant’Ambrogio (TO)'],
  tel: '+39 011 93 48 197', // non-breaking: never split across lines
  telHref: 'tel:+390119348197',
  email: 'info@vibrolux.it',
  /** DA VERIFICARE con Vibrolux: service@ e commerciale@ non sono confermati */
  emails: { info: 'info@vibrolux.it', service: 'service@vibrolux.it', commerciale: 'commerciale@vibrolux.it' },
  pec: 'vibroluxsrl@pec.it',
  vatNumber: '08270030011',
  iso: 'ISO 9001:2015',
  maps: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2816.7607632673407!2d7.377691215931506!3d45.09064427909836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4788462dac3fab3d%3A0xfaf018a173a6521a!2sVibrolux+Srl!5e0!3m2!1sit!2sit!4v1548257158260',
  brochure: BROCHURE,
};

const MAPS_QUERY = encodeURIComponent('Vibrolux Srl, Via Don Emilio Berto 6, 10057 Sant’Ambrogio di Torino TO');
export const maps = {
  google: `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`,
  apple: `https://maps.apple.com/?q=${MAPS_QUERY}`,
};

type Slide = { label: string; text: string; media: MediaData };

export type Lavorazione = {
  id: string;
  title: string;
  /** home accordion */
  text: string;
  /** one line on the lavorazioni tiles */
  short: string;
  media: MediaData;
  /** detail page /lavorazioni/[id] */
  hero: MediaData;
  intro: string[];
  impianti?: { eyebrow: string; items: Slide[] };
};

export type NavItem = { label: string; href: string; external?: boolean; children?: NavItem[] };

/** `confirm`: the first tap only swaps the label to this, the second follows the link. `hrefApple`: used instead on Apple devices. */
export type FooterLink = { label: string; href: string; confirm?: string; hrefApple?: string };
