import { BROCHURE, company, img, linker, maps, video, type FooterLink, type Lavorazione, type NavItem } from './shared';
import type { Site } from './it';

/** English texts: same shape as it.ts, same slugs under /en. British spelling, decimal point. */

const to = linker('en');
const vat = `VAT / Tax code ${company.vatNumber}`;

const lavorazioni: Lavorazione[] = [
  {
    id: 'lavaggi-e-oliature',
    title: 'Washing and oiling',
    text: 'Automatic line for degreasing, washing, drying and various types of oiling, dewatering included.',
    short: 'Degreasing, washing, drying and dewatering oil on an automatic line.',
    media: img('barilatura-catena.jpg'),
    hero: img('barilatura-catena.jpg', 16 / 9),
    intro: [
      'An automatic line for degreasing, washing, drying and oiling metal parts.',
      'Parts are cleared of the oils and residues left by earlier machining and, where required, protected with different types of oil, including dewatering oil, which drives residual moisture off the surface.',
    ],
  },
  {
    id: 'sabbiatura',
    title: 'Sandblasting',
    text: 'An intermediate step in the production cycle: it removes oxide, paint or scale from metal alloys. A line of blasting machines, tumble-belt and hanger blasters, and a booth for large parts.',
    short: 'Removal of oxides, paint and scale from metal alloys.',
    media: img('sabbiatura-operatore.jpg'),
    hero: img('sabbiatura-cabina-manuale.jpg', 16 / 9),
    intro: [
      'Sandblasting is an intermediate step in a product’s manufacturing cycle: the layer removed can be oxide, paint or scale, on metal alloys in general.',
      'The department runs a line of blasting machines, tumble-belt blasters, a hanger blaster for parts up to 1300 × 1800 mm, delicate material included, and a booth for the manual blasting of large parts.',
    ],
    impianti: {
      eyebrow: 'The equipment',
      items: [
        { label: 'Line', text: 'An area equipped for blasting work.', media: img('sala-sabbiatura.jpg', 4 / 5) },
        { label: 'Belt', text: 'Tumble-belt blasters for metal alloys in general.', media: img('cabina-sabbiatura.jpg', 4 / 5) },
        { label: 'Hanger', text: 'Hanger blaster for parts up to 1300 × 1800 mm, delicate material included.', media: img('granigliatrice.png', 4 / 5) },
        { label: 'Booth', text: 'Manual blasting plant for large parts.', media: img('sabbiatura-cabina-manuale.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'vibrofinitura',
    title: 'Vibratory finishing',
    text: 'Barrel finishing plants that remove moulding and casting burrs: surface finishing of steel, iron, aluminium and brass parts. Drying in vegetable granulate or hot air.',
    short: 'Deburring and finishing of steel, iron, aluminium and brass parts.',
    media: img('vibratore-vasca.jpg'),
    hero: img('vibratore-vasca.jpg', 16 / 9),
    intro: [
      'A physical treatment for the surface finishing of parts in different materials: steel, iron, aluminium, brass.',
      'Barrel finishing plants remove moulding and casting burrs; the vibrators run with ceramic media or part-on-part, and the parts are dried in vegetable granulate or in a hot-air centrifuge.',
    ],
    impianti: {
      eyebrow: 'The equipment',
      items: [
        { label: 'Barrel', text: 'A line that removes moulding and casting burrs.', media: img('impianto-vibrofinitura.jpg', 4 / 5) },
        { label: 'Vibrator', text: 'Barrel finishing with ceramic media and part-on-part.', media: img('vibratore-vasca.jpg', 4 / 5) },
        { label: 'Dryer', text: 'Parts dried in vegetable granulate.', media: img('barilatura-catena.jpg', 4 / 5) },
        { label: 'Centrifuge', text: 'Parts dried with hot air.', media: img('graniglia.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'tribofinitura-isotropica',
    title: 'Isotropic superfinishing',
    text: 'A process achieved through vibratory finishing, entirely non-aggressive, that delivers very low roughness (Ra 0.01 or lower) and highly polished surfaces.',
    short: 'Highly polished surfaces, with roughness down to Ra 0.01.',
    media: img('chip-ceramici.jpg'),
    hero: img('chip-ceramici.jpg', 16 / 9),
    intro: [
      'A process achieved through vibratory finishing, entirely non-aggressive, that delivers very low roughness, down to Ra 0.01 or lower, and highly polished surfaces.',
      'Quality control checks the result on each part, comparing it before and after treatment.',
    ],
    impianti: {
      eyebrow: 'From part to result',
      items: [
        { label: 'Plant', text: 'Isotropic superfinishing plant.', media: img('impianto-vibrofinitura.jpg', 4 / 5) },
        { label: 'Inspection', text: 'Quality control on each part, before and after treatment.', media: img('pezzo-lucidato.jpg', 4 / 5) },
        { label: 'Result', text: 'Highly polished surfaces, with roughness down to Ra 0.01 or lower.', media: img('graniglia.jpg', 4 / 5) },
      ],
    },
  },
  {
    id: 'lavaggio-statico',
    title: 'Static washing',
    text: 'A washing plant dedicated to delicate parts.',
    short: 'A washing plant dedicated to delicate parts.',
    media: img('pezzi-torniti.jpg'),
    hero: img('pezzi-torniti.jpg', 16 / 9),
    intro: [
      'A washing plant dedicated to delicate parts, which are treated without being moved.',
      'It works alongside the automatic washing and oiling line, for the parts that need more care.',
    ],
  },
  {
    id: 'brillantatura',
    title: 'Burnishing',
    text: 'An automatic plant for polishing with micro-beads and dedicated additives.',
    short: 'Automatic polishing with micro-beads and additives.',
    media: img('graniglia.jpg'),
    hero: img('graniglia.jpg', 16 / 9),
    intro: [
      'An automatic plant for polishing parts with micro-beads and dedicated additives.',
      'The treatment leaves bright, even surfaces, completing the other finishing processes.',
    ],
  },
];

const nav: NavItem[] = [
  {
    label: 'Company',
    href: to('/azienda'),
    children: [
      { label: 'About us', href: to('/azienda#chi-siamo') },
      { label: 'Our site', href: to('/azienda#sede') },
      { label: 'Quality', href: to('/azienda#qualita') },
    ],
  },
  {
    label: 'Processes',
    href: to('/lavorazioni'),
    children: lavorazioni.map((l) => ({ label: l.title, href: to(`/lavorazioni/${l.id}`) })),
  },
  {
    label: 'Contact',
    href: to('/contatti'),
    children: [
      { label: 'Location', href: to('/contatti#dove-siamo') },
      { label: 'Email us', href: `mailto:${company.email}` },
      { label: 'Brochure', href: BROCHURE, external: true },
    ],
  },
];

const footer: { columns: { title: string; links: FooterLink[] }[]; legalLinks: FooterLink[] } = {
  columns: [
    {
      title: 'Company',
      links: [
        { label: 'Home', href: to('/') },
        { label: 'Company', href: to('/azienda') },
        { label: 'Processes', href: to('/lavorazioni') },
        { label: 'Contact', href: to('/contatti') },
      ],
    },
    { title: 'Processes', links: lavorazioni.map((l) => ({ label: l.title, href: to(`/lavorazioni/${l.id}`) })) },
    {
      title: 'Contact',
      links: [
        { label: company.tel, href: company.telHref },
        { label: company.email, href: `mailto:${company.email}` },
        { label: 'Location', confirm: 'Open location', href: maps.google, hrefApple: maps.apple },
        { label: 'Brochure', href: BROCHURE },
      ],
    },
  ],
  legalLinks: [
    { label: 'Privacy', href: to('/privacy') },
    { label: 'Terms and conditions', href: to('/termini-e-condizioni') },
  ],
};

const address = [...company.street, 'Italy'];

export const en: Site = {
  to,
  meta: {
    title: 'Vibrolux • Surface treatments for metals',
    description:
      'Vibrolux Srl, Sant’Ambrogio (Turin, Italy): sandblasting, vibratory finishing, isotropic superfinishing, burnishing, washing and oiling. ISO 9001:2015 certified.',
    pages: { azienda: 'Company', lavorazioni: 'Processes', contatti: 'Contact', privacy: 'Privacy', termini: 'Terms and conditions' },
  },
  ui: {
    home: 'Home',
    menu: 'Menu',
    open: (what: string) => `Open ${what}`,
    language: 'Language',
    contents: 'Contents',
    lastUpdated: 'Last updated',
    learnMore: 'Learn more',
    processes: 'Processes',
    process: 'Process',
    otherProcesses: 'Other processes',
    requestQuote: 'Request a quote',
    downloadBrochure: 'Download the brochure',
  },
  address,
  vat,
  legal: [`© 2026 ${company.name}`, vat],
  lavorazioni,
  nav,
  navCtas: [
    { label: 'Request a quote', href: to('/contatti'), tone: 'white' as const },
    { label: 'Download the brochure', href: BROCHURE, tone: 'blackfade' as const },
  ],
  footer,
  menuFooter: [
    { title: 'Contact', links: [{ label: company.tel, href: company.telHref }, { label: company.email, href: `mailto:${company.email}` }] },
    { title: 'Location', links: address.map((label) => ({ label, href: to('/contatti#dove-siamo') })) },
  ],

  /* ───────── Home ───────── */
  home: {
    hero: {
      media: video('hero-home.mp4'),
      headline: 'Surface treatments for metals',
      cta: { label: 'Our processes', href: to('/lavorazioni') },
      corner: {
        heading: 'Brochure',
        text: 'Processes and plants in a single document.',
        media: img('ceramica-piramide.jpg'),
        href: BROCHURE,
      },
    },
    intro: {
      eyebrow: 'Company',
      paragraphs: [
        'Over the years Vibrolux has built ever more qualified expertise in metal finishing, establishing itself as a leader in the field.',
        'Highly qualified people let us reach a primary goal: to be a highly specialised local business, able to deliver results at the highest level.',
      ],
      cta: { label: 'The company', href: to('/azienda') },
    },
    cards: [
      { label: 'Processes', href: to('/lavorazioni'), media: img('sabbiatura-cabina-manuale.jpg') },
      { label: 'Contact', href: to('/contatti'), media: img('reparto-produzione.jpg') },
    ],
    beforeAfter: {
      eyebrow: 'Isotropic superfinishing',
      items: [
        { label: 'Before', text: 'The part before treatment: burrs, oxides and machining roughness.', media: img('pezzi-torniti.jpg', 4 / 5) },
        { label: 'After', text: 'Roughness down to Ra 0.01 or lower and highly polished surfaces, with a non-aggressive process.', media: img('pezzo-lucidato.jpg', 4 / 5) },
      ],
    },
    lavorazioniIntro: {
      eyebrow: 'The department',
      paragraphs: [
        'A highly technological operations department, with vibrators, burnishing machines, blasting machines, lifting equipment and trucks, for every stage of metal finishing.',
      ],
      cta: { label: 'All processes', href: to('/lavorazioni') },
    },
    values: {
      eyebrow: 'Why Vibrolux',
      text: 'Four principles behind every process.',
      items: [
        { label: '01', title: 'Qualified services', href: to('/lavorazioni'), media: img('impianto-vibrofinitura.jpg') },
        { label: '02', title: 'Quality standards', href: to('/azienda#qualita'), media: img('pezzo-lucidato.jpg') },
        { label: '03', title: 'Specialised team', href: to('/azienda'), media: img('reparto-produzione.jpg') },
        { label: '04', title: 'Results at the highest level', href: to('/lavorazioni'), media: img('cabina-sabbiatura.jpg') },
      ],
    },
  },

  /* ───────── Company ───────── */
  azienda: {
    hero: {
      media: video('hero-azienda.mp4'),
      headline: 'Qualified expertise in metal treatment',
      cta: { label: 'Contact us', href: to('/contatti') },
    },
    intro: {
      id: 'chi-siamo',
      eyebrow: 'About us',
      paragraphs: [
        'Over the years Vibrolux has built ever more qualified expertise in metal finishing: barrel finishing, burnishing, sandblasting, isotropic superfinishing, washing and dewatering oiling.',
        'Well-run production and organisational processes have strengthened our relationships with large groups over time and broadened our client portfolio, reinforcing our competitiveness and our position in the market.',
      ],
    },
    sede: {
      id: 'sede',
      eyebrow: 'Our site',
      items: [
        { label: 'Workshop', text: 'The workshop is organised into several production departments, with areas for finished material and for loading and unloading vehicles.', media: img('reparto-produzione.jpg', 4 / 5) },
        { label: 'Warehouse', text: 'A 400 m² warehouse completes the site for storage.', media: img('pezzi-torniti.jpg', 4 / 5) },
        { label: 'Quality', text: 'An area dedicated to quality control, with measuring and inspection instruments.', media: img('pezzo-lucidato.jpg', 4 / 5) },
      ],
    },
    stats: {
      eyebrow: 'In numbers',
      text: 'The operating site covers a total area of 3500 m².',
      cta: { label: 'Where we are', href: to('/contatti#dove-siamo') },
      items: [
        { value: '2000 m²', caption: 'Buildings: processing, storage and head offices' },
        { value: '1500 m²', caption: 'Open areas for handling and logistics' },
        { value: '400 m²', caption: 'Warehouse for storage' },
      ],
      media: img('sala-sabbiatura.jpg'),
    },
    pillars: {
      eyebrow: 'Method',
      text: 'Three principles at the heart of our work.',
      items: [
        { label: '01', title: 'Experience and qualification', href: to('/lavorazioni'), media: img('sabbiatura-cabina-manuale.jpg') },
        { label: '02', title: 'Process analysis', href: to('/lavorazioni'), media: img('vibratore-vasca.jpg') },
        { label: '03', title: 'Customer satisfaction', href: to('/contatti'), media: img('impianto-vibrofinitura.jpg') },
      ],
    },
    quality: {
      id: 'qualita',
      eyebrow: 'Quality',
      paragraphs: [
        'The company is ISO 9001:2015 certified and has the measuring and inspection instruments needed to meet the quality standards each client requires.',
      ],
      cta: { label: 'Request a quote', href: to('/contatti') },
    },
  },

  /* ───────── Processes ───────── */
  lavorazioniPage: {
    hero: {
      media: video('hero-lavorazioni.mp4'),
      headline: 'Our processes',
      cta: { label: 'Download the brochure', href: BROCHURE },
      corner: { heading: 'Certification', text: 'ISO 9001:2015 certified quality system.', media: img('chip-ceramici.jpg'), href: to('/azienda#qualita') },
    },
    index: {
      eyebrow: 'The processes',
      headline: 'Six processes for the surface finishing of metals.',
      text: 'A highly technological operations department, with vibrators, burnishing machines and blasting machines. Choose a process to see its plants and details.',
      facts: [
        { label: 'Materials', value: 'Steel, iron, aluminium, brass' },
        { label: 'Hanger blasting', value: 'Up to 1300 × 1800 mm' },
        { label: 'Superfinishing', value: 'Roughness down to Ra 0.01' },
        { label: 'Quality', value: 'ISO 9001:2015 certified' },
      ],
    },
    cards: [
      { label: 'Download the brochure', href: BROCHURE, media: img('ceramica-piramide.jpg') },
      { label: 'Request a quote', href: to('/contatti'), media: img('sabbiatura-operatore.jpg') },
    ],
  },

  /* ───────── Contact ───────── */
  contatti: {
    hero: {
      media: video('hero-contatti.mp4'),
      headline: 'Contact',
      cta: { label: 'Email us', href: `mailto:${company.email}` },
    },
    eyebrow: 'Head office and plant',
    emails: [
      { address: company.emails.info, use: 'General enquiries and quotes' },
      { address: company.emails.service, use: 'Support on processes and deliveries' },
      { address: company.emails.commerciale, use: 'Offers and commercial relations' },
    ],
    keys: { tel: 'Tel', pec: 'PEC', vat: 'VAT' },
    mapTitle: 'Vibrolux map',
  },
};
