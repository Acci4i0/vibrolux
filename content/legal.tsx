import type { LegalSection } from '@/components/LegalPage';
import type { Lang } from '@/lib/i18n';
import { company, content } from './site';

/** Privacy notice and terms of use, per language. The English text is a courtesy translation of the Italian one. */

type LegalDoc = { title: string; updated: string; intro: React.ReactNode; sections: LegalSection[] };

const mail = <a href={`mailto:${company.email}`}>{company.email}</a>;
const pec = <a href={`mailto:${company.pec}`}>{company.pec}</a>;
const tel = <a href={company.telHref}>{company.tel}</a>;
const ext = { target: '_blank', rel: 'noreferrer' };

/* ───────── Privacy ───────── */

const privacyIt: LegalDoc = {
  title: 'Privacy',
  updated: '25 settembre 2026',
  intro: (
    <p>
      Questa informativa riguarda il sito vibrolux.it ed è resa ai sensi dell’articolo 13 del Regolamento (UE) 2016/679, il
      GDPR. Spiega quali dati raccogliamo, perché, a chi li comunichiamo e quali diritti puoi esercitare.
    </p>
  ),
  sections: [
    {
      id: 'titolare',
      title: 'Chi tratta i dati',
      content: (
        <>
          <p>
            Il titolare del trattamento è <strong>{company.name}</strong>, {content.it.address.join(', ')}. C.F. e P.IVA{' '}
            {company.vatNumber}. Telefono {tel}, posta elettronica {mail}, PEC {pec}.
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
            <a href="https://policies.google.com/privacy" {...ext}>
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
            <a href="https://www.garanteprivacy.it" {...ext}>
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
            <a href="https://policies.google.com/technologies/cookies" {...ext}>
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
  ],
};

const privacyEn: LegalDoc = {
  title: 'Privacy',
  updated: '25 September 2026',
  intro: (
    <>
      <p>
        This notice covers the vibrolux.it website and is given under Article 13 of Regulation (EU) 2016/679, the GDPR. It
        explains what data we collect, why, who we share it with and which rights you can exercise.
      </p>
      <p>This English version is a courtesy translation: in case of doubt, the Italian text prevails.</p>
    </>
  ),
  sections: [
    {
      id: 'titolare',
      title: 'Who processes the data',
      content: (
        <>
          <p>
            The data controller is <strong>{company.name}</strong>, {content.en.address.join(', ')}. VAT and tax code{' '}
            {company.vatNumber}. Telephone {tel}, email {mail}, certified email (PEC) {pec}.
          </p>
          <p>You can write to any of these addresses with any request about how your data is processed.</p>
        </>
      ),
    },
    {
      id: 'dati',
      title: 'What data we collect',
      content: (
        <>
          <h3>Data you send us</h3>
          <p>
            The site has no contact forms: telephone, email and PEC are links that open your phone or your mail program. If
            you write to us or call us, for example to ask for a quote or for information on a process, we process the data
            you choose to give us: name, company, contact details, the content of the message and any attachments, such as
            drawings or specifications of the parts to be treated.
          </p>
          <h3>Browsing data</h3>
          <p>
            Like every website, the server hosting these pages automatically records some technical data on each visit: IP
            address, browser type and operating system, date and time of the request, the page requested and, where there
            is one, the referring page. This is needed to run the site and protect it from abuse.
          </p>
          <h3>Cookies and statistics: there are none</h3>
          <p>
            The site sets no cookies of its own and uses no statistics, audience measurement or profiling tools. It stores
            nothing in your browser’s memory, which is why no consent banner appears. The details are in the{' '}
            <a href="#cookie">Cookies</a> section.
          </p>
          <h3>The map on the Contact page</h3>
          <p>
            The Contact page shows a Google Maps map. When you open that page your browser loads the map from Google’s
            servers, which receive your IP address, your browser type and the address of the page. Google processes this
            data as an independent controller, under its own{' '}
            <a href="https://policies.google.com/privacy" {...ext}>
              privacy policy
            </a>
            . The other pages of the site do not contact Google.
          </p>
        </>
      ),
    },
    {
      id: 'finalita',
      title: 'Why we process it, and on what legal basis',
      content: (
        <>
          <ul>
            <li>
              To answer your requests for information and quotes and to manage business relationships: taking
              pre-contractual and contractual steps at your request (Art. 6(1)(b) GDPR) and our legitimate interest in
              managing relationships with customers and suppliers (Art. 6(1)(f)).
            </li>
            <li>To run the site and keep it secure: the controller’s legitimate interest (Art. 6(1)(f)).</li>
            <li>
              To show you where we are with the map on the Contact page: legitimate interest in helping visitors reach the
              plant (Art. 6(1)(f)).
            </li>
            <li>
              To send you information about our processes, only if you ask for it or give your consent (Art. 6(1)(a)). You
              can withdraw it at any time.
            </li>
            <li>To comply with legal obligations, for example tax and accounting ones (Art. 6(1)(c)).</li>
          </ul>
          <p>We do no profiling, take no automated decisions and do not use your data for marketing without your consent.</p>
        </>
      ),
    },
    {
      id: 'destinatari',
      title: 'Who it is shared with',
      content: (
        <>
          <p>
            The data is processed by authorised staff of {company.name}. It may be processed on our behalf and under our
            instructions by the providers of the technical services we need:
          </p>
          <ul>
            <li>the provider that hosts the site and records its access logs;</li>
            <li>the providers of our email and certified email services;</li>
            <li>consultants and providers who assist us on technical, legal, tax and administrative matters.</li>
          </ul>
          <p>
            Google receives the data described above only when you open the Contact page, as an independent controller.
            Data may also be disclosed to the authorities where the law requires it. We do not sell or disclose the data to
            anyone.
          </p>
        </>
      ),
    },
    {
      id: 'trasferimenti',
      title: 'Transfers outside the European Union',
      content: (
        <p>
          Google and some technical providers may also process data outside the European Economic Area, in particular in
          the United States. In that case the transfer relies on the safeguards of Chapter V of the GDPR: the European
          Commission’s adequacy decision (EU-U.S. Data Privacy Framework) or the standard contractual clauses approved by the
          Commission.
        </p>
      ),
    },
    {
      id: 'conservazione',
      title: 'How long we keep it',
      content: (
        <ul>
          <li>
            Messages, requests and quotes: for as long as needed to answer and manage the relationship; if a business
            relationship follows, for the periods the law sets for accounting records (ten years, Art. 2220 of the Italian
            Civil Code).
          </li>
          <li>Server logs: for the technical time needed for security and diagnostics, according to the hosting provider’s settings.</li>
          <li>Consent to receive information: until it is withdrawn.</li>
        </ul>
      ),
    },
    {
      id: 'collegamenti',
      title: 'Links to other sites',
      content: (
        <p>
          The PDF brochure is hosted on this site. The map buttons, such as “Open in Maps” and “Directions”, lead to Google
          Maps. Once opened, the privacy notices of those sites apply, and we have no control over them.
        </p>
      ),
    },
    {
      id: 'diritti',
      title: 'Your rights',
      content: (
        <>
          <p>
            At any time you can ask us for access to your data, its rectification or erasure, restriction of processing,
            portability of the data you gave us, and you can object to processing based on legitimate interest (Articles 15
            to 22 GDPR). Where processing is based on consent, you can withdraw it at any time without affecting the
            lawfulness of what was done before.
          </p>
          <p>To exercise them write to {mail} or {pec}: we reply as soon as possible and in any case within one month.</p>
          <p>
            If you believe the processing breaks the law you can lodge a complaint with the{' '}
            <a href="https://www.garanteprivacy.it" {...ext}>
              Garante per la protezione dei dati personali
            </a>
            , the Italian data protection authority, or with the supervisory authority of your country of residence.
          </p>
        </>
      ),
    },
    {
      id: 'cookie',
      title: 'Cookies',
      content: (
        <>
          <p>
            A cookie is a small file a website saves on the visitor’s device, which the browser sends back with every later
            request. <strong>This site uses none</strong>: neither its own nor third-party cookies, neither technical nor
            profiling ones. There is no statistics or advertising system and the site stores nothing in the browser’s local
            memory. The typefaces and the brochure are hosted on the site itself and are not requested from outside
            services.
          </p>
          <p>
            The only third-party content is the Google map on the Contact page. When it loads, your browser sends its IP
            address to Google, which may use cookies or similar technologies under its own{' '}
            <a href="https://policies.google.com/technologies/cookies" {...ext}>
              rules
            </a>
            . You can see and delete the data stored by websites in your browser’s privacy settings.
          </p>
          <p>
            Should the site ever introduce cookies or statistics tools, this page will be updated before they are turned on
            and, where the law requires it, a consent request will appear.
          </p>
        </>
      ),
    },
    {
      id: 'modifiche',
      title: 'Changes to this notice',
      content: (
        <p>
          We may update this notice when the site or the law changes. The version in force is always the one published on
          this page, with the date of the last update shown at the top.
        </p>
      ),
    },
  ],
};

/* ───────── Termini e condizioni ───────── */

const termsIt: LegalDoc = {
  title: 'Termini e condizioni',
  updated: '25 settembre 2026',
  intro: <p>Le condizioni d’uso del sito vibrolux.it: chi lo gestisce, a cosa serve, come puoi usarne i contenuti.</p>,
  sections: [
    {
      id: 'gestore',
      title: 'Chi gestisce il sito',
      content: (
        <p>
          Il sito vibrolux.it (di seguito «il Sito») è gestito da <strong>{company.name}</strong>, {content.it.address.join(', ')}.
          C.F. e P.IVA {company.vatNumber}. Posta elettronica {mail}, PEC {pec}.
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
          Il trattamento dei dati personali e l’uso dei cookie sono descritti nell’
          <a href={content.it.to('/privacy')}>informativa privacy</a>.
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
          essere inviati a {mail}.
        </p>
      ),
    },
  ],
};

const termsEn: LegalDoc = {
  title: 'Terms and conditions',
  updated: '25 September 2026',
  intro: (
    <>
      <p>The terms of use of the vibrolux.it website: who runs it, what it is for, how you may use its content.</p>
      <p>This English version is a courtesy translation: in case of doubt, the Italian text prevails.</p>
    </>
  ),
  sections: [
    {
      id: 'gestore',
      title: 'Who runs the site',
      content: (
        <p>
          The vibrolux.it website (“the Site”) is run by <strong>{company.name}</strong>, {content.en.address.join(', ')}. VAT
          and tax code {company.vatNumber}. Email {mail}, certified email (PEC) {pec}.
        </p>
      ),
    },
    {
      id: 'scopo',
      title: 'Purpose of the Site',
      content: (
        <>
          <p>
            The Site presents the company and its surface treatment services for metals to businesses and users. Anyone
            using it accepts the terms and conditions below.
          </p>
          <p>
            The information on processes, plants and production capacity, including that in the brochure, is illustrative
            and is not a contractual offer. The features, lead times and prices of each process are set only in written
            quotes and contracts.
          </p>
        </>
      ),
    },
    {
      id: 'proprieta',
      title: 'Intellectual property',
      content: (
        <>
          <p>
            All rights in the content of the Site (for example texts, images, videos, distinctive signs, graphics and the
            architecture of the Site) are reserved under the law in force. The content may not be copied, reproduced,
            published or distributed, in whole or in part, without the written consent of {company.name}, except for saving
            it on your own device or printing extracts for personal use.
          </p>
          <p>
            VIBROLUX is a registered trademark. The trademarks and logos on the Site belong to {company.name} or to their
            respective owners, who reserve every action to protect their rights. The name VIBROLUX may not be used, even in
            part, in domain names or addresses of other sites without written authorisation.
          </p>
        </>
      ),
    },
    {
      id: 'link-al-sito',
      title: 'Links to the Site',
      content: (
        <p>
          You may link to the Site, provided the links do not harm its image or activities, do not suggest relationships
          with {company.name} that do not exist and do not present the content of the Site as your own, for example by
          showing it inside pages of other sites.
        </p>
      ),
    },
    {
      id: 'link-esterni',
      title: 'Links to other sites',
      content: (
        <p>
          The Site contains links to third-party services, such as Google Maps. {company.name} has no control over those
          sites and is not responsible for their content, the services they offer or the way they process data.
        </p>
      ),
    },
    {
      id: 'responsabilita',
      title: 'Limitation of liability',
      content: (
        <p>
          The content of the Site is published with care, but is for information only and may not be complete or up to
          date. To the extent permitted by law, {company.name} is not liable for damage arising from the use of the Site or
          from being unable to access it. Liability for wilful misconduct or gross negligence remains (Art. 1229 of the
          Italian Civil Code).
        </p>
      ),
    },
    {
      id: 'dati-personali',
      title: 'Personal data',
      content: (
        <p>
          The processing of personal data and the use of cookies are described in the{' '}
          <a href={content.en.to('/privacy')}>privacy notice</a>.
        </p>
      ),
    },
    {
      id: 'modifiche',
      title: 'Changes',
      content: (
        <p>
          {company.name} may update these terms when the Site or the law changes. The version in force is always the one
          published on this page, with the date of the last update shown at the top.
        </p>
      ),
    },
    {
      id: 'legge',
      title: 'Governing law',
      content: (
        <p>
          These terms are governed by Italian law. Any dispute falls under the court set by law; where the user is a
          consumer, the court of their place of residence or domicile. Comments and suggestions can be sent to {mail}.
        </p>
      ),
    },
  ],
};

export const privacy: Record<Lang, LegalDoc> = { it: privacyIt, en: privacyEn };
export const terms: Record<Lang, LegalDoc> = { it: termsIt, en: termsEn };
