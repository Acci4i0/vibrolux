import { BROCHURE, company, foto, img, linker, maps, video, type FooterLink, type Lavorazione, type NavItem } from './shared';

/** Italian texts (from vibrolux.it and vibrolux_brochure.pdf). en.ts mirrors this shape. */

const to = linker('it');
const vat = `P.IVA / CF ${company.vatNumber}`;

const lavorazioni: Lavorazione[] = [
  {
    id: 'lavaggi-e-oliature',
    title: 'Lavaggi e oliature',
    text: 'Linea automatica per trattamenti di disoleatura, lavaggio, asciugatura e vari tipi di oliatura (dewatering).',
    short: 'Disoleatura, lavaggio, asciugatura e oliatura dewatering in linea automatica.',
    media: foto('mg_7742b.jpg'),
    hero: foto('mg_7742b.jpg', 16 / 9),
    intro: [
      'Una linea automatica dedicata ai trattamenti di disoleatura, lavaggio, asciugatura e oliatura dei particolari metallici.',
      'I pezzi vengono liberati da oli e residui delle lavorazioni precedenti e, dove richiesto, protetti con diversi tipi di oliatura, compresa l’oliatura dewatering, che allontana l’umidità residua dalle superfici.',
    ],
  },
  {
    id: 'sabbiatura',
    title: 'Sabbiatura',
    text: 'Procedimento intermedio del ciclo di lavorazione: asporta ossido, vernice o calcificazioni su leghe metalliche. Linea di sabbiatrici, sabbiatrici a tappeto e a grappolo, cabina per particolari di grandi dimensioni.',
    short: 'Asportazione di ossidi, vernici e calcificazioni su leghe metalliche.',
    media: foto('mg_8531.jpg'),
    hero: foto('mg_7661-1.jpg', 16 / 9),
    intro: [
      'La sabbiatura è un procedimento intermedio del ciclo di lavorazione del prodotto: lo strato asportato può essere ossido, vernice o calcificazione, su leghe metalliche in genere.',
      'Il reparto dispone di una linea di sabbiatrici, di sabbiatrici a tappeto, di una sabbiatrice a grappolo per ingombri fino a 1300 × 1800 mm, anche per materiale delicato, e di una cabina per la sabbiatura manuale di particolari di grandi dimensioni.',
    ],
    impianti: {
      eyebrow: 'Gli impianti',
      items: [
        { label: 'Linea', text: 'Area attrezzata per le lavorazioni di sabbiatura.', media: foto('mg_7658.jpg', 4 / 5) },
        { label: 'Tappeto', text: 'Sabbiatrici a tappeto per leghe metalliche in genere.', media: foto('2mg_8531.jpg', 4 / 5) },
        { label: 'Grappolo', text: 'Sabbiatrice a grappolo per ingombri fino a 1300 × 1800 mm, anche per materiale delicato.', media: foto('mg_8507.jpg', 4 / 5) },
        { label: 'Cabina', text: 'Impianto di sabbiatura manuale per particolari di grandi dimensioni.', media: foto('mg_8275.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'vibrofinitura',
    title: 'Vibrofinitura',
    text: 'Impianti di barilatura per asportare bave di stampaggio e di fusione: finitura superficiale di particolari in acciaio, ferro, alluminio, ottone. Asciugatura con granulato vegetale o aria calda.',
    short: 'Sbavatura e finitura di particolari in acciaio, ferro, alluminio e ottone.',
    media: foto('mg_8709.jpg'),
    hero: foto('mg_7760.jpg', 16 / 9),
    intro: [
      'Un processo di trattamento fisico per la finitura superficiale di particolari di diverso materiale: acciaio, ferro, alluminio, ottone.',
      'Gli impianti di barilatura asportano le bave di stampaggio e di fusione; i vibratori lavorano con inserti ceramici o in auto burattatura, e i pezzi vengono asciugati con granulato vegetale o in centrifuga ad aria calda.',
    ],
    impianti: {
      eyebrow: 'Gli impianti',
      items: [
        { label: 'Barilatura', text: 'Linea per asportare bave di stampaggio e di fusione.', media: foto('mg_7804-1.jpg', 4 / 5) },
        { label: 'Vibratore', text: 'Barilatura con inserti ceramici e auto burattatura.', media: foto('mg_7874.jpg', 4 / 5) },
        { label: 'Asciugatore', text: 'Asciugatura dei pezzi tramite granulato vegetale.', media: foto('macchina-ritoccata.jpg', 4 / 5) },
        { label: 'Centrifuga', text: 'Asciugatura dei pezzi tramite aria calda.', media: foto('mg_8071.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'tribofinitura-isotropica',
    title: 'Tribofinitura isotropica',
    text: 'Processo ottenuto tramite vibrofinitura, assolutamente non aggressivo, capace di garantire rugosità molto basse (Ra 0,01 o anche inferiori) e superfici molto lucide.',
    short: 'Superfici molto lucide, con rugosità fino a Ra 0,01.',
    media: foto('mg_7891.jpg'),
    hero: foto('mg_8253.jpg', 16 / 9),
    intro: [
      'Un processo ottenuto tramite vibrofinitura, assolutamente non aggressivo, capace di garantire rugosità molto basse, fino a Ra 0,01 o anche inferiori, e superfici molto lucide.',
      'Il controllo qualità verifica il risultato sul singolo pezzo, confrontandolo prima e dopo il trattamento.',
    ],
    impianti: {
      eyebrow: 'Dal pezzo al risultato',
      items: [
        { label: 'Impianto', text: 'Impianto per tribofinitura isotropica.', media: foto('mg_8253.jpg', 4 / 5) },
        { label: 'Controllo', text: 'Il controllo qualità sul singolo pezzo, prima e dopo il trattamento.', media: foto('mg_8343.jpg', 4 / 5) },
        { label: 'Risultato', text: 'Superfici molto lucide, con rugosità fino a Ra 0,01 o inferiori.', media: foto('prima-dopo2222.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'lavaggio-statico',
    title: 'Lavaggio statico',
    text: 'Impianto di lavaggio dedicato ai particolari delicati.',
    short: 'Un impianto di lavaggio dedicato ai particolari delicati.',
    media: foto('mg_7677-1.jpg'),
    hero: foto('mg_7684.jpg', 16 / 9),
    intro: [
      'Un impianto di lavaggio dedicato ai particolari delicati, che vengono trattati senza essere movimentati.',
      'Si affianca alla linea automatica di lavaggi e oliature per i pezzi che richiedono più attenzione.',
    ],
  },
  {
    id: 'brillantatura',
    title: 'Brillantatura',
    text: 'Impianto automatico per la lucidatura tramite microsfere e appositi additivi.',
    short: 'Lucidatura automatica con microsfere e additivi.',
    media: foto('mg_8469.jpg'),
    hero: foto('mg_8051.jpg', 16 / 9),
    intro: [
      'Un impianto automatico per la lucidatura dei particolari tramite microsfere e appositi additivi.',
      'Il trattamento restituisce superfici brillanti e uniformi, a completamento delle altre lavorazioni di finitura.',
    ],
  },
];

const nav: NavItem[] = [
  {
    label: 'Azienda',
    href: to('/azienda'),
    children: [
      { label: 'Chi siamo', href: to('/azienda#chi-siamo') },
      { label: 'La sede', href: to('/azienda#sede') },
      { label: 'Qualità', href: to('/azienda#qualita') },
    ],
  },
  {
    label: 'Lavorazioni',
    href: to('/lavorazioni'),
    children: lavorazioni.map((l) => ({ label: l.title, href: to(`/lavorazioni/${l.id}`) })),
  },
  {
    label: 'Contatti',
    href: to('/contatti'),
    children: [
      { label: 'Sede', href: to('/contatti#dove-siamo') },
      { label: 'Scrivici', href: `mailto:${company.email}` },
      { label: 'Brochure', href: BROCHURE, external: true },
    ],
  },
];

const footer: { columns: { title: string; links: FooterLink[] }[]; legalLinks: FooterLink[] } = {
  columns: [
    {
      title: 'Azienda',
      links: [
        { label: 'Home', href: to('/') },
        { label: 'Azienda', href: to('/azienda') },
        { label: 'Lavorazioni', href: to('/lavorazioni') },
        { label: 'Contatti', href: to('/contatti') },
      ],
    },
    { title: 'Lavorazioni', links: lavorazioni.map((l) => ({ label: l.title, href: to(`/lavorazioni/${l.id}`) })) },
    {
      title: 'Contatti',
      links: [
        { label: company.tel, href: company.telHref },
        { label: company.email, href: `mailto:${company.email}` },
        { label: 'Posizione', confirm: 'Apri posizione', href: maps.google, hrefApple: maps.apple },
        { label: 'Brochure', href: BROCHURE },
      ],
    },
  ],
  legalLinks: [
    { label: 'Privacy', href: to('/privacy') },
    { label: 'Termini e condizioni', href: to('/termini-e-condizioni') },
  ],
};

const address = [...company.street, 'Italia'];

export const it = {
  to,
  meta: {
    title: 'Vibrolux • Trattamenti superficiali dei metalli',
    description:
      'Vibrolux Srl, Sant’Ambrogio (TO): sabbiatura, vibrofinitura, tribofinitura isotropica, brillantatura, lavaggi e oliature. Certificata ISO 9001:2015.',
    pages: { azienda: 'Azienda', lavorazioni: 'Lavorazioni', contatti: 'Contatti', privacy: 'Privacy', termini: 'Termini e condizioni' },
  },
  /** short interface texts */
  ui: {
    home: 'Home',
    menu: 'Menu',
    open: (what: string) => `Apri ${what}`,
    language: 'Lingua',
    contents: 'Indice',
    lastUpdated: 'Ultimo aggiornamento',
    learnMore: 'Approfondisci',
    processes: 'Lavorazioni',
    process: 'Lavorazione',
    otherProcesses: 'Altre lavorazioni',
    requestQuote: 'Richiedi un preventivo',
    downloadBrochure: 'Scarica la brochure',
  },
  address,
  vat,
  /** © + P.IVA: footer legal area and mobile menu */
  legal: [`© 2026 ${company.name}`, vat],
  lavorazioni,
  nav,
  navCtas: [
    { label: 'Richiedi un preventivo', href: to('/contatti'), tone: 'white' as const },
    { label: 'Scarica la brochure', href: BROCHURE, tone: 'blackfade' as const },
  ],
  footer,
  /** Link columns at the bottom of the mobile menu */
  menuFooter: [
    { title: 'Contatti', links: [{ label: company.tel, href: company.telHref }, { label: company.email, href: `mailto:${company.email}` }] },
    { title: 'Sede', links: address.map((label) => ({ label, href: to('/contatti#dove-siamo') })) },
  ],

  /* ───────── Home ───────── */
  home: {
    hero: {
      media: video('hero-home.mp4'),
      headline: 'Trattamenti superficiali dei metalli',
      cta: { label: 'Le lavorazioni', href: to('/lavorazioni') },
      corner: {
        heading: 'Brochure',
        text: 'Lavorazioni e impianti in un unico documento.',
        media: foto('mg_8489.jpg'),
        href: BROCHURE,
      },
    },
    intro: {
      eyebrow: 'Azienda',
      paragraphs: [
        'Vibrolux ha acquisito negli anni un’esperienza sempre più qualificata nella finitura dei metalli, affermandosi come azienda leader del settore.',
        'Il personale altamente qualificato consente di raggiungere un obiettivo primario: essere una realtà del territorio fortemente specializzata, in grado di ottenere risultati al massimo livello.',
      ],
      cta: { label: 'L’azienda', href: to('/azienda') },
    },
    cards: [
      { label: 'Lavorazioni', href: to('/lavorazioni'), media: foto('2_mg_8520.jpg') },
      { label: 'Contatti', href: to('/contatti'), media: foto('vibrolux_azienda.jpg') },
    ],
    beforeAfter: {
      eyebrow: 'Tribofinitura isotropica',
      items: [
        { label: 'Prima', text: 'Il particolare prima del trattamento: bave, ossidi e rugosità della lavorazione.', media: foto('ingranaggio-prima.jpg', 4 / 5) },
        { label: 'Dopo', text: 'Rugosità fino a Ra 0,01 o inferiori e superfici molto lucide, con un processo non aggressivo.', media: foto('ingranaggio-dopo.jpg', 4 / 5) },
      ],
    },
    lavorazioniIntro: {
      eyebrow: 'Il reparto',
      paragraphs: [
        'Un reparto operativo altamente tecnologico, con vibratori, brillantatrici, sabbiatrici, mezzi di sollevamento e autocarri, per ogni fase della finitura dei metalli.',
      ],
      cta: { label: 'Tutte le lavorazioni', href: to('/lavorazioni') },
    },
    values: {
      eyebrow: 'Perché Vibrolux',
      text: 'Quattro principi che guidano ogni lavorazione.',
      items: [
        { label: '01', title: 'Servizi qualificati', href: to('/lavorazioni'), media: foto('mg_7804-1.jpg') },
        { label: '02', title: 'Standard di qualità', href: to('/azienda#qualita'), media: foto('mg_8343.jpg') },
        { label: '03', title: 'Team specializzato', href: to('/azienda'), media: foto('mg_8275.jpg') },
        { label: '04', title: 'Risultati al massimo livello', href: to('/lavorazioni'), media: foto('ricevuta-1.jpg') },
      ],
    },
  },

  /* ───────── Azienda ───────── */
  azienda: {
    hero: {
      media: foto('cover_1.jpg', 16 / 9),
      headline: 'Esperienza qualificata nel trattamento dei metalli',
      cta: { label: 'Contattaci', href: to('/contatti') },
    },
    intro: {
      id: 'chi-siamo',
      eyebrow: 'Chi siamo',
      paragraphs: [
        'Vibrolux ha acquisito negli anni un’esperienza sempre più qualificata in materia di finiture dei metalli: barilatura, brillantatura, sabbiatura, tribofinitura isotropica, lavaggi e oliature dewatering.',
        'Il buon funzionamento dei processi produttivi e organizzativi ha consolidato nel tempo i rapporti con grandi gruppi e ampliato il portfolio clienti, rafforzando competitività e posizionamento sul mercato.',
      ],
    },
    sede: {
      id: 'sede',
      eyebrow: 'La sede',
      items: [
        { label: 'Officina', text: 'L’officina è strutturata in diversi reparti di produzione, con aree per il materiale finito e per il carico e scarico dei mezzi.', media: foto('vibrolux_azienda2-1.jpg', 4 / 5) },
        { label: 'Magazzino', text: 'Un magazzino di 400 mq completa la sede per lo stoccaggio.', media: img('pezzi-torniti.jpg', 4 / 5) },
        { label: 'Qualità', text: 'Un’area dedicata al controllo qualità, con strumenti di misura e verifica.', media: foto('mg_8343.jpg', 4 / 5) },
      ],
    },
    stats: {
      eyebrow: 'In numeri',
      text: 'La sede operativa si sviluppa su una superficie complessiva di 3500 mq.',
      cta: { label: 'Dove siamo', href: to('/contatti#dove-siamo') },
      items: [
        { value: '2000 mq', caption: 'Fabbricati: lavorazioni, stoccaggio e uffici direzionali' },
        { value: '1500 mq', caption: 'Aree scoperte per movimentazione e logistica' },
        { value: '400 mq', caption: 'Magazzino per lo stoccaggio' },
      ],
      media: foto('vibrolux_azienda.jpg'),
    },
    pillars: {
      eyebrow: 'Metodo',
      text: 'Tre principi alla base del nostro lavoro.',
      items: [
        { label: '01', title: 'Esperienza e qualificazione', href: to('/lavorazioni'), media: foto('mg_7658.jpg') },
        { label: '02', title: 'Analisi dei processi', href: to('/lavorazioni'), media: foto('mg_8253.jpg') },
        { label: '03', title: 'Soddisfazione del cliente', href: to('/contatti'), media: foto('mg_8489.jpg') },
      ],
    },
    quality: {
      id: 'qualita',
      eyebrow: 'Qualità',
      paragraphs: [
        'L’azienda è certificata ISO 9001:2015 ed è dotata degli strumenti di misura e verifica necessari per raggiungere gli standard qualitativi richiesti da ciascun cliente.',
      ],
      cta: { label: 'Richiedi un preventivo', href: to('/contatti') },
    },
  },

  /* ───────── Lavorazioni ───────── */
  lavorazioniPage: {
    hero: {
      media: foto('mg_7804-1.jpg', 16 / 9),
      headline: 'Le nostre lavorazioni',
      cta: { label: 'Scarica la brochure', href: BROCHURE },
      corner: { heading: 'Certificazione', text: 'Sistema qualità certificato ISO 9001:2015.', media: foto('mg_8343.jpg'), href: to('/azienda#qualita') },
    },
    /** intro of the tiles grid (replaces the two stacked text blocks) */
    index: {
      eyebrow: 'Le lavorazioni',
      headline: 'Sei lavorazioni per la finitura superficiale dei metalli.',
      text: 'Un reparto operativo altamente tecnologico, con vibratori, brillantatrici e sabbiatrici. Scegli una lavorazione per vedere impianti e dettagli.',
      facts: [
        { label: 'Materiali', value: 'Acciaio, ferro, alluminio, ottone' },
        { label: 'Sabbiatura a grappolo', value: 'Fino a 1300 × 1800 mm' },
        { label: 'Tribofinitura', value: 'Rugosità fino a Ra 0,01' },
        { label: 'Qualità', value: 'Certificata ISO 9001:2015' },
      ],
    },
    cards: [
      { label: 'Scarica la brochure', href: BROCHURE, media: foto('mg_8489.jpg') },
      { label: 'Richiedi un preventivo', href: to('/contatti'), media: foto('mg_8275.jpg') },
    ],
  },

  /* ───────── Contatti ───────── */
  contatti: {
    hero: {
      media: foto('facciata.jpg', 16 / 9),
      headline: 'Contatti',
      cta: { label: 'Scrivici', href: `mailto:${company.email}` },
    },
    eyebrow: 'Sede amministrativa e stabilimento',
    /** mail list: one address per need, what it is for underneath */
    emails: [
      { address: company.emails.info, use: 'Informazioni generali e preventivi' },
      { address: company.emails.service, use: 'Assistenza su lavorazioni e consegne' },
      { address: company.emails.commerciale, use: 'Offerte e rapporti commerciali' },
    ],
    keys: { tel: 'Tel', pec: 'PEC', vat: 'P.IVA' },
    mapTitle: 'Mappa Vibrolux',
  },
};

export type Site = typeof it;
