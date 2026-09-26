'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { ANIM } from '@/config/animations';

/** Plain white cover: visible 1s after mount, then autoAlpha 0 in .33s. Fires window "loader:removed". */
export function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);

  useGSAP((_, contextSafe) => {
    const id = window.setTimeout(
      contextSafe!(() => {
        window.dispatchEvent(new Event('loader:removed'));
        gsap.to(ref.current, { autoAlpha: 0, duration: ANIM.loader.fadeDuration, onComplete: () => setMounted(false) });
      }),
      ANIM.loader.visibleFor,
    );
    return () => clearTimeout(id);
  });

  if (!mounted) return null;
  return <div ref={ref} aria-hidden style={{ position: 'fixed', inset: 0, background: 'var(--color-white)', zIndex: 10000 }} />;
}
