import { Hero } from '@/components/sections/Hero';
import { TextModule } from '@/components/sections/TextModule';
import { MediaCardGroup } from '@/components/sections/MediaCardGroup';
import { Carousel } from '@/components/sections/Carousel';
import { MaterialsAccordion } from '@/components/sections/MaterialsAccordion';
import { Cards } from '@/components/sections/Cards';
import { home, lavorazioni } from '@/content/site';

export default function Home() {
  return (
    <main>
      <Hero data={home.hero} />
      <TextModule data={home.intro} />
      <MediaCardGroup cards={home.cards} />
      <Carousel data={home.beforeAfter} />
      <TextModule data={home.lavorazioniIntro} />
      <MaterialsAccordion data={{ eyebrow: 'Lavorazioni', items: lavorazioni.map((l) => ({ ...l, href: `/lavorazioni/${l.id}` })) }} />
      <Cards data={home.values} />
    </main>
  );
}
