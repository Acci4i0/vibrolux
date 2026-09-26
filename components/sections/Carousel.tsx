'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import s from './Carousel.module.css';

type Item = { label: string; text: string; media: MediaData };

/** Vue <transition name="fade-up" mode="out-in"> equivalent: opacity .25s ease + transform .25s ease-out. */
const FADE_MS = 250;
const fadeUp = (el: HTMLElement, o: number[], y: string[]) => [
  el.animate({ opacity: o }, { duration: FADE_MS, easing: 'ease', fill: 'forwards' }),
  el.animate({ transform: y.map((v) => `translateY(${v})`) }, { duration: FADE_MS, easing: 'ease-out', fill: 'forwards' }),
];

export function Carousel({ data }: { data: { id?: string; eyebrow: string; items: Item[] } }) {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const textBox = useRef<HTMLDivElement>(null);
  const textEl = useRef<HTMLParagraphElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const navItems = useRef<(HTMLButtonElement | null)[]>([]);
  const items = data.items;
  const [active, setActive] = useState(items.length === 3 ? 1 : 0);
  const [shownText, setShownText] = useState(items[active].text);
  const longest = items.reduce((a, b) => (b.text.length > a.length ? b.text : a), '');

  useGSAP(
    (_, contextSafe) =>
      afterMount(() => {
        reveal(heading.current);
        reveal(textBox.current);
      }, contextSafe!),
    { scope: root },
  );

  const moveMarker = useCallback((instant = false) => {
    const el = navItems.current[active];
    if (!el || !marker.current) return;
    const vars = { x: el.offsetLeft, width: el.getBoundingClientRect().width };
    if (instant || prefersReducedMotion()) gsap.set(marker.current, vars);
    else gsap.to(marker.current, { ...vars, ...ANIM.carousel.marker });
  }, [active]);

  // Marker follows the active item (elastic), and re-measures on resize (+250ms like the original)
  useLayoutEffect(() => {
    moveMarker();
  }, [moveMarker]);
  useEffect(() => {
    let t: number;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(() => moveMarker(true), ANIM.carousel.markerResizeDelay);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, [moveMarker]);

  // Text: fade-up out → swap → fade-up in
  useEffect(() => {
    const el = textEl.current;
    const next = items[active].text;
    if (!el || next === shownText) return;
    if (prefersReducedMotion()) return setShownText(next);
    const anims = fadeUp(el, [1, 0], ['0', '-2rem']);
    anims[0].onfinish = () => setShownText(next);
    return () => anims.forEach((a) => a.cancel());
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = textEl.current;
    if (!el || prefersReducedMotion()) return;
    const anims = fadeUp(el, [0, 1], ['2rem', '0']);
    return () => anims.forEach((a) => a.cancel());
  }, [shownText]);

  const next = () => setActive((i) => (i < items.length - 1 ? i + 1 : 0));

  return (
    <section ref={root} id={data.id} className={s.carousel} data-module="carousel">
      <div className={s.inner}>
        <div className={s.content}>
          <h2 ref={heading} className="t-eyebrow" data-reveal="">
            {data.eyebrow}
          </h2>
          <div ref={textBox} className={`t-large ${s.text}`} data-reveal="">
            <p ref={textEl} key="text" aria-live="polite">
              {shownText}
            </p>
            <div className={s.textLonger} aria-hidden>
              {longest}
            </div>
          </div>
        </div>
        <div className={s.carouselCol}>
          <div className={s.part}>
            <div className={s.media} onClick={next}>
              {items.map((it, i) => (
                <div key={i} className={`${s.item} ${i === active ? s.isActive : ''}`}>
                  <Media {...it.media} className={s.itemMedia} />
                </div>
              ))}
            </div>
            <div className={s.nav}>
              <div className={s.navInner}>
                {items.map((it, i) => (
                  <button
                    key={i}
                    ref={(el) => {
                      navItems.current[i] = el;
                    }}
                    type="button"
                    className={`${s.navItem} ${i === active ? s.isActive : ''}`}
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                  >
                    {it.label}
                  </button>
                ))}
                <span ref={marker} className={s.marker} aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
