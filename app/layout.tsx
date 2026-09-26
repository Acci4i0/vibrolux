import type { Metadata } from 'next';
import { Geist, Chivo_Mono } from 'next/font/google';
import { Loader } from '@/components/Loader';
import { HeaderDesktop, HeaderMobile } from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';
import { Footer } from '@/components/Footer';
import './globals.css';

// Closest open-source match to the reference typefaces (see ANIMATION_SPEC.md)
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const chivoMono = Chivo_Mono({ subsets: ['latin'], variable: '--font-chivo-mono' });

export const metadata: Metadata = {
  title: { default: 'Vibrolux • Trattamenti superficiali dei metalli', template: '%s • Vibrolux' },
  description:
    'Vibrolux Srl, Sant’Ambrogio (TO): sabbiatura, vibrofinitura, tribofinitura isotropica, brillantatura, lavaggi e oliature. Certificata ISO 9001:2015.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} ${chivoMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide [data-reveal] elements until GSAP takes over (no-JS stays visible) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Loader />
        <HeaderDesktop />
        <HeaderMobile />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </body>
    </html>
  );
}
