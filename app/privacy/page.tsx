import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/LegalPage';
import { company } from '@/content/site';

export const metadata: Metadata = { title: 'Privacy' };

const mail = <a href={`mailto:${company.email}`}>{company.email}</a>;
const pec = <a href={`mailto:${company.pec}`}>{company.pec}</a>;

const sections: LegalSection[] = [
  {
    id: 'titolare',
    title: 'Chi tratta i dati',
    content: (
      <>
        <p>
          Il titolare del trattamento è <strong>{company.name}</strong>, {company.address.join(', ')}. C.F. e P.IVA{' '}
          {company.vat.replace('P.IVA / CF ', '')}. Telefono <a href={company.telHref}>{company.tel}</a>, posta elettronica {mail}, PEC {pec}.
        </p>
        <p>Per qualsiasi richiesta sul trattamento dei tuoi dati puoi scrivere a uno di questi indirizzi.</p>
      </>
    ),
  },
  {
    id: 'dati',
    title: 'Quali dati raccogliamo',
    content: (
      <>
        <h3>Dati che ci mandi tu</h3>
        <p>
          Il sito non ha moduli di contatto: telefono, e-mail e PEC sono collegamenti che aprono il tuo telefono o il tuo
          programma di posta. Se ci scrivi o ci chiami, per esempio per chiedere un preventivo o informazioni su una
          lavorazione, trattiamo i dati che scegli di comunicarci: nome, azienda, recapiti, contenuto del messaggio ed
          eventuali allegati, come disegni o specifiche dei particolari da trattare.
        </p>
        <h3>Dati di navigazione</h3>
        <p>
          Come ogni sito, il server che ospita queste pagine registra automaticamente alcuni dati tecnici a ogni visita:
          indirizzo IP, tipo di browser e sistema operativo, data e ora della richiesta, pagina richiesta ed eventuale
          pagina di provenienza. Servono a far funzionare il sito e a proteggerlo da abusi.
        </p>
        <h3>Cookie e statistiche: non ce ne sono</h3>
        <p>
          Il sito non usa cookie propri e non impiega strumenti di statistica, di misurazione del pubblico o di
          profilazione. Non salva nulla nella memoria del tuo browser. Per questo non compare alcun banner di consenso. Il
          dettaglio è nella sezione <a href="#cookie">Cookie</a>.
        </p>
        <h3>La mappa nella pagina Contatti</h3>
        <p>
          La pagina Contatti mostra una mappa di Google Maps. Quando apri quella pagina il tuo browser carica la mappa dai
          server di Google, che ricevono il tuo indirizzo IP, il tipo di browser e l’indirizzo della pagina. Google tratta
          questi dati come titolare autonomo, secondo la propria{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            informativa
          </a>
          . Le altre pagine del sito non contattano Google.
        </p>
      </>
    ),
  },
  {
    id: 'finalita',
    title: 'Perché li trattiamo, e con quale base giuridica',
    content: (
      <>
        <ul>
          <li>
            Per rispondere alle tue richieste di informazioni e di preventivo e per gestire i rapporti commerciali:
            esecuzione di misure precontrattuali e contrattuali su tua richiesta (art. 6.1.b GDPR) e nostro legittimo
            interesse a gestire i rapporti con clienti e fornitori (art. 6.1.f).
          </li>
          <li>Per far funzionare il sito e tenerlo sicuro: legittimo interesse del titolare (art. 6.1.f).</li>
          <li>
            Per mostrarti dove si trova la sede con la mappa della pagina Contatti: legittimo interesse a facilitare il
            raggiungimento dello stabilimento (art. 6.1.f).
          </li>
          <li>
            Per inviarti materiale informativo sulle nostre lavorazioni, solo se ce lo chiedi o ci dai il consenso (art.
            6.1.a). Puoi revocarlo in qualsiasi momento.
          </li>
          <li>Per adempiere a obblighi di legge, per esempio fiscali e contabili (art. 6.1.c).</li>
        </ul>
        <p>
          Non facciamo profilazione, non prendiamo decisioni automatizzate e non usiamo i tuoi dati per invii commerciali
          senza il tuo consenso.
        </p>
      </>
    ),
  },
  {
    id: 'destinatari',
    title: 'A chi vengono comunicati',
    content: (
      <>
        <p>
          I dati sono trattati dal personale autorizzato di {company.name}. Possono essere trattati, per nostro conto e su
          nostra istruzione, dai fornitori che ci danno i servizi tecnici necessari:
        </p>
        <ul>
          <li>il fornitore che ospita il sito e ne registra i log di accesso;</li>
          <li>i fornitori dei servizi di posta elettronica e di posta certificata;</li>
          <li>consulenti e fornitori che ci assistono su aspetti tecnici, legali, fiscali e amministrativi.</li>
        </ul>
        <p>
          Google riceve i dati descritti sopra solo quando apri la pagina Contatti, come titolare autonomo. I dati possono
          inoltre essere comunicati alle autorità quando la legge lo impone. Non vendiamo e non diffondiamo i dati a
          nessuno.
        </p>
      </>
    ),
  },
  {
    id: 'trasferimenti',
    title: 'Trasferimenti fuori dall’Unione europea',
    content: (
      <p>
        Google e alcuni fornitori tecnici possono trattare i dati anche fuori dallo Spazio economico europeo, in
        particolare negli Stati Uniti. In quel caso il trasferimento avviene sulla base delle garanzie previste dal Capo V
        del GDPR: la decisione di adeguatezza della Commissione europea (EU-U.S. Data Privacy Framework) oppure le clausole
        contrattuali tipo approvate dalla Commissione.
      </p>
    ),
  },
  {
    id: 'conservazione',
    title: 'Per quanto tempo li conserviamo',
    content: (
      <ul>
        <li>
          Messaggi, richieste e preventivi: per il tempo necessario a rispondere e a gestire il rapporto; se ne nasce un
          rapporto commerciale, per i termini previsti dalla legge per la documentazione contabile (dieci anni, art. 2220
          del Codice civile).
        </li>
        <li>
          Log del server: per il tempo tecnico necessario alla sicurezza e alla diagnostica, secondo le impostazioni del
          fornitore di hosting.
        </li>
        <li>Consenso all’invio di materiale informativo: fino alla revoca.</li>
      </ul>
    ),
  },
  {
    id: 'collegamenti',
    title: 'Collegamenti verso altri siti',
    content: (
      <p>
        La brochure in PDF è ospitata su questo sito. I pulsanti della mappa, come «Apri in Maps» e «Indicazioni», portano
        a Google Maps. Una volta aperti, valgono le informative dei siti di destinazione, sulle quali non abbiamo
        controllo.
      </p>
    ),
  },
  {
    id: 'diritti',
    title: 'I tuoi diritti',
    content: (
      <>
        <p>
          Puoi in ogni momento chiederci l’accesso ai tuoi dati, la loro rettifica o cancellazione, la limitazione del
          trattamento, la portabilità dei dati che ci hai fornito, e opporti al trattamento fondato sul legittimo
          interesse (articoli da 15 a 22 del GDPR). Se il trattamento si basa sul consenso, puoi revocarlo in qualsiasi
          momento senza pregiudicare la liceità di quanto fatto prima.
        </p>
        <p>
          Per esercitarli scrivi a {mail} o a {pec}: rispondiamo nel più breve tempo possibile e comunque entro un mese.
        </p>
        <p>
          Se ritieni che il trattamento violi la normativa puoi proporre reclamo al{' '}
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
            Garante per la protezione dei dati personali
          </a>{' '}
          o all’autorità di controllo del tuo Stato di residenza.
        </p>
      </>
    ),
  },
  {
    id: 'cookie',
    title: 'Cookie',
    content: (
      <>
        <p>
          Un cookie è un piccolo file che un sito salva sul dispositivo di chi lo visita e che il browser rimanda indietro
          a ogni richiesta successiva. <strong>Questo sito non ne usa</strong>: né cookie propri né di terze parti, né
          tecnici né di profilazione. Non c’è alcun sistema di statistica o di pubblicità e il sito non salva nulla nella
          memoria locale del browser. I caratteri tipografici e la brochure sono ospitati sul sito stesso: non vengono
          chiesti a servizi esterni.
        </p>
        <p>
          L’unico contenuto di terze parti è la mappa di Google nella pagina Contatti. Caricandola, il tuo browser
          comunica il proprio indirizzo IP a Google, che può impiegare cookie o tecnologie simili secondo le proprie{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noreferrer">
            regole
          </a>
          . Puoi vedere e cancellare i dati salvati dai siti dalle impostazioni di privacy del tuo browser.
        </p>
        <p>
          Se in futuro il sito dovesse introdurre cookie o strumenti di statistica, questa pagina verrà aggiornata prima
          della loro attivazione e, dove la legge lo richiede, comparirà una richiesta di consenso.
        </p>
      </>
    ),
  },
  {
    id: 'modifiche',
    title: 'Modifiche a questa informativa',
    content: (
      <p>
        Ci riserviamo di aggiornare questa informativa quando cambiano il sito o la normativa. La versione in vigore è
        sempre quella pubblicata su questa pagina, con la data di ultimo aggiornamento indicata in alto.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      updated="25 settembre 2026"
      intro={
        <p>
          Questa informativa riguarda il sito vibrolux.it ed è resa ai sensi dell’articolo 13 del Regolamento (UE)
          2016/679, il GDPR. Spiega quali dati raccogliamo, perché, a chi li comunichiamo e quali diritti puoi esercitare.
        </p>
      }
      sections={sections}
    />
  );
}
