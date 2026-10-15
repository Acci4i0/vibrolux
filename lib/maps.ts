'use client';

import { useEffect, useState } from 'react';

/** Apple Maps on iPhone / iPad / Mac, Google Maps elsewhere; swapped after hydration so the static HTML stays the same */
export function useMapsHref<T extends string | undefined>(google: T, apple?: string) {
  const [href, setHref] = useState<string | T>(google);
  useEffect(() => {
    if (apple && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) setHref(apple);
  }, [apple]);
  return href;
}
