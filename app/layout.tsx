import type { Metadata } from 'next';
import { Martian_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { Loader } from '@/components/Loader';
import { HeaderDesktop, HeaderMobile } from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';
import { Footer } from '@/components/Footer';
import { BASE } from '@/content/site';
import './globals.css';

// Vibrolux Display (drawn from the logotype: wide, heavy, hairline slices) for headlines and figures,
// Vibrolux Text (same geometry, normal width, no slices) for text; Martian Mono stays for labels
const display = localFont({ src: './fonts/VibroluxDisplay-Bold.woff2', weight: '700', variable: '--font-vbx-display' });
const text = localFont({
  src: [
    { path: './fonts/VibroluxText-Light.woff2', weight: '300' },
    { path: './fonts/VibroluxText-Regular.woff2', weight: '400' },
    { path: './fonts/VibroluxText-Bold.woff2', weight: '700' },
  ],
  variable: '--font-vbx-text',
});
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
    <html lang="it" className={`${display.variable} ${text.variable} ${martian.variable}`} suppressHydrationWarning>
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
