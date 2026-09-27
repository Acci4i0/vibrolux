import { it, type Site } from './it';
import { en } from './en';

/** Site content: shared data (paths, media, contacts) + one dictionary per language. */

export * from './shared';
export type { Site };

export const content = { it, en };

/** Tiles for the lavorazioni grid (listing page, and "altre lavorazioni" on a detail page) */
export const lavorazioneTiles = (t: Site, excludeId?: string) =>
  t.lavorazioni
    .map((l, i) => ({ label: String(i + 1).padStart(2, '0'), title: l.title, text: l.short, href: t.to(`/lavorazioni/${l.id}`), media: l.media, id: l.id }))
    .filter((x) => x.id !== excludeId);
