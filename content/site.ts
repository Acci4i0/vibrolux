import type { MediaData } from '@/components/Media';

/**
 * Site content. Texts come from vibrolux.it and vibrolux_brochure.pdf.
 * PREVIEW MEDIA: photos/videos in /public/assets/preview are stock/Commons stand-ins (see CREDITS.md there),
 * to be replaced with Vibrolux's own shots. img() without a file renders the black placeholder.
 */

/** Site sub-path on GitHub Pages ('' locally): media and internal links carry it, next/link and router.push add it themselves. */
export const BASE = process.env.BASE_PATH ?? '';
export const withBase = (path: string) => BASE + path;

const BROCHURE = withBase('/assets/vibrolux-brochure.pdf');
const P = withBase('/assets/preview/');
/** where the subject sits in photos whose centre isn't the subject */
const FOCUS: Record<string, string> = { 'impianto-vibrofinitura.jpg': '80% 55%' };
const img = (file?: string, aspect = 1): MediaData => ({ src: file && P + file, aspect, focus: file && FOCUS[file] });
const video = (file: string): MediaData => ({ type: 'video', src: P + file, aspect: 16 / 9 });

/* ───────── Shared ───────── */

export const company = {
  name: 'Vibrolux Srl',
  address: ['Via Don Emilio Berto, 6', '10057 Sant’Ambrogio (TO)', 'Italia'],
  tel: '+39\u00a0011\u00a093\u00a048\u00a0197', // non-breaking: never split across lines
  telHref: 'tel:+390119348197',
  fax: '011\u00a093\u00a067\u00a0884 / 011\u00a093\u00a019\u00a0691',
  email: 'info@vibrolux.it',
  pec: 'vibroluxsrl@pec.it',
  vat: 'P.IVA / CF 08270030011',
  iso: 'ISO 9001:2015',
  maps: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2816.7607632673407!2d7.377691215931506!3d45.09064427909836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4788462dac3fab3d%3A0xfaf018a173a6521a!2sVibrolux+Srl!5e0!3m2!1sit!2sit!4v1548257158260',
  brochure: BROCHURE,
};

type Slide = { label: string; text: string; media: MediaData };

export type Lavorazione = {
  id: string;
  title: string;
  /** home accordion */
  text: string;
  /** one line on the lavorazioni tiles */
  short: string;
  media: MediaData;
  /** detail page /lavorazioni/[id] */
  hero: MediaData;
  intro: string[];
  impianti?: { eyebrow: string; items: Slide[] };
};

export const lavorazioni: Lavorazione[] = [
  {
    id: 'lavaggi-e-oliature',
    title: 'Lavaggi e oliature',
    text: 'Linea automatica per trattamenti di disoleatura, lavaggio, asciugatura e vari tipi di oliatura (dewatering).',
    short: 'Disoleatura, lavaggio, asciugatura e oliatura dewatering in linea automatica.',
    media: img('barilatura-catena.jpg'),
    hero: img('barilatura-catena.jpg', 16 / 9),
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
    media: img('sabbiatura-operatore.jpg'),
    hero: img('sabbiatura-cabina-manuale.jpg', 16 / 9),
    intro: [
      'La sabbiatura è un procedimento intermedio del ciclo di lavorazione del prodotto: lo strato asportato può essere ossido, vernice o calcificazione, su leghe metalliche in genere.',
      'Il reparto dispone di una linea di sabbiatrici, di sabbiatrici a tappeto, di una sabbiatrice a grappolo per ingombri fino a 1300 × 1800 mm, anche per materiale delicato, e di una cabina per la sabbiatura manuale di particolari di grandi dimensioni.',
    ],
    impianti: {
      eyebrow: 'Gli impianti',
      items: [
        { label: 'Linea', text: 'Area attrezzata per le lavorazioni di sabbiatura.', media: img('sala-sabbiatura.jpg', 4 / 5) },
        { label: 'Tappeto', text: 'Sabbiatrici a tappeto per leghe metalliche in genere.', media: img('cabina-sabbiatura.jpg', 4 / 5) },
        { label: 'Grappolo', text: 'Sabbiatrice a grappolo per ingombri fino a 1300 × 1800 mm, anche per materiale delicato.', media: img('granigliatrice.png', 4 / 5) },
        { label: 'Cabina', text: 'Impianto di sabbiatura manuale per particolari di grandi dimensioni.', media: img('sabbiatura-cabina-manuale.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'vibrofinitura',
    title: 'Vibrofinitura',
    text: 'Impianti di barilatura per asportare bave di stampaggio e di fusione: finitura superficiale di particolari in acciaio, ferro, alluminio, ottone. Asciugatura con granulato vegetale o aria calda.',
    short: 'Sbavatura e finitura di particolari in acciaio, ferro, alluminio e ottone.',
    media: img('vibratore-vasca.jpg'),
    hero: img('vibratore-vasca.jpg', 16 / 9),
    intro: [
      'Un processo di trattamento fisico per la finitura superficiale di particolari di diverso materiale: acciaio, ferro, alluminio, ottone.',
      'Gli impianti di barilatura asportano le bave di stampaggio e di fusione; i vibratori lavorano con inserti ceramici o in auto burattatura, e i pezzi vengono asciugati con granulato vegetale o in centrifuga ad aria calda.',
    ],
    impianti: {
      eyebrow: 'Gli impianti',
      items: [
        { label: 'Barilatura', text: 'Linea per asportare bave di stampaggio e di fusione.', media: img('impianto-vibrofinitura.jpg', 4 / 5) },
        { label: 'Vibratore', text: 'Barilatura con inserti ceramici e auto burattatura.', media: img('vibratore-vasca.jpg', 4 / 5) },
        { label: 'Asciugatore', text: 'Asciugatura dei pezzi tramite granulato vegetale.', media: img('barilatura-catena.jpg', 4 / 5) },
        { label: 'Centrifuga', text: 'Asciugatura dei pezzi tramite aria calda.', media: img('graniglia.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'tribofinitura-isotropica',
    title: 'Tribofinitura isotropica',
    text: 'Processo ottenuto tramite vibrofinitura, assolutamente non aggressivo, capace di garantire rugosità molto basse (Ra 0,01 o anche inferiori) e superfici molto lucide.',
    short: 'Superfici molto lucide, con rugosità fino a Ra 0,01.',
    media: img('chip-ceramici.jpg'),
    hero: img('chip-ceramici.jpg', 16 / 9),
    intro: [
      'Un processo ottenuto tramite vibrofinitura, assolutamente non aggressivo, capace di garantire rugosità molto basse, fino a Ra 0,01 o anche inferiori, e superfici molto lucide.',
      'Il controllo qualità verifica il risultato sul singolo pezzo, confrontandolo prima e dopo il trattamento.',
    ],
    impianti: {
      eyebrow: 'Dal pezzo al risultato',
      items: [
        { label: 'Impianto', text: 'Impianto per tribofinitura isotropica.', media: img('impianto-vibrofinitura.jpg', 4 / 5) },
        { label: 'Controllo', text: 'Il controllo qualità sul singolo pezzo, prima e dopo il trattamento.', media: img('pezzo-lucidato.jpg', 4 / 5) },
        { label: 'Risultato', text: 'Superfici molto lucide, con rugosità fino a Ra 0,01 o inferiori.', media: img('graniglia.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'lavaggio-statico',
    title: 'Lavaggio statico',
    text: 'Impianto di lavaggio dedicato ai particolari delicati.',
    short: 'Un impianto di lavaggio dedicato ai particolari delicati.',
    media: img('pezzi-torniti.jpg'),
    hero: img('pezzi-torniti.jpg', 16 / 9),
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
    media: img('graniglia.jpg'),
    hero: img('graniglia.jpg', 16 / 9),
    intro: [
      'Un impianto automatico per la lucidatura dei particolari tramite microsfere e appositi additivi.',
      'Il trattamento restituisce superfici brillanti e uniformi, a completamento delle altre lavorazioni di finitura.',
    ],
  },
];

/** Tiles for the lavorazioni grid (listing page, and "altre lavorazioni" on a detail page) */
export const lavorazioneTiles = (excludeId?: string) =>
  lavorazioni
    .map((l, i) => ({ label: String(i + 1).padStart(2, '0'), title: l.title, text: l.short, href: withBase(`/lavorazioni/${l.id}`), media: l.media, id: l.id }))
    .filter((t) => t.id !== excludeId);

export type NavItem = { label: string; href: string; external?: boolean; children?: NavItem[] };

export const nav: NavItem[] = [
  {
    label: 'Azienda',
    href: withBase('/azienda'),
    children: [
      { label: 'Chi siamo', href: withBase('/azienda#chi-siamo') },
      { label: 'La sede', href: withBase('/azienda#sede') },
      { label: 'Qualità', href: withBase('/azienda#qualita') },
    ],
  },
  {
    label: 'Lavorazioni',
    href: withBase('/lavorazioni'),
    children: lavorazioni.map((l) => ({ label: l.title, href: withBase(`/lavorazioni/${l.id}`) })),
  },
  {
    label: 'Contatti',
    href: withBase('/contatti'),
    children: [
      { label: 'Sede', href: withBase('/contatti#dove-siamo') },
      { label: 'Scrivici', href: `mailto:${company.email}` },
      { label: 'Brochure', href: BROCHURE, external: true },
    ],
  },
];

export const navCtas = [
  { label: 'Richiedi un preventivo', href: withBase('/contatti'), tone: 'white' as const },
  { label: 'Scarica la brochure', href: BROCHURE, tone: 'blackfade' as const },
];

/** © + P.IVA: footer legal area and mobile menu */
export const legal = [`© 2026 ${company.name}`, company.vat];

/** `confirm`: the first tap only swaps the label to this, the second follows the link. `hrefApple`: used instead on Apple devices. */
export type FooterLink = { label: string; href: string; confirm?: string; hrefApple?: string };

const MAPS_QUERY = encodeURIComponent('Vibrolux Srl, Via Don Emilio Berto 6, 10057 Sant’Ambrogio di Torino TO');

export const footer: { columns: { title: string; links: FooterLink[] }[]; legalLinks: FooterLink[] } = {
  columns: [
    {
      title: 'Azienda',
      links: [
        { label: 'Home', href: withBase('/') },
        { label: 'Azienda', href: withBase('/azienda') },
        { label: 'Lavorazioni', href: withBase('/lavorazioni') },
        { label: 'Contatti', href: withBase('/contatti') },
      ],
    },
    { title: 'Lavorazioni', links: lavorazioni.map((l) => ({ label: l.title, href: withBase(`/lavorazioni/${l.id}`) })) },
    {
      title: 'Contatti',
      links: [
        { label: company.tel, href: company.telHref },
        { label: company.email, href: `mailto:${company.email}` },
        {
          label: 'Posizione',
          confirm: 'Apri posizione',
          href: `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`,
          hrefApple: `https://maps.apple.com/?q=${MAPS_QUERY}`,
        },
        { label: 'Brochure', href: BROCHURE },
      ],
    },
  ],
  legalLinks: [
    { label: 'Privacy', href: withBase('/privacy') },
    { label: 'Termini e condizioni', href: withBase('/termini-e-condizioni') },
  ],
};

/** Link columns at the bottom of the mobile menu */
export const menuFooter = [
  { title: 'Contatti', links: [{ label: company.tel, href: company.telHref }, { label: company.email, href: `mailto:${company.email}` }] },
  { title: 'Sede', links: company.address.map((label) => ({ label, href: withBase('/contatti#dove-siamo') })) },
];

/* ───────── Home ───────── */

export const home = {
  hero: {
    media: video('hero-home.mp4'),
    headline: 'Trattamenti superficiali dei metalli',
    cta: { label: 'Le lavorazioni', href: withBase('/lavorazioni') },
    corner: {
      heading: 'Brochure',
      text: 'Lavorazioni e impianti in un unico documento.',
      media: img('ceramica-piramide.jpg'),
      href: BROCHURE,
    },
  },
  intro: {
    eyebrow: 'Azienda',
    paragraphs: [
      'Vibrolux ha acquisito negli anni un’esperienza sempre più qualificata nella finitura dei metalli, affermandosi come azienda leader del settore.',
      'Il personale altamente qualificato consente di raggiungere un obiettivo primario: essere una realtà del territorio fortemente specializzata, in grado di ottenere risultati al massimo livello.',
    ],
    cta: { label: 'L’azienda', href: withBase('/azienda') },
  },
  cards: [
    { label: 'Lavorazioni', href: withBase('/lavorazioni'), media: img('sabbiatura-cabina-manuale.jpg') },
    { label: 'Contatti', href: withBase('/contatti'), media: img('reparto-produzione.jpg') },
  ],
  beforeAfter: {
    eyebrow: 'Tribofinitura isotropica',
    items: [
      { label: 'Prima', text: 'Il particolare prima del trattamento: bave, ossidi e rugosità della lavorazione.', media: img('pezzi-torniti.jpg', 4 / 5) },
      { label: 'Dopo', text: 'Rugosità fino a Ra 0,01 o inferiori e superfici molto lucide, con un processo non aggressivo.', media: img('pezzo-lucidato.jpg', 4 / 5) },
    ],
  },
  lavorazioniIntro: {
    eyebrow: 'Il reparto',
    paragraphs: [
      'Un reparto operativo altamente tecnologico, con vibratori, brillantatrici, sabbiatrici, mezzi di sollevamento e autocarri, per ogni fase della finitura dei metalli.',
    ],
    cta: { label: 'Tutte le lavorazioni', href: withBase('/lavorazioni') },
  },
  values: {
    eyebrow: 'Perché Vibrolux',
    text: 'Quattro principi che guidano ogni lavorazione.',
    items: [
      { label: '01', title: 'Servizi qualificati', href: withBase('/lavorazioni'), media: img('impianto-vibrofinitura.jpg') },
      { label: '02', title: 'Standard di qualità', href: withBase('/azienda#qualita'), media: img('pezzo-lucidato.jpg') },
      { label: '03', title: 'Team specializzato', href: withBase('/azienda'), media: img('reparto-produzione.jpg') },
      { label: '04', title: 'Risultati al massimo livello', href: withBase('/lavorazioni'), media: img('cabina-sabbiatura.jpg') },
    ],
  },
};

/* ───────── Azienda ───────── */

export const azienda = {
  hero: {
    media: video('hero-azienda.mp4'),
    headline: 'Esperienza qualificata nel trattamento dei metalli',
    cta: { label: 'Contattaci', href: withBase('/contatti') },
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
      { label: 'Officina', text: 'L’officina è strutturata in diversi reparti di produzione, con aree per il materiale finito e per il carico e scarico dei mezzi.', media: img('reparto-produzione.jpg', 4 / 5) },
      { label: 'Magazzino', text: 'Un magazzino di 400 mq completa la sede per lo stoccaggio.', media: img('pezzi-torniti.jpg', 4 / 5) },
      { label: 'Qualità', text: 'Un’area dedicata al controllo qualità, con strumenti di misura e verifica.', media: img('pezzo-lucidato.jpg', 4 / 5) },
    ],
  },
  stats: {
    eyebrow: 'In numeri',
    text: 'La sede operativa si sviluppa su una superficie complessiva di 3500 mq.',
    cta: { label: 'Dove siamo', href: withBase('/contatti#dove-siamo') },
    items: [
      { value: '2000 mq', caption: 'Fabbricati: lavorazioni, stoccaggio e uffici direzionali' },
      { value: '1500 mq', caption: 'Aree scoperte per movimentazione e logistica' },
      { value: '400 mq', caption: 'Magazzino per lo stoccaggio' },
    ],
    media: img('sala-sabbiatura.jpg'),
  },
  pillars: {
    eyebrow: 'Metodo',
    text: 'Tre principi alla base del nostro lavoro.',
    items: [
      { label: '01', title: 'Esperienza e qualificazione', href: withBase('/lavorazioni'), media: img('sabbiatura-cabina-manuale.jpg') },
      { label: '02', title: 'Analisi dei processi', href: withBase('/lavorazioni'), media: img('vibratore-vasca.jpg') },
      { label: '03', title: 'Soddisfazione del cliente', href: withBase('/contatti'), media: img('impianto-vibrofinitura.jpg') },
    ],
  },
  quality: {
    id: 'qualita',
    eyebrow: 'Qualità',
    paragraphs: [
      'L’azienda è certificata ISO 9001:2015 ed è dotata degli strumenti di misura e verifica necessari per raggiungere gli standard qualitativi richiesti da ciascun cliente.',
    ],
    cta: { label: 'Richiedi un preventivo', href: withBase('/contatti') },
  },
};

/* ───────── Lavorazioni ───────── */

export const lavorazioniPage = {
  hero: {
    media: video('hero-lavorazioni.mp4'),
    headline: 'Le nostre lavorazioni',
    cta: { label: 'Scarica la brochure', href: BROCHURE },
    corner: { heading: 'Certificazione', text: 'Sistema qualità certificato ISO 9001:2015.', media: img('chip-ceramici.jpg'), href: withBase('/azienda#qualita') },
  },
  /** intro of the tiles grid (replaces the two stacked text blocks) */
  index: {
    eyebrow: 'Le lavorazioni',
    headline: 'Sei lavorazioni per la finitura superficiale dei metalli.',
    text: 'Un reparto operativo altamente tecnologico, con vibratori, brillantatrici e sabbiatrici. Scegli una lavorazione per vedere impianti e dettagli.',
    facts: [
      { label: 'Materiali', value: 'Acciaio, ferro, alluminio, ottone' },
      { label: 'Sabbiatura a grappolo', value: 'Fino a 1300\u00a0×\u00a01800\u00a0mm' },
      { label: 'Tribofinitura', value: 'Rugosità fino a Ra\u00a00,01' },
      { label: 'Qualità', value: 'Certificata ISO\u00a09001:2015' },
    ],
  },
  cards: [
    { label: 'Scarica la brochure', href: BROCHURE, media: img('ceramica-piramide.jpg') },
    { label: 'Richiedi un preventivo', href: withBase('/contatti'), media: img('sabbiatura-operatore.jpg') },
  ],
};

/* ───────── Contatti ───────── */

export const contatti = {
  hero: {
    media: video('hero-contatti.mp4'),
    headline: 'Contatti',
    cta: { label: 'Scrivici', href: `mailto:${company.email}` },
  },
};
