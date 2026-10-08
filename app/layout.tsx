import type { Metadata } from 'next';
import { Schibsted_Grotesk, Chivo_Mono } from 'next/font/google';
import { Loader } from '@/components/Loader';
import { HeaderDesktop, HeaderMobile } from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';
import { Footer } from '@/components/Footer';
import { BASE } from '@/content/site';
import './globals.css';

// Schibsted Grotesk Bold stands in for Scto Grotesk A until its licensed files arrive (see globals.css);
// Chivo Mono ≈ T1 Sans Mono (see ANIMATION_SPEC.md). Both self-hosted by next/font.
const standin = Schibsted_Grotesk({ subsets: ['latin'], weight: '700', variable: '--font-standin' });
const chivoMono = Chivo_Mono({ subsets: ['latin'], variable: '--font-chivo-mono' });

export const metadata: Metadata = {
  title: { default: 'Vibrolux • Trattamenti superficiali dei metalli', template: '%s • Vibrolux' },
  description:
    'Vibrolux Srl, Sant’Ambrogio (TO): sabbiatura, vibrofinitura, tribofinitura isotropica, brillantatura, lavaggi e oliature. Certificata ISO 9001:2015.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${standin.variable} ${chivoMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide [data-reveal] elements until GSAP takes over (no-JS stays visible); English pages (/en) get lang="en" */}
        <script
          dangerouslySetInnerHTML={{
            __html: `var d=document.documentElement;d.classList.add('js');if(location.pathname.slice(${BASE.length}).split('/')[1]==='en')d.lang='en'`,
          }}
        />
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
