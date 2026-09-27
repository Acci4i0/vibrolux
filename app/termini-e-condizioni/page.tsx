import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/LegalPage';
import { company, withBase } from '@/content/site';

export const metadata: Metadata = { title: 'Termini e condizioni' };

const sections: LegalSection[] = [
  {
    id: 'gestore',
    title: 'Chi gestisce il sito',
    content: (
      <p>
        Il sito vibrolux.it (di seguito «il Sito») è gestito da <strong>{company.name}</strong>, {company.address.join(', ')}.
        C.F. e P.IVA {company.vat.replace('P.IVA / CF ', '')}. Posta elettronica{' '}
        <a href={`mailto:${company.email}`}>{company.email}</a>, PEC <a href={`mailto:${company.pec}`}>{company.pec}</a>.
      </p>
    ),
  },
  {
    id: 'scopo',
    title: 'Scopo del Sito',
    content: (
      <>
        <p>
          Il Sito presenta a imprese e utenti l’azienda e i suoi servizi di trattamento superficiale dei metalli. Chi lo
          utilizza accetta i termini e le condizioni che seguono.
        </p>
        <p>
          Le informazioni su lavorazioni, impianti e capacità produttive, comprese quelle della brochure, hanno scopo
          illustrativo e non costituiscono un’offerta contrattuale. Caratteristiche, tempi e prezzi di ogni lavorazione
          sono definiti solo nei preventivi e nei contratti scritti.
        </p>
      </>
    ),
  },
  {
    id: 'proprieta',
    title: 'Proprietà intellettuale',
    content: (
      <>
        <p>
          Ogni diritto sui contenuti del Sito (a titolo di esempio testi, immagini, video, segni distintivi, grafica e
          architettura del Sito) è riservato ai sensi della normativa vigente. I contenuti non possono essere copiati,
          riprodotti, pubblicati o distribuiti, in tutto o in parte, senza il consenso scritto di {company.name}, salvo la
          facoltà di salvarli sul proprio dispositivo o di stamparne estratti per uso personale.
        </p>
        <p>
          VIBROLUX è un marchio registrato. I marchi e i loghi presenti sul Sito appartengono a {company.name} o ai
          rispettivi proprietari, che si riservano ogni azione a tutela dei propri diritti. Il nome VIBROLUX non può essere
          usato, nemmeno in parte, in nomi di dominio o indirizzi di altri siti senza autorizzazione scritta.
        </p>
      </>
    ),
  },
  {
    id: 'link-al-sito',
    title: 'Collegamenti al Sito',
    content: (
      <p>
        È possibile inserire collegamenti verso il Sito, a condizione che non ne danneggino l’immagine o le attività, non
        lascino intendere rapporti con {company.name} che non esistono e non presentino i contenuti del Sito come propri,
        per esempio mostrandoli all’interno di pagine di altri siti.
      </p>
    ),
  },
  {
    id: 'link-esterni',
    title: 'Collegamenti verso altri siti',
    content: (
      <p>
        Il Sito contiene collegamenti a servizi di terzi, come Google Maps. {company.name} non ha controllo su quei siti e
        non risponde dei loro contenuti, dei servizi che offrono né del modo in cui trattano i dati.
      </p>
    ),
  },
  {
    id: 'responsabilita',
    title: 'Limiti di responsabilità',
    content: (
      <p>
        I contenuti del Sito sono pubblicati con cura, ma hanno scopo esclusivamente informativo e possono non essere
        completi o aggiornati. Nei limiti consentiti dalla legge, {company.name} non risponde di danni derivanti dall’uso
        del Sito o dall’impossibilità di accedervi. Resta ferma la responsabilità per dolo o colpa grave (art. 1229 del
        Codice civile).
      </p>
    ),
  },
  {
    id: 'dati-personali',
    title: 'Dati personali',
    content: (
      <p>
        Il trattamento dei dati personali e l’uso dei cookie sono descritti nell’<a href={withBase('/privacy')}>informativa privacy</a>.
      </p>
    ),
  },
  {
    id: 'modifiche',
    title: 'Modifiche',
    content: (
      <p>
        {company.name} può aggiornare questi termini quando cambiano il Sito o la normativa. La versione in vigore è sempre
        quella pubblicata su questa pagina, con la data di ultimo aggiornamento indicata in alto.
      </p>
    ),
  },
  {
    id: 'legge',
    title: 'Legge applicabile',
    content: (
      <p>
        Questi termini sono regolati dalla legge italiana. Per ogni controversia è competente il foro previsto dalla legge;
        se l’utente è un consumatore, quello del suo luogo di residenza o di domicilio. Commenti e suggerimenti possono
        essere inviati a <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    ),
  },
];

export default function Termini() {
  return (
    <LegalPage
      title="Termini e condizioni"
      updated="25 settembre 2026"
      intro={<p>Le condizioni d’uso del sito vibrolux.it: chi lo gestisce, a cosa serve, come puoi usarne i contenuti.</p>}
      sections={sections}
    />
  );
}
