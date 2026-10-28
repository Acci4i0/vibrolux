import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Lang } from '@/lib/i18n';
import { BASE, ORIGIN, company, content, foto, lavorazioneTiles, linker, maps, place, type Site } from '@/content/site';
import { privacy, terms } from '@/content/legal';
import { Hero } from './sections/Hero';
import { Headline } from './sections/Headline';
import { MediaPair } from './sections/MediaPair';
import { Video } from './sections/Video';
import { Band } from './sections/Band';
import { TextModule } from './sections/TextModule';
import { Quotes } from './sections/Quotes';
import { MediaCardGroup } from './sections/MediaCardGroup';
import { Carousel } from './sections/Carousel';
import { MaterialsAccordion } from './sections/MaterialsAccordion';
import { Proofs } from './sections/Proofs';
import { Stats } from './sections/Stats';
import { LavorazioniGrid } from './sections/LavorazioniGrid';
import { Contact } from './sections/Contact';
import { LegalPage } from './LegalPage';

/**
 * The pages, one per view, in either language: app/<page>/page.tsx and app/en/<page>/page.tsx only pick the language.
 * The root layout's metadata is Italian; `meta` gives each page its title, the English description,
 * and its address in both languages for search engines.
 */

type P = { lang: Lang };

/** A page's path in a language, as served: the exported site ends every page in '/' */
const pagePath = (lang: Lang, path: string) => {
  const p = linker(lang)(path);
  return BASE && !p.endsWith('/') ? `${p}/` : p;
};

/** canonical: this page; hreflang: the same page in Italian and English, Italian by default */
const alternates = (lang: Lang, path: string): Metadata['alternates'] => ({
  canonical: pagePath(lang, path),
  languages: { it: pagePath('it', path), en: pagePath('en', path), 'x-default': pagePath('it', path) },
});

export const meta = (lang: Lang, page?: keyof Site['meta']['pages']): Metadata => {
  const t = content[lang].meta;
  const path = !page ? '/' : page === 'termini' ? '/termini-e-condizioni' : `/${page}`;
  return { title: page ? t.pages[page] : { absolute: t.title }, description: t.description, alternates: alternates(lang, path) };
};

/** Vibrolux for search engines (schema.org LocalBusiness), on the home page */
const business = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: company.name,
  description: content[lang].meta.description,
  url: ORIGIN + pagePath(lang, '/'),
  image: ORIGIN + foto('vibrolux_azienda.jpg').src,
  telephone: company.telHref.replace('tel:', ''),
  email: company.email,
  vatID: `IT${company.vatNumber}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.street[0],
    postalCode: '10057',
    addressLocality: 'Sant’Ambrogio di Torino',
    addressRegion: 'TO',
    addressCountry: 'IT',
  },
  geo: { '@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lng },
  hasMap: maps.google,
});

export function HomeView({ lang }: P) {
  const t = content[lang];
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business(lang)) }} />
      <Hero data={t.home.hero} />
      <TextModule data={t.home.intro} />
      <MediaCardGroup cards={t.home.cards} />
      <Carousel data={t.home.beforeAfter} />
      <TextModule data={t.home.lavorazioniIntro} />
      <MaterialsAccordion
        data={{ eyebrow: t.ui.processes, more: t.ui.learnMore, items: t.lavorazioni.map((l) => ({ ...l, href: t.to(`/lavorazioni/${l.id}`) })) }}
      />
      <Proofs data={t.home.values} />
    </main>
  );
}

export function AziendaView({ lang }: P) {
  const { azienda } = content[lang];
  return (
    <main>
      <Headline data={azienda.headline} />
      <MediaPair media={azienda.pair} />
      <TextModule data={azienda.team} />
      <Video media={azienda.video} />
      <Quotes data={azienda.quotes} />
      <Carousel data={azienda.sede} />
      <Stats data={azienda.stats} />
      <TextModule data={azienda.quality} />
      <Band media={azienda.closing} />
    </main>
  );
}

export function LavorazioniView({ lang }: P) {
  const t = content[lang];
  const page = t.lavorazioniPage;
  return (
    <main>
      <Hero data={page.hero} />
      <TextModule data={page.intro} />
      <LavorazioniGrid tiles={lavorazioneTiles(t)} />
    </main>
  );
}

/* One page per process: hero, description, plants carousel (when there are several), the other processes. */

export const lavorazioneParams = () => content.it.lavorazioni.map((l) => ({ slug: l.id }));

export const lavorazioneMeta = (lang: Lang, slug: string): Metadata => {
  const l = content[lang].lavorazioni.find((x) => x.id === slug);
  return l ? { title: l.title, description: l.text, alternates: alternates(lang, `/lavorazioni/${slug}`) } : {};
};

export function LavorazioneView({ lang, slug }: P & { slug: string }) {
  const t = content[lang];
  const l = t.lavorazioni.find((x) => x.id === slug);
  if (!l) notFound();
  return (
    <main>
      <Hero data={{ media: l.hero, headline: l.title, cta: { label: t.ui.requestQuote, href: t.to('/contatti') } }} />
      <TextModule data={{ eyebrow: t.ui.process, paragraphs: l.intro, cta: { label: t.ui.downloadBrochure, href: t.lavorazioniPage.cards[0].href } }} />
      {l.impianti && <Carousel data={l.impianti} />}
      <LavorazioniGrid eyebrow={t.ui.otherProcesses} tiles={lavorazioneTiles(t, l.id)} />
      <MediaCardGroup cards={t.lavorazioniPage.cards} />
    </main>
  );
}

export function ContattiView({ lang }: P) {
  return (
    <main>
      <Hero data={content[lang].contatti.hero} />
      <Contact />
    </main>
  );
}

export const PrivacyView = ({ lang }: P) => <LegalPage {...privacy[lang]} />;
export const TermsView = ({ lang }: P) => <LegalPage {...terms[lang]} />;
