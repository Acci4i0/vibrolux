'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { ANIM } from '@/config/animations';
import { BASE } from '@/content/site';
import { langOf } from '@/lib/i18n';

/** '/vibrolux/azienda/' → '/azienda': router.push adds the base itself; the trailing slash varies on Pages. */
const route = (pathname: string) => (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname).replace(/\/$/, '') || '/';

/** Anchor's section (accordion items move while panels animate; their section doesn't). */
const hashTarget = (hash: string) => (hash ? document.querySelector(hash)?.closest('section') ?? document.querySelector(hash) : null);

/**
 * Reference page transition (Vue "fade-page", mode out-in):
 * leave: page + footer fade out .5s → navigate → scroll to top/hash while hidden →
 * enter: page fades in .5s after .66s (CSS), footer returns + ScrollTrigger.refresh() after .5s.
 * Same-page hash links scroll with expo.inOut (1s, offset 100).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const first = useRef(true);
  const { leave, footerBack, hashScroll } = ANIM.pageTransition;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || /\.\w+$/.test(url.pathname)) return; // external or file (pdf)
      e.preventDefault();
      if (route(url.pathname) === route(location.pathname)) {
        if (!url.hash) return;
        history.pushState(null, '', url.hash);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        gsap.to(window, { scrollTo: { y: hashTarget(url.hash) ?? 0, offsetY: 100 }, ...hashScroll, duration: prefersReducedMotion() ? 0 : hashScroll.duration });
        return;
      }
      document.body.classList.add('is-page-transitioning', 'is-page-leaving');
      setTimeout(() => router.push(route(url.pathname) + url.hash, { scroll: false }), prefersReducedMotion() ? 0 : leave);
    };
    document.addEventListener('click', onClick, true); // capture: runs before anything else can navigate
    return () => document.removeEventListener('click', onClick, true);
  }, [router, leave, hashScroll]);

  // New page is mounted but still hidden: jump to top / hash, then fade in
  useLayoutEffect(() => {
    document.documentElement.lang = langOf(pathname);
    if (first.current) return void (first.current = false);
    const target = hashTarget(location.hash);
    window.scrollTo(0, target ? target.getBoundingClientRect().top + window.scrollY - 100 : 0);
    document.body.classList.remove('is-page-leaving');
    const id = setTimeout(() => {
      ScrollTrigger.refresh();
      document.body.classList.remove('is-page-transitioning');
    }, footerBack);
    return () => clearTimeout(id);
  }, [pathname, footerBack]);

  return <div className="page">{children}</div>;
}
