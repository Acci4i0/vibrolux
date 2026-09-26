import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { LavorazioniGrid } from '@/components/sections/LavorazioniGrid';
import { MediaCardGroup } from '@/components/sections/MediaCardGroup';
import { lavorazioneTiles, lavorazioniPage as page } from '@/content/site';

export const metadata: Metadata = { title: 'Lavorazioni' };

export default function Lavorazioni() {
  return (
    <main>
      <Hero data={page.hero} />
      <LavorazioniGrid intro={page.index} tiles={lavorazioneTiles()} />
      <MediaCardGroup cards={page.cards} />
    </main>
  );
}
