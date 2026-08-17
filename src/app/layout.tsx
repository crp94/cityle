import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Footer from '@/components/Footer';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import './globals.css';

// Heavy-weight display face for headings and "big moment" copy (win/loss
// ladder headline in VictoryModal, MissionBriefing hook line). Previously
// the CSS declared `--serif: Georgia` / `--sans: Inter` but neither was ever
// actually loaded via next/font, so both silently fell back to whatever
// sans-serif the OS shipped. This is the fix — both faces are now real,
// loaded webfonts exposed as CSS variables that globals.css consumes.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cityle — Urban Climate Deduction',
  description:
    'Identify a curated global city in six guesses using progressive climate, population, urban-form, and map clues.',
  icons: {
    icon: '/cityle-logo.png',
    apple: '/cityle-logo.png',
  },
  openGraph: {
    title: 'Cityle — Urban Climate Deduction',
    description:
      'Identify a curated global city in six guesses using progressive urban and climate clues.',
    type: 'website',
    url: 'https://cityle.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cityle — Urban Climate Deduction',
    description:
      'A daily deduction game with progressive climate, population, urban-form, and map clues.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
        {children}
        {/* Global credit footer — mounted once here so it renders on every
            route (daily/unlimited/archive/photo game, Atlas, Almanac,
            Marathon, result pages, challenge links) without touching any
            individual page. Leaves GameApp.tsx's own inline footer
            (methodology/sources + tagline) completely alone. */}
        <Footer />
        {/* Provider only — no track() calls here. Other workstreams fire
            custom events (game_completed, clue_category_selected,
            badge_unlocked, share_completed) from their own files once this
            is mounted. */}
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
