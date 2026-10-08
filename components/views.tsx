import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Lang } from '@/lib/i18n';
import { content, lavorazioneTiles, type Site } from '@/content/site';
import { privacy, terms } from '@/content/legal';
import { Hero } from './sections/Hero';
import { TextModule } from './sections/TextModule';
import { MediaCardGroup } from './sections/MediaCardGroup';
import { Carousel } from './sections/Carousel';
import { MaterialsAccordion } from './sections/MaterialsAccordion';
import { Cards } from './sections/Cards';
import { Stats } from './sections/Stats';
import { LavorazioniGrid } from './sections/LavorazioniGrid';
import { Contact } from './sections/Contact';
import { LegalPage } from './LegalPage';

/**
 * The pages, one per view, in either language: app/<page>/page.tsx and app/en/<page>/page.tsx only pick the language.
 * The root layout's metadata is Italian; `meta` gives each page its title, and the English description.
 */

type P = { lang: Lang };

export const meta = (lang: Lang, page?: keyof Site['meta']['pages']): Metadata => {
  const t = content[lang].meta;
  return { title: page ? t.pages[page] : { absolute: t.title }, description: t.description };
};

export function HomeView({ lang }: P) {
  const t = content[lang];
  return (
    <main>
      <Hero data={t.home.hero} />
      <TextModule data={t.home.intro} />
      <MediaCardGroup cards={t.home.cards} />
      <Carousel data={t.home.beforeAfter} />
      <TextModule data={t.home.lavorazioniIntro} />
      <MaterialsAccordion
        data={{ eyebrow: t.ui.processes, more: t.ui.learnMore, items: t.lavorazioni.map((l) => ({ ...l, href: t.to(`/lavorazioni/${l.id}`) })) }}
      />
      <Cards data={t.home.values} />
    </main>
  );
}

export function AziendaView({ lang }: P) {
  const { azienda } = content[lang];
  return (
    <main>
      <Hero data={azienda.hero} />
      <TextModule data={azienda.intro} />
      <Carousel data={azienda.sede} />
      <Stats data={azienda.stats} />
      <Cards data={azienda.pillars} />
      <TextModule data={azienda.quality} />
    </main>
  );
}

export function LavorazioniView({ lang }: P) {
  const t = content[lang];
  const page = t.lavorazioniPage;
  return (
    <main>
      <Hero data={page.hero} />
      <LavorazioniGrid intro={page.index} tiles={lavorazioneTiles(t)} />
    </main>
  );
}

/* One page per process: hero, description, plants carousel (when there are several), the other processes. */

export const lavorazioneParams = () => content.it.lavorazioni.map((l) => ({ slug: l.id }));

export const lavorazioneMeta = (lang: Lang, slug: string): Metadata => {
  const l = content[lang].lavorazioni.find((x) => x.id === slug);
  return l ? { title: l.title, description: l.text } : {};
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
