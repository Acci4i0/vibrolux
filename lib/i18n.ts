import { usePathname } from 'next/navigation';

export type Lang = 'it' | 'en';
export const LANGS: Lang[] = ['it', 'en'];

/*
 * Italian lives at the root, English under /en with the same slugs (/azienda ↔ /en/azienda).
 * Paths here come from usePathname(): no base path; a trailing slash on GitHub Pages.
 */

export const langOf = (pathname: string): Lang => (/^\/en(\/|$)/.test(pathname) ? 'en' : 'it');

/** The page without language prefix and trailing slash: '/en/azienda/' → '/azienda' */
export const pagePath = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, '').replace(/\/$/, '') || '/';

/** The same page in another language */
export const langPath = (pathname: string, lang: Lang) => {
  const page = pagePath(pathname);
  return lang === 'it' ? page : page === '/' ? '/en' : `/en${page}`;
};

export const useLang = () => langOf(usePathname());
