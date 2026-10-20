import type { Metadata } from 'next';
import { Hubot_Sans, Martian_Mono, Mona_Sans } from 'next/font/google';
import { Loader } from '@/components/Loader';
import { HeaderDesktop, HeaderMobile } from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';
import { Footer } from '@/components/Footer';
import { BASE } from '@/content/site';
import './globals.css';

// Hubot Sans for headlines and figures, its twin Mona Sans for text (GitHub), Martian Mono for labels — all OFL, with the width axis
const hubot = Hubot_Sans({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--font-hubot' });
const mona = Mona_Sans({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--font-mona' });
const martian = Martian_Mono({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--font-martian' });

export const metadata: Metadata = {
  title: { default: 'Vibrolux • Trattamenti superficiali dei metalli', template: '%s • Vibrolux' },
  description:
    'Vibrolux Srl, Sant’Ambrogio (TO): sabbiatura, vibrofinitura, tribofinitura isotropica, brillantatura, lavaggi e oliature. Certificata ISO 9001:2015.',
  // a private mockup for Vibrolux and the photographer until launch: kept out of search engines
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${hubot.variable} ${mona.variable} ${martian.variable}`} suppressHydrationWarning>
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
