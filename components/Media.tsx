import type { CSSProperties } from 'react';

export type MediaData = {
  /** Path in /public/assets (for 'youtube': the video id). Leave empty to render the black placeholder. */
  src?: string;
  type?: 'image' | 'video' | 'youtube';
  alt?: string;
  /** Placeholder aspect ratio when there is no asset (w / h). */
  aspect?: number;
  /** Focal point kept in frame when the box crops the asset (CSS object-position), e.g. '80% 50%'. */
  focus?: string;
};

type Props = MediaData & { className?: string; style?: CSSProperties };

/**
 * Asset or black placeholder. Replace `src` values in content/site.ts with files
 * from /public/assets — the layout already reserves the right box.
 */
export function Media({ src, type = 'image', alt = '', aspect = 1, focus, className, style }: Props) {
  const box: CSSProperties = { position: 'relative', width: '100%', display: 'block', ...style };
  const fill: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, display: 'block' };

  if (!src) {
    return (
      <div className={className} style={box} data-placeholder>
        <div data-fill style={{ ...fill, aspectRatio: aspect, background: 'var(--color-placeholder)' }} />
      </div>
    );
  }
  if (type === 'youtube') {
    // muted, looping, no controls, like a video file; the frame covers the box at 16:9 whatever its shape (privacy notice: youtube-nocookie)
    const q = `autoplay=1&mute=1&loop=1&playlist=${src}&controls=0&disablekb=1&playsinline=1&rel=0&iv_load_policy=3`;
    return (
      <div className={className} style={box}>
        <div data-fill style={{ ...fill, aspectRatio: aspect, background: 'var(--color-placeholder)', containerType: 'size', overflow: 'hidden', position: 'relative' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${src}?${q}`}
            title={alt}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            tabIndex={-1}
            style={{ border: 0, height: 'max(100cqh, 56.25cqw)', left: '50%', pointerEvents: 'none', position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', width: 'max(100cqw, 177.78cqh)' }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={className} style={box}>
      {type === 'video' ? (
        <video data-fill src={src} autoPlay muted loop playsInline style={{ ...fill, aspectRatio: aspect }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img data-fill src={src} alt={alt} loading="lazy" decoding="async" style={{ ...fill, aspectRatio: aspect }} />
      )}
    </div>
  );
}
