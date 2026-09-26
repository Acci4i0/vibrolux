import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero } from '@/components/sections/Hero';
import { TextModule } from '@/components/sections/TextModule';
import { Carousel } from '@/components/sections/Carousel';
import { LavorazioniGrid } from '@/components/sections/LavorazioniGrid';
import { MediaCardGroup } from '@/components/sections/MediaCardGroup';
import { lavorazioni, lavorazioneTiles, lavorazioniPage } from '@/content/site';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => lavorazioni.map((l) => ({ slug: l.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = lavorazioni.find((x) => x.id === slug);
  return l ? { title: l.title, description: l.text } : {};
}

/** One page per process: hero, description, plants carousel (when there are several), the other processes. */
export default async function Lavorazione({ params }: Props) {
  const { slug } = await params;
  const l = lavorazioni.find((x) => x.id === slug);
  if (!l) notFound();

  return (
    <main>
      <Hero data={{ media: l.hero, headline: l.title, cta: { label: 'Richiedi un preventivo', href: '/contatti' } }} />
      <TextModule data={{ eyebrow: 'Lavorazione', paragraphs: l.intro, cta: { label: 'Scarica la brochure', href: lavorazioniPage.cards[0].href } }} />
      {l.impianti && <Carousel data={l.impianti} />}
      <LavorazioniGrid eyebrow="Altre lavorazioni" tiles={lavorazioneTiles(l.id)} />
      <MediaCardGroup cards={lavorazioniPage.cards} />
    </main>
  );
}
