import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { TextModule } from '@/components/sections/TextModule';
import { Carousel } from '@/components/sections/Carousel';
import { Stats } from '@/components/sections/Stats';
import { Cards } from '@/components/sections/Cards';
import { azienda } from '@/content/site';

export const metadata: Metadata = { title: 'Azienda' };

export default function Azienda() {
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
