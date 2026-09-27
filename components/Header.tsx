'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap, Flip, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { ANIM } from '@/config/animations';
import { Logo, logoTimeline } from './Logo';
import { content, withBase } from '@/content/site';
import { LANGS, langPath, pagePath, useLang, type Lang } from '@/lib/i18n';
import s from './Header.module.css';

/** Big logo builds (timeline 0→1 in 2s, linear) .33s after the loader is removed. */
function useLogoIntro() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const tl = logoTimeline(ref.current!);
    const play = () => gsap.to(tl, { progress: 1, duration: ANIM.logo.introDuration, delay: ANIM.loader.logoDelay, ease: 'none' });
    window.addEventListener('loader:removed', play, { once: true });
    return () => window.removeEventListener('loader:removed', play);
  });
  return ref;
}

/** true once scrollY passes innerHeight × factor */
function useScrolledPast(factor: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => setPast(window.scrollY > window.innerHeight * factor);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [factor]);
  return past;
}

/** true once the footer's top passes innerHeight × headerFooterAt, or the page bottom is reached: the menu steps aside */
function useInFooter() {
  const pathname = usePathname();
  const [inFooter, setInFooter] = useState(false);
  useEffect(() => {
    const on = () => {
      const top = document.querySelector('footer')?.getBoundingClientRect().top ?? Infinity;
      const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
      setInFooter(top < window.innerHeight * ANIM.headerFooterAt || (bottom && top < window.innerHeight));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [pathname]);
  return inFooter;
}

/** Pages that start on white (no dark hero): the big logo turns dark there. */
const LIGHT_PAGES = ['/privacy', '/termini-e-condizioni'];
const useDarkLogo = () => LIGHT_PAGES.includes(pagePath(usePathname()));

/** Logo on the home page scrolls to top; elsewhere it's a normal link (page transition). */
function useLogoClick(vars: { duration: number; ease: string }) {
  const pathname = usePathname();
  return (e: React.MouseEvent) => {
    if (pagePath(pathname) !== '/') return;
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: 0 }, ...vars, duration: prefersReducedMotion() ? 0 : vars.duration });
  };
}

const ext = (external?: boolean) => (external ? { target: '_blank', rel: 'noreferrer' } : {});

/** Home of the current language (next/link adds the base path) */
const homeOf = (lang: Lang) => (lang === 'en' ? '/en' : '/');

/** IT · EN: the same page in the other language, through the page transition like any internal link. */
function LangSwitch(props: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const lang = useLang();
  return (
    <div role="group" aria-label={content[lang].ui.language} {...props}>
      {LANGS.map((l) => (
        <a key={l} href={withBase(langPath(pathname, l))} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined}>
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

/* ───────────────────────── Desktop (≥1180px) ───────────────────────── */

export function HeaderDesktop() {
  const root = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const logo = useLogoIntro();
  const scrolled = useScrolledPast(ANIM.headerDesktop.scrolledAt);
  const [hover, setHover] = useState(false);
  const inFooter = useInFooter();
  const cfg = ANIM.headerDesktop;
  const onLogo = useLogoClick(ANIM.scrollTo.logo);
  const dark = useDarkLogo();
  const lang = useLang();
  const t = content[lang];

  const { contextSafe } = useGSAP({ scope: root });

  // the pill fades out in the footer: close its submenu too (it would stay visible)
  useEffect(() => {
    if (inFooter) setHover(false);
  }, [inFooter]);

  // Flip the pill layout when the mini logo appears / disappears
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    contextSafe(() => {
      const state = Flip.getState('[data-flip]');
      navRef.current!.classList.toggle(s.isScrolled, scrolled);
      if (prefersReducedMotion()) return;
      Flip.from(state, {
        ...cfg.flip,
        absolute: false,
        nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, x: cfg.logoEnter.x, scale: 1 }, { ...cfg.logoEnter, opacity: 1, x: 0, scale: 1, force3D: true }),
        onLeave: (els) => gsap.fromTo(els, { opacity: 1, scale: 1 }, { opacity: 0, ...cfg.logoLeave }),
      });
    })();
  }, [scrolled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Panel height = tallest submenu column + 36px (+ CTA row + 7rem)
  useEffect(() => {
    const measure = () => {
      const cols = inner.current!.querySelectorAll<HTMLElement>('[data-submenu]');
      const row = inner.current!.querySelector<HTMLElement>('[data-ctas]');
      const tallest = Math.max(...Array.from(cols, (c) => c.offsetHeight));
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      inner.current!.style.setProperty('--submenu-max-height', `${tallest + cfg.submenuExtra + (row ? row.offsetHeight + 7 * rem : 0)}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [cfg.submenuExtra]);

  // Submenu columns + CTA row
  useEffect(() => {
    contextSafe(() => {
      const els = inner.current!.querySelectorAll('[data-submenu], [data-ctas]');
      gsap.killTweensOf(els);
      if (hover) gsap.to(els, { autoAlpha: 1, y: 0, ...cfg.submenuShow });
      else gsap.to(els, { autoAlpha: 0, ...cfg.submenuHide, clearProps: 'all' });
    })();
  }, [hover]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header ref={root} className={`${s.desktop} ${inFooter ? s.inFooter : ''}`}>
      <div className={s.inner}>
        <Link href={homeOf(lang)} className={`${s.logo} ${scrolled ? s.logoHidden : ''} ${dark ? s.logoDark : ''}`} onClick={onLogo} aria-label={t.ui.home}>
          <Logo ref={logo} />
        </Link>
        <nav ref={navRef} className={s.nav}>
          <LangSwitch className={s.langs} data-flip />
          <div ref={inner} className={s.pill} data-flip onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Link href={homeOf(lang)} className={s.pillLogo} data-flip onClick={onLogo} aria-label={t.ui.home}>
              <Logo mark />
            </Link>
            {t.nav.map((item) => (
              <div key={item.label} className={s.item} data-flip>
                <a href={item.href} {...ext(item.external)}>
                  <span className={item.external ? s.ext : ''}>{item.label}</span>
                </a>
                {item.children && (
                  <ul className={s.submenu} data-submenu>
                    {item.children.map((c) => (
                      <li key={c.label} className={s.subItem}>
                        <a href={c.href} {...ext(c.external)}>{c.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className={`${s.panel} ${hover ? s.panelVisible : ''}`}>
              <div className={s.ctas} data-ctas>
                {t.navCtas.map((c) => (
                  <a key={c.label} href={c.href} className={`${s.subCta} ${s[c.tone]}`}>
                    <span>{c.label}</span>
                    <span aria-hidden>→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ───────────────────────── Mobile / tablet (≤1179px) ───────────────────────── */

export function HeaderMobile() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const logo = useLogoIntro();
  const scrolled = useScrolledPast(ANIM.headerMobile.scrolledAt);
  const [open, setOpen] = useState(false);
  const inFooter = useInFooter();
  const [sub, setSub] = useState<number | null>(null);
  const onLogo = useLogoClick(ANIM.scrollTo.logoMobile);
  const dark = useDarkLogo();
  const lang = useLang();
  const t = content[lang];
  const cfg = ANIM.headerMobile;
  const { contextSafe } = useGSAP({ scope: root });

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const reduced = prefersReducedMotion();
    contextSafe(() => {
      if (open) {
        gsap.fromTo(panel.current, { maxHeight: 0 }, { maxHeight: window.innerHeight, force3D: true, ...cfg.panel, duration: reduced ? 0 : cfg.panel.duration });
        if (!reduced)
          gsap.fromTo(panel.current!.querySelectorAll('[data-nav-li]'), { opacity: 0, y: cfg.items.y }, { ...cfg.items, opacity: 1, y: 0, force3D: true, clearProps: 'all' });
      } else {
        gsap.to(panel.current, {
          maxHeight: 0,
          force3D: true,
          ...cfg.panel,
          duration: reduced ? 0 : cfg.panel.duration,
          onComplete: () => {
            panel.current!.firstElementChild!.scrollTop = 0;
            setSub(null);
          },
        });
      }
    })();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header ref={root} className={`${s.mobile} ${inFooter && !open ? s.inFooter : ''}`}>
      <div className={s.mInner}>
        <Link
          href={homeOf(lang)}
          className={`${s.mLogo} ${scrolled && !open ? s.logoHidden : ''} ${dark ? s.logoDark : ''} ${open ? s.mLogoOpen : ''}`}
          onClick={onLogo}
          aria-label={t.ui.home}
        >
          <Logo ref={logo} />
        </Link>
        <div className={s.mRight}>
          <LangSwitch className={`${s.langs} ${s.mLangs}`} onClick={() => setOpen(false)} />
          <button type="button" className={s.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav">
            <svg viewBox="0 0 24 24" aria-hidden>
              {/* Grid stays a grid when open: the reference calls morphSVG without registering the plugin */}
              <path fill="currentColor" d="M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4zM3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4z" />
            </svg>
            <span>{t.ui.menu}</span>
          </button>
        </div>
      </div>

      <div ref={panel} id="mobile-nav" className={s.mNav} inert={!open} onClick={(e) => (e.target as Element).closest('a') && setOpen(false)}>
        <div className={s.mNavInner}>
          <ul className={s.mList}>
            {t.nav.map((item, i) => (
              <li key={item.label} className={`${s.mItem} ${sub === i ? s.isOpen : ''}`} data-nav-li>
                <div className={s.mLink}>
                  <a href={item.href} {...ext(item.external)}>
                    <span className={item.external ? s.ext : ''}>{item.label}</span>
                  </a>
                  {item.children && (
                    <button type="button" className={s.mArrow} onClick={() => setSub(sub === i ? null : i)} aria-expanded={sub === i} aria-label={t.ui.open(item.label)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </button>
                  )}
                </div>
                {item.children && (
                  <div className={s.mSub}>
                    <ul className={s.mSubList}>
                      {item.children.map((c) => (
                        <li key={c.label}>
                          <a href={c.href} {...ext(c.external)}>{c.label}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
            {t.navCtas.map((c) => (
              <li key={c.label} className={s.mCtaItem} data-nav-li>
                <a href={c.href} className={s.mCta}>
                  <span>{c.label}</span>
                  <span aria-hidden>→</span>
                </a>
              </li>
            ))}
            <li className={`t-mono ${s.mFooter}`} data-nav-li>
              {t.menuFooter.map((col) => (
                <div key={col.title}>
                  <div className={s.mFooterTitle}>{col.title}</div>
                  <ul>
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a href={l.href}>{l.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
            <li className={`t-mono ${s.mCopy}`} data-nav-li>
              {t.legal.map((l) => (
                <span key={l} className={s.mCopyText}>
                  {l}
                </span>
              ))}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
