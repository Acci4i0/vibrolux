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
- CSS Modules; Scto Grotesk A (see [Typeface](#typeface)) and
  [Chivo Mono](https://fonts.google.com/specimen/Chivo+Mono) through `next/font`

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
app/lavorazioni/               the six processes, one tile each
app/lavorazioni/[slug]/        one page per process, with a plant carousel where there is one
app/contatti/                  address, mail list, contact details and map
app/privacy/, app/termini-e-condizioni/
                               privacy notice and terms of use
app/en/                        the same pages in English, same slugs
app/globals.css                design tokens in :root (colours, type scale, spacing)
components/Header.tsx          desktop pill nav and mobile menu
components/Footer.tsx          three link columns, legal row, scroll-built wordmark
components/Loader.tsx          white cover on load, then the logo builds
components/PageTransition.tsx  fade out / fade in between pages
components/views.tsx           every page, built from a language
components/sections/           the page building blocks (hero, cards, carousel…)
config/animations.ts           every duration, delay, easing and trigger point
content/it.ts, content/en.ts   all the copy and links, one dictionary per language
content/shared.ts              what doesn't change: media, contact details, paths
content/legal.tsx              privacy notice and terms, in both languages
lib/                           GSAP, the scroll-reveal helpers, language detection
public/assets/                 the brochure, Vibrolux's photos, the last stand-ins
```

## Editing

- **Copy and links:** [`content/it.ts`](content/it.ts) and
  [`content/en.ts`](content/en.ts), which share one shape: a change in one goes
  in the other too. Media and contact details are in
  [`content/shared.ts`](content/shared.ts). Pages and components only lay it out.
- **Motion:** [`config/animations.ts`](config/animations.ts) — tune it there,
  not in the components.
- **Brand colour:** Vibrolux navy **#21406E** (`--color-brand` in
  [`app/globals.css`](app/globals.css)) with its family: `--color-brand-deep`
  for the footer and the mobile menu, `--color-brand-tint` for light panels,
  `--color-brand-soft` for muted text on navy. The rest of the scale is neutral.

## Typeface

The site is set in **Scto Grotesk A** by Schick Toikka, one cut — Bold — with
tight tracking (`--track-*` in `globals.css`), as on alright.studio. It's a
commercial face: until a web licence is bought, the browser falls through to
**Schibsted Grotesk Bold** (free, OFL), the closest open match. With the
licensed file:

1. put it in `app/fonts/scto-grotesk-a-bold.woff2`;
2. in [`app/layout.tsx`](app/layout.tsx) load it with `next/font/local`
   (`weight: '700'`, `variable: '--font-scto'`) next to the stand-in and add
   its `.variable` to `<html>`;
3. in `globals.css` start `--font-primary` with `var(--font-scto)`.

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
vibrolux.it (resized and lightly cropped): they hold the layout until the
retouched shots arrive. `public/assets/preview/` keeps the last two stand-ins
with no original yet — the home video and the warehouse photo — credited in
[`CREDITS.md`](public/assets/preview/CREDITS.md).

## Animation spec

How the reference site moves — libraries, reveals, the header, the page
transition, the logo build — is measured and written down in
**[ANIMATION_SPEC.md](ANIMATION_SPEC.md)**, in Italian. The raw research behind
it (captures and Playwright scripts) stays out of the repository.

## Rights

The site and its contents belong to Vibrolux Srl. This repository holds the
source; it carries no open-source licence. The preview media keep the licences
listed in their credits file.
