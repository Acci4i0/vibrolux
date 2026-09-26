# ANIMATION_SPEC — reverse engineering di t1energy.com (home)

> Fonte: analisi runtime con Playwright (Chromium) a 1440×900, 1024×768, 390×844, bundle JS/CSS scaricati
> (`_research/out/original/bundles`), hook su `gsap.to/from/fromTo/timeline` iniettato nel bundle vendor,
> `ScrollTrigger.getAll()`, `getComputedStyle` campionato ogni 100px di scroll.
> I valori sono **letti dal codice/runtime**, non stimati. Dove un valore è derivato, è indicato "(derivato)".
> Materiale di ricerca: `_research/` (script, screenshot ogni 10%, video `.webm` per breakpoint, JSON dei campioni).

---

## 0. Stack del sito originale e librerie

| Cosa | Rilevato | Versione | Note |
|---|---|---|---|
| Framework | Nuxt 2 (Vue 2, SSG, webpack `webpackJsonp`) | Vue 2.7.16 | Non rilevante per noi: si replica il comportamento |
| GSAP core | `gsap` | **3.11.5** | Nessun global: esposto via bundle |
| ScrollTrigger | sì | 3.11.5 | 29 istanze sulla home |
| ScrollToPlugin | sì | 3.11.5 | scroll-to-top logo, cambio pagina, "scroll next" |
| Flip | sì | 3.11.5 | transizione layout del nav desktop quando diventa `is-scrolled` |
| MorphSVGPlugin | sì | 3.11.5 | icona menu mobile: griglia 3×3 → X |
| CustomEase / CustomWiggle | presenti nel bundle | 3.11.5 | usati solo per shake errori form (`Wiggle.error`), non in home |
| lottie-web | sì | 5.12.2 | logo header (`t1_topleft.json`) e footer (`t1_bottomleft.json`) |
| Smooth scroll (Lenis/Locomotive/ScrollSmoother) | **NO** | — | Scroll **nativo**. Nessun lerp sullo scroll. |
| SplitText / split del testo | **NO** | — | Nessuno split per riga/parola/carattere: i blocchi entrano interi |
| Three.js / WebGL / canvas | **NO** | — | |
| Swiper / slider lib | **NO** | — | Carousel custom (crossfade CSS + marker GSAP) |
| Cursore custom / magnetic buttons | **NO** | — | `cursor: auto`, nessun elemento cursore |
| Parallax (data-speed/lag) | **NO** | — | Nessun elemento con velocità relativa |

Implicazione per l'implementazione: **GSAP 3 (stessa major) + ScrollTrigger + ScrollToPlugin + Flip + MorphSVG + lottie-web 5**.
Da GSAP 3.13 tutti i plugin (MorphSVG incluso) sono gratuiti su npm (`gsap`), quindi nessun problema di licenza.

---

## 1. Design token

### Colori
| Token | Valore | Uso |
|---|---|---|
| `--color-black` | `#0f0e12` | footer bg, testo su bottoni bianchi, menu mobile bg |
| `--color-grey1` / `--color-text` | `#322d2a` | testo base |
| `--color-grey2` | `#625b58` | caption, accordion chiuso |
| `--color-grey3` | `#bfb8b5` | `<strong>` headline hero, hover bottoni outline, nav item non-hover, anni footer |
| `--color-grey4` / `--color-white-off` | `#f0efe9` | bg sezione accordion, bordi |
| `--color-white` | `#fff` | bg pagina |
| `--color-red` | `#960505` | errori form |
| `--color-bg-blur-dark` | `hsla(0,0%,9%,.5)` + `backdrop-filter: blur(2.5rem–5rem)` | pill nav, CTA su media, nav carousel |
| `--color-bg-blur-light` | `hsla(0,0%,100%,.2)` | cerchio icona CTA |

### Tipografia
Root: `html { font-size: 62.5% }` → **1rem = 10px**. Nessun `clamp()` e nessuna scala fluida: le dimensioni cambiano solo ai breakpoint.

| Token | ≥1180 | ≤1179.98 | ≤767 |
|---|---|---|---|
| `--size-caption` | 1.2rem | = | = |
| `--size-body` | 1.4rem | = | = |
| `--size-body-md` | 1.6rem | = | = |
| `--size-heading-xs` | 2rem | = | = |
| `--size-heading-sm` | 2.4rem | 2rem | = |
| `--size-heading-md` | 3.2rem | 2.8rem | = |
| `--size-heading-lg` | 5.2rem | 4rem | = |
| `--size-heading-xl` | 9.6rem | 6rem | 5.2rem |

Font: `--font-primary: "T1 Sans"` (Light 300, Regular 400), `--font-secondary: "T1 Sans Mono"` (400). **Proprietari → da sostituire** (vedi domande in fondo).

Stili ricorrenti:
- **Eyebrow** (h1 sezione): mono 1.2rem/1.3, `uppercase`, `letter-spacing: .01em`, quadrato pieno `0.6667em` prima del testo (`:before`, `margin-right: .6667em`).
- **Testo grande**: primary 300, 3.2rem, `line-height: 1.2`, `text-wrap: pretty`.
- **Headline hero**: 300, 5.2rem, `line-height: 1`, `max-width: 10em`, `text-wrap: balance`; mobile 3.2rem/1.2.
- **Stat**: 300, 9.6rem, `line-height: 1`.

### Spaziature / raggi / durate
| Token | Valore |
|---|---|
| `--margin-xs/sm/md/lg/xl` | .4 / .8 / 1.2 / 1.8 / 2.4 rem |
| `--margin-2xl/3xl/4xl/5xl/6xl/7xl` | 3.6 / 4.8 / 6 / 9.6 / 12 / 24 rem |
| `--gutter` | .8rem (8px) |
| `--pwx` / `--pwy` | 3.6rem (mobile `--pwx: 1.2rem`) |
| `--radius-button` | 1.6rem |
| `--radius-medium` | 4rem |
| `--radius-large` | 8rem (≤1179: 4rem) |
| `--container-max-width` | 1440px (1400px in una variante) |
| `--duration-default` | .25s |
| `--duration-long` | .35s |
| `--duration-longer` | 666ms |
| `--duration` | .5s |
| `--vh` | `1vh` (mobile `1svh`) |

### Breakpoint
`≤767px` (mobile), `≤1179.98px` (tablet/header mobile), `≥1180px` desktop; `(hover:hover)` per tutti gli hover; `(min-width:1081px)` per gli scrub di scala/raggio; `(min-width:1180px) and (max-height:700px)` carousel quadrato.

### Easing
| Nome | Valore |
|---|---|
| Reveal | `power4.out` (GSAP) |
| Menu / morph | `power4.inOut` |
| Scroll-to | `expo.inOut` |
| Marker carousel | `elastic.out(0.75, 1)` |
| CSS UI | `cubic-bezier(0.42, 0, 0, 1)` (submenu, radius card, icone +/−) |
| CSS alt | `cubic-bezier(0, 0.01, 0.38, 0.95)`, `cubic-bezier(0.52, 0, 0, 1)` |
| CSS "EXPO_LINEAR" (zoom media, accordion) | `linear(0, .1641 3.52%, .311 7.18%, .4413 10.99%, .5553 14.96%, .6539 19.12%, .738 23.5%, .8086 28.15%, .8662 33.12%, .9078 37.92%, .9405 43.12%, .965 48.84%, .9821 55.28%, .992 61.97%, .9976 70.09%, 1)` |

---

## 2. Primitive di animazione globali

### 2.1 `animate-in` (reveal singolo) — usato ovunque
| Parametro | Valore |
|---|---|
| Trigger | viewport enter, `ScrollTrigger { trigger: el, once: true }` → start di default `"top bottom"` |
| Metodo | `gsap.from(el, …)` |
| Proprietà | `y: 40` (px) → 0, `autoAlpha: 0` → 1, `force3D: true` |
| Durata | `0.75s` |
| Easing | `power4.out` |
| Delay | per istanza (vedi sezioni) |
| Cleanup | `clearProps: "y,opacity,visibility"`, kill all'unbind |
| Setup | creato con `setTimeout(…, 500)` dopo il mount (gli elementi sono visibili per ~500ms prima di essere nascosti: stesso "flash" dell'originale; noi lo evitiamo nascondendo via CSS pre-hydration, vedi §5) |

### 2.2 `animate-in-stagger` (reveal di lista)
| Parametro | Valore |
|---|---|
| Trigger | `ScrollTrigger { trigger: container, start: "top bottom", once: true }` |
| Target | figli `[data-ai-child]` (o selettore custom) |
| Proprietà | `y: 40`, `autoAlpha: 0`, `force3D` |
| Durata / easing | `0.75s` / `power4.out` |
| Stagger | default `0.1` (stats: `0.25`) |
| Delay | default `0` (override per istanza) |

### 2.3 Scrub "card che si stacca" (hero bg e bg accordion)
Attivo solo `(min-width: 1081px)` via `gsap.matchMedia()`.
| Parametro | Hero | Materials accordion |
|---|---|---|
| Trigger | `.module-hero-bg` | `.module-materialsAccordion-bg` |
| start / end | `"bottom bottom-=33%"` / `"+=33%"` | `"bottom bottom-=25%"` / `"+=50%"` |
| scrub | `true` (nessuno smoothing) | `true` |
| ease | `none` | `none` |
| scale | `1 → (100 - 1600/innerWidth)/100` (1440px: 0.9889 → tolgono 8px per lato) | `1 → (100 - 800/innerWidth)/100` (1440px: 0.9944) |
| borderRadius | `0 → 80px` | `0 → 80px` |
| transform-origin | `bottom` | default (center) |
| Misurato a 1440 | sy 300 → 0.9999/1px, sy 600 → 0.9889/80px | sy 3600 → 0.999/14px, sy 4000 → 0.9944/80px |

### 2.4 Loader / intro
| Step | Valore |
|---|---|
| Elemento | `#loader`: `position: fixed; inset: 0; background: #fff; z-index: 10000` (nessun logo, nessuno spinner) |
| Durata visibile | `setTimeout(close, 1000)` dopo il mount |
| Uscita | `gsap.to(loader, { autoAlpha: 0, duration: 0.33 })` (ease di default `power1.out`), poi rimosso dal DOM |
| Evento | emette `loader:removed` → **logo Lottie header** `playSegments([0, 60], true)` dopo `0.33s` |
| Reveal hero | i reveal della hero partono in parallelo (delay 0.5 / 0.6 / 0.7s, vedi §3.2) |

### 2.5 Transizione di pagina (router)
`mode: out-in`; `body.is-page-transitioning` → footer `opacity: 0` (transition `opacity .5s ease`); dopo il leave `scrollTo` a 0 o all'hash (`offsetY: 100`, `duration: .15`, `delay: .4`, `power4.out`); all'enter `ScrollTrigger.refresh()`. Cambio hash sulla stessa pagina: `scrollTo` `duration: 1`, `expo.inOut`, `offsetY: 100`.

### 2.6 Scroll-to
Click sul logo in home: `gsap.to(window, { scrollTo: 0, duration: 1.33 (desktop) / 1 (mobile), ease: "expo.inOut" })`. Bottone "scroll next": verso la sezione successiva, `1.33s expo.inOut`.

---

## 3. Sezioni (dall'alto in basso) — desktop 1440×900, altezza pagina 6797px

### 3.1 Header desktop (`≥1180px`; `position: fixed`, `z-index: 100`, padding 3.6rem)
| Elemento | Trigger | Animazione |
|---|---|---|
| Logo grande (Lottie, h 4.8rem, bianco) | load (`loader:removed`) | `playSegments([0,60])` dopo 0.33s |
| Logo grande | `scrollY > innerHeight` | classe `is-scrolled` → `opacity: 0` (CSS `transition: opacity .25s ease, color .5s ease`) |
| Pill nav (`.header-nav-inner`) | sempre | bg `hsla(0,0%,9%,.5)` + blur 2.5rem, radius 1.6rem, `min-height 4.4rem`, padding `.4rem 2.4rem`, gap `6rem` |
| Pill nav | `scrollY > innerHeight` toggla `is-scrolled` | **Flip**: `getState([".header-nav-inner", ".header-nav-logo", ".header-nav-logo svg", ".header-nav-item"])` → toggle classe → `Flip.from(state, { duration: .5, ease: "power4.out", absolute: false, nested: true })`. Entra il mini-logo (h 1.57em): `onEnter fromTo { opacity 0, x: "4rem" } → { opacity 1, x 0, .5s power4.out }`; `onLeave → { opacity 0, scale .85, .5s power4.out }`. Larghezza misurata: 705px → 817px |
| Voci nav | hover | le altre voci diventano `#bfb8b5` (`:has(.header-nav-item:hover)`), `transition: color .5s` |
| Pannello submenu (`.header-nav-submenu-wrapper`) | mouseenter su nav o submenu | `.is-visible`: `max-height: 0 → var(--submenu-max-height)` (altezza della colonna più alta + 36px [+ riga CTA + 70px]), `opacity 0 → 1`; `transition: all 0.35s cubic-bezier(.42,0,0,1)`; chiusura `max-height 666ms cubic-bezier(.42,0,0,1), opacity .35s` |
| Colonne submenu | apertura | `gsap.to(cols, { autoAlpha: 1, y: 0, duration: .5, stagger: .02, delay: .15, ease: "power4.out" })` da stato CSS `opacity 0; translate3d(0,-2em,0)` |
| Colonne submenu | chiusura | `gsap.to(cols, { autoAlpha: 0, duration: .33, clearProps: "all" })` |
| Voci submenu | hover | `#bfb8b5 → #fff`, `transition: color .5s` |
| CTA nav (bianco) | hover | `bg #fff → #0f0e12`, testo → `#fff`; `:active` `scale(.985)` |
| Colore logo | — | `data-scheme` fisso "light" in home (il trigger `.header-nav-right` nel codice originale non trova il nodo: codice morto, non replicato) |

### 3.2 Hero (`section.module-hero`, 100vh, video full-bleed)
Layout: bg video `object-fit: cover`, `min-height: 100vh`; overlay `linear-gradient(0deg, #000, transparent 70%)` opacity .6; contenuto assoluto in basso: padding `0 3.6rem 0 12rem` (≤1179: `0 3.6rem 0 4.8rem`, ≤767: `0 3.6rem`), `padding-bottom 9.6rem`; colonna sinistra 50%, gap 4.8rem.

| Elemento | Trigger | Proprietà | Durata | Delay | Easing |
|---|---|---|---|---|---|
| Headline | load/viewport, once | y 40→0, autoAlpha 0→1 | .75s | **.5s** | power4.out |
| CTA "Discover" (pill blur scura) | load/viewport | y 40→0, autoAlpha | .75s | **.6s** | power4.out |
| Card "corner" (annuncio + thumb 10rem) | load/viewport | **y 20**→0, autoAlpha | **.66s** | **.7s** | power4.out |
| Bg | scroll (scrub) | vedi §2.3 | | | |
| CTA | hover | bg → `#fff`, testo → `#0f0e12`, `transition: bg .25s, color .25s`; `:active scale(.985)` | | | |
| Corner | hover | thumb `scale(1.1)`, `transition: transform .5s EXPO_LINEAR`; `:active scale(.99)` | | | |

### 3.3 Text "Mission" (`module-text`, h 488)
Layout: padding `6rem` orizzontale (≤1179: 4.8rem, ≤767: `12rem 3.6rem`), flex row eyebrow 50% / contenuto 50%, gap 4.8rem.
| Elemento | Trigger | Props | Durata | Delay | Easing |
|---|---|---|---|---|---|
| Eyebrow | viewport (top bottom), once | y 40, autoAlpha | .75 | **.1** | power4.out |
| Contenuto (testo + CTA) | viewport, once | y 40, autoAlpha | .75 | **.2** | power4.out |
| CTA outline | hover | bg → `#bfb8b5` (.25s); `:active scale(.985)` | | | |

### 3.4 Group di 2 MediaCard (`module-group`, due colonne uguali, gap 8px)
| Elemento | Trigger | Animazione |
|---|---|---|
| Media (radius 8rem, bg `#0f0e12`, img opacity .8, aspect 1) | hover card | img `scale(1.033)`, `transition: transform 666ms EXPO_LINEAR` |
| CTA centrale (pill blur + cerchio icona 3.428em) | hover card | cerchio icona `bg #fff`, icona `#0f0e12` (.25s) |
Nessun reveal GSAP su queste card.

### 3.5 Carousel "Manufacturing" (`module-carousel`, h 890)
Layout: padding `0 12rem` (≤1179: 4.8rem, ≤767: `8px 3.6rem`); testo 50% (`padding-top 9.6rem`), carousel `calc(50% + (12rem - 16px)/2)`, `min-width calc(50vw - 8px)`, radius 8rem.
| Elemento | Trigger | Animazione |
|---|---|---|
| Heading (eyebrow) | viewport, once | reveal y 40, .75s, delay 0 |
| Testo | viewport, once | reveal y 40, .75s, delay 0 |
| Slide | click nav / click media (next) | crossfade CSS `opacity 666ms ease` (`.is-active`), slide assolute sovrapposte, la prima definisce l'altezza |
| Marker nav | cambio indice | `gsap.to(marker, { x: item.offsetLeft, width: item.width, duration: .4, ease: "elastic.out(0.75, 1)" })`; ricalcolo al resize (+250ms) |
| Testo slide | cambio indice | paragrafi assoluti sovrapposti (crossfade), il più lungo tiene l'altezza (`.text-longer` invisibile) |
| Autoplay | — | **nessuno** (misurato 20s: indice fermo) |
| Nav | voci `min-width 6.5em`, padding `.8571em 1.1428em`, attiva testo `#0f0e12` su marker bianco |

### 3.6 Text "Supply chain" (`module-text`, h 373)
Come §3.3 (eyebrow delay .1, contenuto delay .2).

### 3.7 Materials accordion (`module-materialsAccordion`, h 815, bg `#f0efe9`)
| Elemento | Trigger | Animazione |
|---|---|---|
| Bg | scroll scrub | vedi §2.3 (solo ≥1081px) |
| Heading | viewport, once | reveal .75 |
| Ogni `.part-dropdown` (8) | viewport, once, ognuno col suo trigger | reveal y 40 .75 (sfasamento naturale di ~60px di start = effetto cascata) |
| Media a sinistra (50%, aspect 1, radius 8rem) | cambio voce attiva | crossfade: uscita `opacity .25s linear` **con delay .25s**, entrata `delay 0` |
| Contenuto dropdown | click header | `max-height: 0 → auto` in `.5s EXPO_LINEAR`; inner `opacity 0→1`, `translate3d(0,-2rem,0) → 0` in `666ms EXPO_LINEAR` |
| Icona + / − | toggle | `.25s cubic-bezier(.42,0,0,1)`: + → `opacity 0, rotate(45deg)`; − da `rotate(-45deg)` a `0` |
| Titoli chiusi | stato | colore `#625b58`, tag con bordo; aperto: tag bianco pieno |
| Logica | apertura esclusiva | aprirne una chiude le altre |
Toggle 4.8rem cerchio bianco, `:active scale(.95)`.

### 3.8 Stats (`module-stats`, h 1077)
Padding `12rem` (≤1179: 4.8rem ai lati; ≤767: `12rem 3.6rem`). Immagine assoluta in basso a sinistra 30%, radius 8rem.
| Elemento | Trigger | Props | Durata | Delay | Stagger |
|---|---|---|---|---|---|
| Eyebrow | viewport | y 40, autoAlpha | .75 | 0 | — |
| Contenuto | viewport | y 40, autoAlpha | .75 | .3 | — |
| Stat ×3 | `top bottom` sul contenitore | y 40, autoAlpha | .75 | .1 | **.25** |
Numeri: **nessun count-up** (valori statici, verificato per 2.8s).

### 3.9 News (`module-news`, h 903)
| Elemento | Trigger | Props | Durata | Delay | Stagger |
|---|---|---|---|---|---|
| Eyebrow | viewport | y 40, autoAlpha | .75 | 0 | — |
| Contenuto | viewport | y 40, autoAlpha | .75 | .2 | — |
| Card ×4 | `top bottom` sulla lista | y 40, autoAlpha | .75 | .1 | **.1** |
Card hover: media `border-radius 0 → 8rem` (`.25s cubic-bezier(.42,0,0,1)`), img `scale(1.05)` (`666ms EXPO_LINEAR`), titolo → `#bfb8b5` (`.25s ease`).
Layout: lista 4 colonne da 25% che sforano il padding (`margin-left: -12rem; min-width: calc(100% + 24rem)`), gap 8px; ≤1179 2 colonne, row-gap 12rem; ≤767 1 colonna.

### 3.10 Footer (`#0f0e12`, testo bianco, mono 1.2rem uppercase)
| Elemento | Trigger | Animazione |
|---|---|---|
| Colonne nav ×4 | `top bottom` su `.footer-main-inner` | y 40, autoAlpha, .75s, delay **.2**, stagger **.1** |
| Logo Lottie grande (max 47rem) | scroll **scrub** | `ScrollTrigger { trigger: nav, start: "bottom bottom-=110", end: "max", scrub: true }` → frame `0 → 60` (`goToAndStop`), ease none |
| Link | hover | `opacity .66` (.25s) |
Layout: `padding 0 12rem 3rem`, `padding-top 8.2rem`, colonne 20% (≤1179 50%), bottom `margin-top 21rem` (≤767 12rem).

---

## 4. Header/menu mobile (`≤1179.98px`, verificato a 1024 e 390)
| Elemento | Trigger | Animazione |
|---|---|---|
| Barra | fixed, logo Lottie h 2.8rem + pill "Menu" (blur scuro, radius 1.6rem) | — |
| Icona | open/close | **resta una griglia**: il codice chiama `morphSVG` (grid → X, .66s power4.inOut) ma il plugin non è registrato, quindi il path non cambia (verificato: `d` identico prima/dopo) |
| Pannello | apertura | `fromTo(nav, { maxHeight: 0 }, { maxHeight: innerHeight, duration: .66, ease: "power4.inOut" })` |
| Voci | apertura | `fromTo(li, { opacity 0, y: "-2rem" }, { opacity 1, y 0, duration .66, ease "power4.out", stagger .05, delay .25, clearProps: "all" })` |
| Pannello | chiusura | `maxHeight → 0`, `.66 power4.inOut`, poi reset di scroll interno e submenu |
| Submenu (accordion) | tap | `--submenu-height` = scrollHeight, apertura esclusiva |
| Soglia `is-scrolled` | `scrollY > 0.75 × innerHeight` | se il menu è aperto quando cambia, si chiude dopo 333ms |
| Scrub bg hero/accordion | — | **disattivati** (<1081px): misurato `transform: none` |

Mobile 390: altezza pagina 10193px; hero headline 3.2rem/1.2; tutte le colonne si impilano (flex column); gap tipici 4.8rem / 12rem.

---

## 5. Cosa NON c'è (per evitare di inventarlo)
Smooth scroll, parallax, split text, cursore custom, magnetic button, count-up, autoplay del carousel, WebGL, loader con logo o percentuale.

## 6. Note di implementazione (per la Fase 2)
- `config/animations.ts`: tutti i valori sopra (durate, easing, offset, start/end, stagger, `linear()` EXPO).
- Reveal: invece del `setTimeout(500)` dell'originale, nascondere via CSS gli elementi `[data-reveal]` finché JS non è pronto, così non c'è il flash. Timing risultante identico.
- `prefers-reduced-motion: reduce` → niente reveal (elementi visibili), niente scrub, crossfade istantanei, niente Flip. Scroll-to istantaneo.
- Cleanup: `gsap.context()` / `useGSAP` con `revert()` all'unmount, `matchMedia.revert()`, `lottie.destroy()`.
- Font sostitutivi e Lottie del logo: forniti da te (vedi domande).
