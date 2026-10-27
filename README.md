# Vibrolux — website

The corporate site for Vibrolux Srl, Sant'Ambrogio (TO): surface treatments for
metals — sandblasting, vibratory finishing, isotropic superfinishing, burnishing,
washing and oiling. Rebuilt in the visual language of
[t1energy.com](https://t1energy.com) — light type on full-bleed media, rounded
media cards, a pill navigation, a wordmark that builds itself in the footer —
with every timing and easing read from the reference site's runtime. In Italian
and English.

**Live:** https://acci4i0.github.io/vibrolux/

## Stack

- [Next.js](https://nextjs.org) 15 (App Router) + React 19, TypeScript
- [GSAP](https://gsap.com) with ScrollTrigger, ScrollToPlugin and Flip
- CSS Modules; Vibrolux Display (drawn from the logotype) for headlines and figures,
  Vibrolux Text for text, both in `app/fonts/`, and
  [Martian Mono](https://fonts.google.com/specimen/Martian+Mono) for labels, through `next/font`

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve that build
```

## Structure

```
app/page.tsx                   home
app/azienda/                   company: profile, the premises, quality
app/lavorazioni/               the manifesto card and the six processes as tiles
app/lavorazioni/[slug]/        one page per process, with a plant carousel where there is one
app/contatti/                  address, mail list, contact details, the plant card
app/privacy/, app/termini-e-condizioni/
                               privacy notice and terms of use
app/en/                        the same pages in English, same slugs
app/globals.css                design tokens in :root (colours, type scale, spacing)
components/Header.tsx          desktop pill nav and mobile menu
components/Footer.tsx          four numbered blocks, the © line, scroll-built wordmark
components/Loader.tsx          white cover on load, then the logo builds
components/PageTransition.tsx  fade out / fade in between pages
components/views.tsx           every page, built from a language
components/sections/           the page building blocks (hero, manifesto, cards, carousel…)
config/animations.ts           every duration, delay, easing and trigger point
content/it.ts, content/en.ts   all the copy and links, one dictionary per language
content/shared.ts              what doesn't change: media, contact details, paths
content/legal.tsx              privacy notice and terms, in both languages
lib/                           GSAP, the scroll-reveal helpers, language detection
public/assets/                 the brochure, Vibrolux's photos, the stand-ins until the new shoot
```

## Editing

- **Copy and links:** [`content/it.ts`](content/it.ts) and
  [`content/en.ts`](content/en.ts), which share one shape: a change in one goes
  in the other too. Media and contact details are in
  [`content/shared.ts`](content/shared.ts). Pages and components only lay it out.
- **Motion:** [`config/animations.ts`](config/animations.ts) — tune it there,
  not in the components.
- **Palette:** one for every page, in [`app/globals.css`](app/globals.css): white
  ground, steel black (#0F0E12) for the footer and the dark cards, cool steel
  greys (#2B2F36, #5E6570, #B9BEC6, and #EEF0F3, the only ground besides white),
  and Vibrolux navy **#21406E** (`--color-brand`), kept rare: the logo, numbers
  and active states.
- **Signature:** the logo itself, and nothing beside it: the header, the wordmark
  that builds in the footer, the V that builds on Contatti, the small black logo
  under the quotes on Azienda.

## Languages

Italian sits at the root, English under `/en` with the same slugs
(`/azienda` ↔ `/en/azienda`). The IT · EN switch beside the menu opens the same
page in the other language. The English legal pages are a courtesy
translation: they say the Italian text prevails.

## Deploy

Every push to `main` runs [`nextjs.yml`](.github/workflows/nextjs.yml), which
exports the site as static files and publishes them to GitHub Pages. The
workflow passes the sub-path (`/vibrolux`) as `PAGES_BASE_PATH`;
[`next.config.ts`](next.config.ts) turns it into `basePath` and a static export,
and `withBase()` in `content/shared.ts` prefixes the media and the internal links.
Locally the variable is unset and the site runs from the root.

## Photos

The photos in `public/assets/vibrolux/` are Vibrolux's own, taken from
vibrolux.it (resized and lightly cropped). `public/assets/preview/` keeps the
stand-ins until the new shoot — the hero videos (Home and Lavorazioni are six-shot Pexels montages cut like T1's,
Contatti a drone shot of an Alpine valley) and the Pexels macros on the process tiles, the home and the warehouse
slide, references for the photographer — credited in [`CREDITS.md`](public/assets/preview/CREDITS.md).
Until then the site is a private mockup: `robots` noindex in `app/layout.tsx`.
The Azienda video is the one on vibrolux.it, embedded from YouTube (`azienda.video` in the content).

The Contatti page opens on two halves: on the left the V of the logo, which
builds with the scroll like the footer's wordmark, with the address and the VAT
number at its foot; on the right the three mail addresses and the telephone, one
a row on hairlines. Then a card for the plant, built like the factory card on
t1energy.com/technology: the aerial photo (`cover_1.jpg`), the town's name,
a square map card — Google's embed of the Vibrolux Srl place, the whole card a
link to Google Maps — and a card with the site's figures. The Azienda page
closes on the Sacra di San Michele, edge to edge above the footer, from
`public/assets/sant-ambrogio/` (see its
[`CREDITS.md`](public/assets/sant-ambrogio/CREDITS.md)).

## Animation spec

How the reference site moves — libraries, reveals, the header, the page
transition, the logo build — is measured and written down in
**[ANIMATION_SPEC.md](ANIMATION_SPEC.md)**, in Italian. The raw research behind
it (captures and Playwright scripts) stays out of the repository.

## Rights

The site and its contents belong to Vibrolux Srl. This repository holds the
source; it carries no open-source licence. The preview media keep the licences
listed in their credits file.
