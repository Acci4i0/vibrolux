import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Contact } from '@/components/sections/Contact';
import { contatti } from '@/content/site';

export const metadata: Metadata = { title: 'Contatti' };

export default function Contatti() {
  return (
    <main>
      <Hero data={contatti.hero} />
      <Contact />
    </main>
  );
}
