'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { afterMount, revealStagger } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Logo, logoTimeline } from './Logo';
import { Icon } from './Icon';
import { content, type FooterLink } from '@/content/site';
import { useLang } from '@/lib/i18n';
import { useMapsHref } from '@/lib/maps';
import s from './Footer.module.css';

/** A link with `confirm` needs two taps: the first only swaps its label, so a stray tap doesn't throw you out to Maps. */
function FooterAnchor({ link, num }: { link: FooterLink; num: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [armed, setArmed] = useState(false);
  const href = useMapsHref(link.href, link.hrefApple);

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

  const label = (
    <span aria-live={link.confirm ? 'polite' : undefined}>
      {armed ? (
        <>
          {link.confirm} <Icon name="arrow-out" className={s.out} />
        </>
      ) : (
        link.label
      )}
    </span>
  );
  if (!href)
    return (
      <span className={s.link}>
        <span className={s.num}>{num}</span>
        {label}
      </span>
    );
  return (
    <a ref={ref} href={href} className={s.link} onClick={onClick} {...(link.confirm ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <span className={s.num}>{num}</span>
      {label}
    </a>
  );
}

/** Four numbered blocks (2 × 2 on phones and tablets, in a row on desktop), the © line, and the wordmark that builds with the scroll. */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logo = useRef<SVGSVGElement>(null);
  const t = content[useLang()];
  const columns = t.footer.columns;

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
    <footer ref={root} className={s.footer}>
      <div ref={innerRef} className={`t-mono ${s.inner}`}>
        <nav ref={navRef} className={s.nav}>
          {columns.map((col, c) => (
            <ul key={col.title} className={s.list} data-reveal="">
              {col.links.map((l, i) => (
                <li key={l.label}>
                  <FooterAnchor link={l} num={`${c + 1}.${i + 1}`} />
                </li>
              ))}
            </ul>
          ))}
        </nav>
        {/* the © line; on hover, or on a tap on phones (it takes focus), the credits take its place, as on yuriroga.com */}
        <div className={s.colophon} tabIndex={0}>
          <p className={s.copyright}>
            <span className={s.num}>©</span>
            <span>{t.footer.copyright}</span>
          </p>
          <p className={s.credits}>
            <span className={s.num} />
            <span>
              {t.footer.credits.label}{' '}
              <a href={t.footer.credits.href} target="_blank" rel="noreferrer">
                {t.footer.credits.name}
              </a>
            </span>
          </p>
        </div>
        {/* the wordmark closes the footer */}
        <div className={s.logo}>
          <Logo ref={logo} />
        </div>
      </div>
    </footer>
  );
}
