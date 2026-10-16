'use client';

import { useRef, type CSSProperties } from 'react';
import { useGSAP } from '@/lib/gsap';
import { afterMount, revealMedia } from '@/lib/reveal';

export type MediaData = {
  /** Path in /public/assets. Leave empty to render the black placeholder. */
  src?: string;
  type?: 'image' | 'video';
  alt?: string;
  /** Placeholder aspect ratio when there is no asset (w / h). */
  aspect?: number;
  /** Focal point kept in frame when the box crops the asset (CSS object-position), e.g. '80% 50%'. */
  focus?: string;
};

type Props = MediaData & {
  className?: string;
  style?: CSSProperties;
  /** 'reveal': enters by opening into its frame (see revealMedia); 'drift': also slides inside the frame with the scroll.
   *  The parent is the frame: it must clip (overflow hidden + radius). */
  motion?: 'reveal' | 'drift';
};

/**
 * Asset or black placeholder. Replace `src` values in content/site.ts with files
 * from /public/assets — the layout already reserves the right box.
 */
export function Media({ src, type = 'image', alt = '', aspect = 1, focus, className, style, motion }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const box: CSSProperties = { position: 'relative', width: '100%', display: 'block', ...style };
  const fill: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, display: 'block' };

  useGSAP(
    (_, contextSafe) => {
      if (motion) return afterMount(() => revealMedia(ref.current, { drift: motion === 'drift' }), contextSafe!);
    },
    { dependencies: [motion] },
  );

  const reveal = motion ? { 'data-media-reveal': '' } : {};
  if (!src) {
    return (
      <div ref={ref} className={className} style={box} data-placeholder {...reveal}>
        <div data-fill style={{ ...fill, aspectRatio: aspect, background: 'var(--color-placeholder)' }} />
      </div>
    );
  }
  return (
    <div ref={ref} className={className} style={box} {...reveal}>
      {type === 'video' ? (
        <video data-fill src={src} autoPlay muted loop playsInline style={{ ...fill, aspectRatio: aspect }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img data-fill src={src} alt={alt} loading="lazy" decoding="async" style={{ ...fill, aspectRatio: aspect }} />
      )}
    </div>
  );
}
