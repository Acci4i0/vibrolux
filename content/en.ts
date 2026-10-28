import { BROCHURE, company, foto, img, linker, luogo, maps, video, type FooterLink, type Lavorazione, type NavItem } from './shared';
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
    media: img('gocce-metallo.jpg', 1, 'Water droplets on a metal surface'),
    hero: foto('mg_7742b.jpg', 16 / 9, 'The automatic washing and oiling line'),
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
    media: foto('mg_8531.jpg', 1, 'A tumble-belt blaster unloading treated parts'),
    hero: foto('mg_7661-1.jpg', 16 / 9, 'The blasting department'),
    intro: [
      'Sandblasting is an intermediate step in a product’s manufacturing cycle: the layer removed can be oxide, paint or scale, on metal alloys in general.',
      'The department runs a line of blasting machines, tumble-belt blasters, a hanger blaster for parts up to 1300 × 1800 mm, delicate material included, and a booth for the manual blasting of large parts.',
    ],
    impianti: {
      eyebrow: 'The equipment',
      items: [
        { label: 'Line', text: 'An area equipped for blasting work.', media: foto('mg_7658.jpg', 4 / 5, 'A blaster with its access walkway in the blasting department') },
        { label: 'Belt', text: 'Tumble-belt blasters for metal alloys in general.', media: foto('2mg_8531.jpg', 4 / 5, 'A tumble-belt blaster at work') },
        { label: 'Hanger', text: 'Hanger blaster for parts up to 1300 × 1800 mm, delicate material included.', media: foto('mg_8507.jpg', 4 / 5, 'A hanger blaster with parts on the hooks') },
        { label: 'Booth', text: 'Manual blasting plant for large parts.', media: foto('mg_8275.jpg', 4 / 5, 'An operator blasting alloy wheels in the manual blasting booth') },
      ],
    },
  },
  {
    id: 'vibrofinitura',
    title: 'Vibratory finishing',
    text: 'Barrel finishing plants that remove moulding and casting burrs: surface finishing of steel, iron, aluminium and brass parts. Drying in vegetable granulate or hot air.',
    short: 'Deburring and finishing of steel, iron, aluminium and brass parts.',
    media: foto('mg_7891.jpg', 1, 'Metal parts with ceramic media in a vibrator'),
    hero: foto('mg_7760.jpg', 16 / 9, 'A row of vibrators with their extraction hoods'),
    intro: [
      'A physical treatment for the surface finishing of parts in different materials: steel, iron, aluminium, brass.',
      'Barrel finishing plants remove moulding and casting burrs; the vibrators run with ceramic media or part-on-part, and the parts are dried in vegetable granulate or in a hot-air centrifuge.',
    ],
    impianti: {
      eyebrow: 'The equipment',
      items: [
        { label: 'Barrel', text: 'A line that removes moulding and casting burrs.', media: foto('mg_7804-1.jpg', 4 / 5, 'The barrel finishing line') },
        { label: 'Vibrator', text: 'Barrel finishing with ceramic media and part-on-part.', media: foto('mg_7874.jpg', 4 / 5, 'A vibrator for barrel finishing with ceramic media') },
        { label: 'Dryer', text: 'Parts dried in vegetable granulate.', media: foto('macchina-ritoccata.jpg', 4 / 5, 'A vegetable-granulate dryer with freshly finished parts') },
        { label: 'Centrifuge', text: 'Parts dried with hot air.', media: foto('mg_8071.jpg', 4 / 5, 'Hot-air centrifuges with their loading crane') },
      ],
    },
  },
  {
    id: 'tribofinitura-isotropica',
    title: 'Isotropic superfinishing',
    text: 'A process achieved through vibratory finishing, entirely non-aggressive, that delivers very low roughness (Ra 0.01 or lower) and highly polished surfaces.',
    short: 'Highly polished surfaces, with roughness down to Ra 0.01.',
    media: img('albero-camme.jpg', 1, 'A polished camshaft, close up'),
    hero: foto('mg_8253.jpg', 16 / 9, 'Isotropic superfinishing plant'),
    intro: [
      'A process achieved through vibratory finishing, entirely non-aggressive, that delivers very low roughness, down to Ra 0.01 or lower, and highly polished surfaces.',
      'Quality control checks the result on each part, comparing it before and after treatment.',
    ],
    impianti: {
      eyebrow: 'From part to result',
      items: [
        { label: 'Plant', text: 'Isotropic superfinishing plant.', media: foto('mg_8253.jpg', 4 / 5, 'Isotropic superfinishing plant') },
        { label: 'Inspection', text: 'Quality control on each part, before and after treatment.', media: foto('mg_8343.jpg', 4 / 5, 'A part measured on a granite surface plate') },
        { label: 'Result', text: 'Highly polished surfaces, with roughness down to Ra 0.01 or lower.', media: foto('prima-dopo2222.jpg', 4 / 5, 'Metal shafts before and after superfinishing, side by side') },
      ],
    },
  },
  {
    id: 'lavaggio-statico',
    title: 'Static washing',
    text: 'A washing plant dedicated to delicate parts.',
    short: 'A washing plant dedicated to delicate parts.',
    media: foto('mg_7677-1.jpg', 1, 'A basket of metal parts for washing'),
    hero: foto('mg_7684.jpg', 16 / 9, 'Static washing plant with its loading bench'),
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
    media: img('bulloni.jpg', 1, 'Loose polished steel bolts'),
    hero: foto('mg_8051.jpg', 16 / 9, 'Burnishing plant'),
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

/** Four numbered blocks (1.x … 4.x), then the © line */
const footer: { columns: { title: string; links: FooterLink[] }[]; copyright: string; credits: { label: string; name: string; href: string } } = {
  columns: [
    {
      title: 'Navigation',
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
    {
      title: 'Legal',
      links: [
        { label: vat },
        { label: 'Privacy', href: to('/privacy') },
        { label: 'Terms and conditions', href: to('/termini-e-condizioni') },
      ],
    },
  ],
  copyright: `All rights reserved, 2026 ${company.name}`,
  /** shown in place of the © line on hover (on phones, on a tap), as on yuriroga.com */
  credits: { label: 'Website by', name: 'Andrea Lando', href: 'https://and-re.com' },
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
    next: 'Next',
    prev: 'Previous',
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
      media: video('home-fabbrica.mp4'),
      kicker: 'Surface treatments for metals',
      headline: 'Finishing you can measure',
      sub: 'Roughness down to Ra 0.01, in-house quality control, ISO 9001:2015 certification.',
      cta: { label: 'Our processes', href: to('/lavorazioni') },
      corner: {
        heading: 'Brochure',
        text: 'Processes and plants in a single document.',
        media: foto('mg_8489.jpg', 1, 'Polished parts laid out on a rack'),
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
      { label: 'Processes', href: to('/lavorazioni'), media: img('anelli-pila.jpg', 1, 'A heap of turned metal rings') },
      { label: 'Contact', href: to('/contatti'), media: foto('vibrolux_azienda.jpg', 1, 'The Vibrolux premises in Sant’Ambrogio') },
    ],
    beforeAfter: {
      eyebrow: 'Isotropic superfinishing',
      items: [
        { label: 'Before', text: 'The part before treatment: burrs, oxides and machining roughness.', media: img('getto-grezzo.jpg', 4 / 5, 'A raw casting with a dull surface') },
        { label: 'After', text: 'Roughness down to Ra 0.01 or lower and highly polished surfaces, with a non-aggressive process.', media: img('pezzi-lucidati.jpg', 4 / 5, 'Mirror-polished metal parts') },
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
      items: [
        {
          figure: 'Ra 0.01',
          text: 'The roughness isotropic superfinishing can reach, with a non-aggressive process.',
          link: { label: 'Isotropic superfinishing', href: to('/lavorazioni/tribofinitura-isotropica') },
        },
        {
          figure: '6 processes',
          text: 'From sandblasting to washing and oiling, all in one plant in Sant’Ambrogio.',
          link: { label: 'The processes', href: to('/lavorazioni') },
        },
        {
          figure: 'ISO 9001:2015',
          text: 'A certified quality system and an inspection area with measuring and testing instruments.',
          link: { label: 'Quality', href: to('/azienda#qualita') },
        },
        {
          figure: '1300 × 1800 mm',
          text: 'The largest parts the hanger blaster takes, delicate material included.',
          link: { label: 'Sandblasting', href: to('/lavorazioni/sabbiatura') },
        },
      ],
    },
  },

  /* ───────── Company ───────── */
  azienda: {
    /** the page opens on white, as t1energy.com/company: the title, two photos, the team, a film */
    headline: {
      id: 'chi-siamo',
      title: 'Qualified expertise in metal treatment',
      sub: 'from Sant’Ambrogio, Turin',
    },
    /** the large square, then the small one */
    pair: [img('sabbiatore.jpg', 1, 'An operator in protective gear at work with a blaster'), img('micrometro.jpg', 1, 'A digital micrometer measuring the thickness of a steel section')], // stand-ins until the new photos
    team: {
      eyebrow: 'Team',
      paragraphs: ['Highly qualified people let us reach a primary goal: to be a highly specialised local business.'],
    },
    /** the plant's film, the one on vibrolux.it (YouTube); for a file: { type: 'video', src: …, aspect: 16 / 9 } */
    video: { type: 'youtube' as const, src: 'qE4NzY4v_tE', alt: 'Vibrolux, the plant', aspect: 16 / 9 },
    quotes: {
      items: [
        'Inside the Sant’Ambrogio plant: six processes under one roof, from the raw part to the final inspection.',
        'A highly technological operations department, with vibrators, burnishing machines, blasting machines, lifting equipment and trucks, for every stage of metal finishing.',
        'A process achieved through vibratory finishing, entirely non-aggressive, that delivers very low roughness, down to Ra 0.01 or lower, and highly polished surfaces.',
      ],
    },
    sede: {
      id: 'sede',
      eyebrow: 'Our site',
      items: [
        { label: 'Workshop', text: 'The workshop is organised into several production departments, with areas for finished material and for loading and unloading vehicles.', media: foto('vibrolux_azienda2-1.jpg', 4 / 5, 'The workshop with its row of barrel machines') },
        { label: 'Warehouse', text: 'A 400 m² warehouse completes the site for storage.', media: img('dadi.jpg', 4 / 5, 'Loose zinc-plated steel nuts') },
        { label: 'Quality', text: 'An area dedicated to quality control, with measuring and inspection instruments.', media: foto('mg_8343.jpg', 4 / 5, 'A part measured on a granite surface plate') },
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
      spin: 'VIBROLUX',
    },
    quality: {
      id: 'qualita',
      eyebrow: 'Quality',
      paragraphs: [
        'The company is ISO 9001:2015 certified and has the measuring and inspection instruments needed to meet the quality standards each client requires.',
      ],
      cta: { label: 'Request a quote', href: to('/contatti') },
    },
    /** the page closes on Sant'Ambrogio, edge to edge above the footer (on phones cropped on the abbey) */
    closing: { ...luogo('sacra-autunno.jpg', 2, '62% 50%'), alt: 'The Sacra di San Michele among the clouds, above the Susa Valley' },
  },

  /* ───────── Processes ───────── */
  lavorazioniPage: {
    hero: {
      media: video('lavorazioni-officina.mp4'),
      headline: 'Our processes',
      cta: { label: 'Download the brochure', href: BROCHURE },
    },
    intro: {
      eyebrow: 'The processes',
      paragraphs: [
        'Vibrolux takes metal parts from raw to finished. Sandblasting, vibratory finishing, isotropic superfinishing down to Ra 0.01, burnishing, washing and oiling: six processes in a single plant.',
      ],
    },
    cards: [
      { label: 'Download the brochure', href: BROCHURE, media: foto('mg_8489.jpg', 1, 'Polished parts laid out on a rack') },
      { label: 'Request a quote', href: to('/contatti'), media: foto('mg_8275.jpg', 1, 'An operator blasting alloy wheels in the manual blasting booth') },
    ],
  },

  /* ───────── Contact ───────── */
  contatti: {
    hero: {
      media: video('contatti-sacra.mp4'),
      headline: 'Contact',
      cta: { label: 'Email us', href: `mailto:${company.email}` },
    },
    eyebrow: 'Write to us',
    emails: [
      { address: company.emails.info, use: 'General enquiries and quotes' },
      { address: company.emails.service, use: 'Support on processes and deliveries' },
      { address: company.emails.commerciale, use: 'Offers and commercial relations' },
    ],
    keys: { tel: 'Telephone', address: 'Head office and plant', vat: 'VAT number' },
    /** the plant, as the reference's factory card (t1energy.com/technology): photo, name, a map card and a stats card */
    factory: {
      media: foto('cover_1.jpg', 1.83),
      alt: 'The Vibrolux plant in Sant’Ambrogio, from above',
      headline: 'Sant’Ambrogio',
      maps: 'Open the site in Google Maps',
      mapsLabel: 'Google Maps',
      statsLabel: 'The site in figures',
      stats: [
        { value: '3500 m²', caption: 'Total area' },
        { value: '2000 m²', caption: 'Buildings: processing and offices' },
      ],
    },
  },
};
