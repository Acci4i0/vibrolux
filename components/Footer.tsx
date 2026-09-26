'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { afterMount, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Logo, logoTimeline } from './Logo';
import { footer as data, legal, type FooterLink } from '@/content/site';
import s from './Footer.module.css';

/** A link with `confirm` needs two taps: the first only swaps its label, so a stray tap doesn't throw you out to Maps. */
function FooterAnchor({ link, num }: { link: FooterLink; num: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [armed, setArmed] = useState(false);
  const [href, setHref] = useState(link.href);

  // Apple Maps on iPhone / iPad / Mac, Google Maps elsewhere
  useEffect(() => {
    if (link.hrefApple && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) setHref(link.hrefApple);
  }, [link.hrefApple]);

  // disarm on a tap elsewhere or after 4s
  useEffect(() => {
    if (!armed) return;
    const off = (e: PointerEvent) => !ref.current!.contains(e.target as Node) && setArmed(false);
    const t = setTimeout(() => setArmed(false), 4000);
    document.addEventListener('pointerdown', off);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', off);
    };
  }, [armed]);

  const onClick = (e: React.MouseEvent) => {
    if (!link.confirm) return;
    if (!armed) e.preventDefault();
    setArmed(!armed);
  };

  return (
    <a ref={ref} href={href} className={s.link} onClick={onClick} {...(link.confirm ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <span className={s.num}>{num}</span>
      <span aria-live={link.confirm ? 'polite' : undefined}>{armed ? `${link.confirm} ↗` : link.label}</span>
    </a>
  );
}

/**
 * MOCKUP: `mobile` switches the ≤767px layout of the columns (see /mockup/footer).
 * grid = 2 per row · squeeze = all in a row · tabs = titles in a row, one column shown · swipe = all in a row, scrollable
 * ponytail: keep only the chosen one.
 */
export type FooterMobile = 'grid' | 'squeeze' | 'tabs' | 'swipe';

const columns = data.columns;

export function Footer({ mobile = 'grid' }: { mobile?: FooterMobile }) {
  const root = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logo = useRef<SVGSVGElement>(null);
  const [tab, setTab] = useState(0);

  useGSAP(
    (_, contextSafe) => {
      // Logo builds with scroll: timeline 0 → 1 from the moment it enters the viewport to the end of the page
      if (!prefersReducedMotion())
        gsap.to(logoTimeline(logo.current!), {
          progress: 1,
          ease: 'none',
          scrollTrigger: { trigger: logo.current, start: ANIM.logo.footerScrubStart, end: 'max', scrub: ANIM.logo.footerScrub },
        });
      return afterMount(() => {
        revealStagger(innerRef.current, navRef.current!.children, {
          delay: ANIM.footer.navDelay,
          stagger: ANIM.footer.navStagger,
        });
      }, contextSafe!);
    },
    { scope: root },
  );

  return (
    <footer ref={root} className={`${s.footer} ${s[`m_${mobile}`]}`}>
      <div ref={innerRef} className={`t-mono ${s.inner}`}>
        {mobile === 'tabs' && (
          <div className={s.tabs} role="tablist">
            {columns.map((col, i) => (
              <button key={col.title} type="button" role="tab" aria-selected={i === tab} className={s.tab} onClick={() => setTab(i)}>
                {col.title}
              </button>
            ))}
          </div>
        )}
        <nav ref={navRef} className={s.nav}>
          {columns.map((col, c) => (
            <div key={col.title} className={s.col} data-active={c === tab} data-reveal="">
              <ul className={s.list}>
                {col.links.map((l, i) => (
                  <li key={l.label}>
                    <FooterAnchor link={l} num={`${c + 1}.${i + 1}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {/* legal row on the column grid: © | P.IVA | Privacy + Termini */}
        <div className={s.legal}>
          {legal.map((l) => (
            <span key={l}>{l}</span>
          ))}
          <span className={s.legalLinks}>
            {data.legalLinks.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </span>
        </div>
        {/* the wordmark closes the footer */}
        <div className={s.logo}>
          <Logo ref={logo} />
        </div>
      </div>
    </footer>
  );
}
