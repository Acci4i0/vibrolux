# Vibrolux — website

The corporate site for Vibrolux Srl, Sant'Ambrogio (TO): surface treatments for
metals — sandblasting, vibratory finishing, isotropic superfinishing, burnishing,
washing and oiling. Rebuilt in the visual language of
[t1energy.com](https://t1energy.com) — light type on full-bleed media, rounded
media cards, a pill navigation, a wordmark that builds itself in the footer —
with every timing and easing read from the reference site's runtime.

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
app/contatti/                  contact details and map
app/privacy/, app/termini-e-condizioni/
                               privacy notice and terms of use
app/mockup/footer/             temporary: the mobile footer layouts side by side
app/globals.css                design tokens in :root (colours, type scale, spacing)
components/Header.tsx          desktop pill nav and mobile menu
components/Footer.tsx          three link columns, legal row, scroll-built wordmark
components/Loader.tsx          white cover on load, then the logo builds
components/PageTransition.tsx  fade out / fade in between pages
components/sections/           the page building blocks (hero, cards, carousel…)
config/animations.ts           every duration, delay, easing and trigger point
content/site.ts                all the copy, links and media, in one place
lib/                           GSAP registration and the scroll-reveal helpers
public/assets/                 the brochure and the preview media
```

## Editing

- **Copy, links, media:** [`content/site.ts`](content/site.ts). Pages and
  components only lay it out.
- **Motion:** [`config/animations.ts`](config/animations.ts) — tune it there,
  not in the components.
- **Brand colour:** Vibrolux navy **#21406E**, defined as `--color-brand` in
  [`app/globals.css`](app/globals.css). The rest of the scale is neutral.

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
