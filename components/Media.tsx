import type { CSSProperties } from 'react';

export type MediaData = {
  /** Path in /public/assets. Leave empty to render the black placeholder. */
  src?: string;
  type?: 'image' | 'video';
  alt?: string;
  /** Placeholder aspect ratio when there is no asset (w / h). */
  aspect?: number;
  /** Focal point kept in frame when the box crops the asset (CSS object-position), e.g. '80% 50%'. */
  focus?: string;
  /** Images: other widths of the same picture (img srcset), and how wide it is shown (sizes). */
  srcSet?: string;
  sizes?: string;
  /** above the fold: load at once, first */
  priority?: boolean;
};

type Props = MediaData & { className?: string; style?: CSSProperties };

/**
 * Asset or black placeholder. Replace `src` values in content/site.ts with files
 * from /public/assets — the layout already reserves the right box.
 */
export function Media({ src, type = 'image', alt = '', aspect = 1, focus, srcSet, sizes, priority, className, style }: Props) {
  const box: CSSProperties = { position: 'relative', width: '100%', display: 'block', ...style };
  const fill: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, display: 'block' };

  if (!src) {
    return (
      <div className={className} style={box} data-placeholder>
        <div data-fill style={{ ...fill, aspectRatio: aspect, background: 'var(--color-placeholder)' }} />
      </div>
    );
  }
  return (
    <div className={className} style={box}>
      {type === 'video' ? (
        <video data-fill src={src} autoPlay muted loop playsInline style={{ ...fill, aspectRatio: aspect }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-fill
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          style={{ ...fill, aspectRatio: aspect }}
        />
      )}
    </div>
  );
}
