'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { afterMount, reveal } from '@/lib/reveal';
import { ANIM, MOTION_OK } from '@/config/animations';
import { Media, type MediaData } from '../Media';
import { Button } from '../Button';
import s from './Hero.module.css';

type Data = {
  media: MediaData;
  headline: string;
  cta: { label: string; href: string };
  corner?: { heading: string; text: string; media: MediaData; href: string };
};

export function Hero({ data }: { data: Data }) {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const cta = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const corner = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (_, contextSafe) => {
      // Bg → rounded card, scrubbed (desktop only)
      const { scrub } = ANIM.hero;
      gsap.matchMedia().add(`${scrub.media} and ${MOTION_OK}`, () => {
        gsap.to(bg.current, {
          scale: () => (100 - scrub.shrinkK / window.innerWidth) / 100,
          borderRadius: scrub.borderRadius,
          ease: 'none',
          force3D: true,
          scrollTrigger: { trigger: bg.current, start: scrub.start, end: scrub.end, scrub: true },
        });
      });

      return afterMount(() => {
        reveal(headline.current, { delay: ANIM.hero.headlineDelay });
        reveal(cta.current, { delay: ANIM.hero.ctaDelay });
        reveal(corner.current, { delay: ANIM.hero.cornerDelay, ...ANIM.hero.corner });
      }, contextSafe!, ANIM.hero.setupDelay);
    },
    { scope: root },
  );

  return (
    <section ref={root} className={s.hero}>
      <div ref={bg} className={s.bg}>
        <Media {...data.media} className={s.media} />
      </div>
      <div className={s.inner}>
        <div className={`${s.content} ${data.corner ? '' : s.noCorner}`}>
          <div className={s.left}>
            <h1 ref={headline} className={s.headline} data-reveal="">
              {data.headline}
            </h1>
            <Button ref={cta} href={data.cta.href} label={data.cta.label} variant="blur" data-reveal="" />
          </div>
          {data.corner && (
            <div className={s.right}>
              <a ref={corner} href={data.corner.href} className={s.corner} data-reveal="">
                <div className={s.cornerContent}>
                  <h2 className="t-eyebrow">{data.corner.heading}</h2>
                  <p className={s.cornerText}>{data.corner.text}</p>
                </div>
                <div className={s.cornerMedia}>
                  <Media {...data.corner.media} />
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
