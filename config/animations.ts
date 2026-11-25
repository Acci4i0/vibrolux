/**
 * Every animation parameter in one place.
 * Values measured on the reference site — see ANIMATION_SPEC.md for the source of each one.
 */

/** CSS `linear()` spring-like curve used by media zooms and accordions (mirrored in globals.css as --ease-expo-linear). */
export const EXPO_LINEAR =
  'linear(0, 0.1641 3.52%, 0.311 7.18%, 0.4413 10.99%, 0.5553 14.96%, 0.6539 19.12%, 0.738 23.5%, 0.8086 28.15%, 0.8662 33.12%, 0.9078 37.92%, 0.9405 43.12%, 0.965 48.84%, 0.9821 55.28%, 0.992 61.97%, 0.9976 70.09%, 1)';

export const ANIM = {
  /** Reveals are attached this long after mount (original: setTimeout 500ms). */
  revealSetupDelay: 500,

  reveal: {
    y: 40,
    duration: 0.75,
    ease: 'power4.out',
    start: 'top bottom',
  },
  revealStagger: {
    stagger: 0.1,
  },

  loader: {
    visibleFor: 1000, // ms before close
    fadeDuration: 0.33,
    logoDelay: 0.33, // header logo starts after loader:removed
  },

  logo: {
    /** Placeholder for the original Lottie segment [0, 60] @ 30fps = 2s. */
    introDuration: 2,
    footerScrubStart: 'top bottom', // on the logo itself (reference: nav 'bottom bottom-=110')
    /** seconds the footer build takes to catch up with the scroll (reference: scrub true = instant) */
    footerScrub: 1.5,
    /** the V on Contatti builds as the footer's wordmark, done by the time it is this far up the screen */
    markScrubEnd: 'top 40%',
  },

  hero: {
    /** Original page mounts ~180ms after the layout (measured vs loader fade), so hero reveals start later. */
    setupDelay: 680,
    headlineDelay: 0.5,
    ctaDelay: 0.6,
    cornerDelay: 0.7,
    corner: { y: 20, duration: 0.66 },
    scrub: {
      media: '(min-width: 1081px)',
      start: 'bottom bottom-=33%',
      end: '+=33%',
      /** px removed from total width → scale = (100 - k / innerWidth) / 100 */
      shrinkK: 1600,
      borderRadius: 80,
    },
  },

  text: { eyebrowDelay: 0.1, contentDelay: 0.2 },

  carousel: {
    marker: { duration: 0.4, ease: 'elastic.out(0.75, 1)' },
    markerResizeDelay: 250,
  },

  accordion: {
    scrub: {
      media: '(min-width: 1081px)',
      start: 'bottom bottom-=25%',
      end: '+=50%',
      shrinkK: 800,
      borderRadius: 80,
    },
  },

  /** home, before the footer: the row of discs that smears into the screen edges (components/sections/EdgeCarousel) */
  edgeCarousel: {
    /** gap between discs, × the diameter */
    gap: 0.38,
    /** width of the band at each side where the row bends into a streak: × the screen width, at least × the diameter */
    band: 0.17,
    bandMinDiscs: 0.9,
    /** share of the band the row skips: the bigger, the longer the streak (1/3 … 2/3) */
    hidden: 0.5,
    /** how much thinner the streak gets toward the edge (1 = no thinning) */
    squeeze: 0.55,
    /** how far the blue copy runs ahead of the streak at the edge, × the band */
    rim: 0.22,
    /** drift on its own, px per second (leftwards) */
    drift: 36,
    /** px the row moves per px of page scroll */
    scroll: 0.5,
    /** the disc under the pointer grows by this */
    hoverScale: 1.1,
    /** how quickly the row catches up with its target, per frame at 60 fps */
    follow: 0.1,
    /** drag momentum kept per frame at 60 fps after release */
    inertia: 0.93,
  },

  /** every page ends on it: the footer rises as the dark side of a planet, its edge glowing blue, and flattens (components/Horizon) */
  horizon: {
    /** how far the glow reaches above the edge at the middle, × the white sky above the planet (CSS: 50vh) */
    reach: 0.85,
    /** the planet's radius when its edge comes into the screen, and when it reaches the top: × the screen width */
    radiusStart: 0.75,
    radiusEnd: 14,
    /** how the curve flattens over the scroll (power: the bigger, the longer it stays round) */
    flatten: 2,
    /** seconds the drawing takes to catch up with the scroll */
    scrub: 0.5,
    /** with reduced motion the edge stays still, this far along its flattening (0 … 1) */
    still: 0.45,
    /** «Richiedi un preventivo» rises in once the dark reaches this point of the screen */
    ctaStart: 'top 55%',
    cta: { y: 40, duration: 0.9, ease: 'power4.out' },
  },

  stats: { contentDelay: 0.3, statsDelay: 0.1, statsStagger: 0.25 },
  news: { listDelay: 0.1, listStagger: 0.1 },
  footer: { navDelay: 0.2, navStagger: 0.1 },

  /** the menu (pill / Menu button) fades out once the footer's top passes innerHeight × this, or the page bottom is reached */
  headerFooterAt: 0.5,

  headerDesktop: {
    /** is-scrolled when scrollY > innerHeight × this */
    scrolledAt: 1,
    flip: { duration: 0.5, ease: 'power4.out' },
    logoEnter: { x: '4rem', duration: 0.5, ease: 'power4.out' },
    logoLeave: { scale: 0.85, duration: 0.5, ease: 'power4.out' },
    submenuShow: { duration: 0.5, stagger: 0.02, delay: 0.15, ease: 'power4.out' },
    submenuHide: { duration: 0.33 },
    /** submenu panel height = tallest column + this (+ ctas row + 7rem) */
    submenuExtra: 36,
  },

  headerMobile: {
    scrolledAt: 0.75,
    panel: { duration: 0.66, ease: 'power4.inOut' },
    items: { y: '-2rem', duration: 0.66, ease: 'power4.out', stagger: 0.05, delay: 0.25 },
  },

  pageTransition: {
    leave: 500, // ms: page/footer fade-out before navigating (CSS: .page opacity .5s)
    footerBack: 500, // ms after enter: footer back + ScrollTrigger.refresh()
    hashScroll: { duration: 1, ease: 'expo.inOut' },
  },

  scrollTo: {
    logo: { duration: 1.33, ease: 'expo.inOut' },
    logoMobile: { duration: 1, ease: 'expo.inOut' },
  },
} as const;

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
