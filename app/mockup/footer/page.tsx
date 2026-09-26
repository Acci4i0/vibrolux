import type { Metadata } from 'next';
import { Footer, type FooterMobile } from '@/components/Footer';

export const metadata: Metadata = { title: 'Mockup footer', robots: { index: false } };

// ponytail: temporary page to compare the mobile footer layouts — delete once one is picked.
const variants: [FooterMobile, string, string][] = [
  ['squeeze', '1 · Tre colonne compresse', 'Azienda, Lavorazioni e Contatti su una riga, senza numeri e con testo più piccolo.'],
  ['tabs', '2 · Tab', 'I tre titoli su una riga come su desktop: toccandone uno si vedono i suoi link.'],
  ['swipe', '3 · Scorrimento', 'Le tre colonne su una riga come su desktop, da scorrere con il dito.'],
];

const Label = ({ title, text }: { title: string; text: string }) => (
  <div style={{ padding: '14rem 1.2rem 4.8rem', background: '#fff' }}>
    <h2 className="t-eyebrow">{title}</h2>
    <p className="t-large" style={{ marginTop: '1.6rem', maxWidth: '28em' }}>
      {text}
    </p>
  </div>
);

export default function FooterMockup() {
  return (
    <main>
      {variants.map(([v, title, text]) => (
        <section key={v}>
          <Label title={title} text={text} />
          <Footer mobile={v} />
        </section>
      ))}
      <Label title="Attuale" text="Due colonne per riga, Contatti a tutta larghezza." />
    </main>
  );
}
