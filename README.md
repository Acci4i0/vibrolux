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
- CSS Modules; [Geist](https://vercel.com/font) and
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
app/mockup/footer/             temporary: the mobile footer layouts side by side
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
public/assets/                 the brochure and the preview media
```

## Editing

- **Copy and links:** [`content/it.ts`](content/it.ts) and
  [`content/en.ts`](content/en.ts), which share one shape: a change in one goes
  in the other too. Media and contact details are in
  [`content/shared.ts`](content/shared.ts). Pages and components only lay it out.
- **Motion:** [`config/animations.ts`](config/animations.ts) — tune it there,
  not in the components.
- **Brand colour:** Vibrolux navy **#21406E**, defined as `--color-brand` in
  [`app/globals.css`](app/globals.css). The rest of the scale is neutral.

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

## Preview media

The photos and videos in `public/assets/preview/` are stand-ins from Mixkit and
Wikimedia Commons, so the site can be seen without placeholders. Each one is
credited with its licence in
[`CREDITS.md`](public/assets/preview/CREDITS.md); all of them are to be
replaced with Vibrolux's own photographs and footage before going live.

## Animation spec

How the reference site moves — libraries, reveals, the header, the page
transition, the logo build — is measured and written down in
**[ANIMATION_SPEC.md](ANIMATION_SPEC.md)**, in Italian. The raw research behind
it (captures and Playwright scripts) stays out of the repository.

## Rights

The site and its contents belong to Vibrolux Srl. This repository holds the
source; it carries no open-source licence. The preview media keep the licences
listed in their credits file.
