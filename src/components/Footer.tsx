import { getTranslation } from '@/lib/i18n';

const CREDIT_URL = 'https://carlosrodriguezpardo.es/';
const CREDIT_NAME = 'Carlos Rodríguez-Pardo';

/**
 * Global, single-line credit footer mounted once in the root layout so it
 * renders on genuinely every route (daily/unlimited/archive/photo game,
 * Atlas, Almanac, Marathon, result pages, challenge links) without touching
 * any individual page. Deliberately separate from GameApp.tsx's own inline
 * footer (methodology/sources button + tagline), which stays untouched and
 * simply sits above this one on the two routes that render GameApp.
 *
 * Plain server component: no hooks, no client-side state needed. Locale
 * switching elsewhere in the app is a client-only preference (localStorage,
 * read inside GameApp) that a root-layout server component has no way to
 * read, so this quiet credit line renders in the default locale, matching
 * the <html lang="en"> the root layout already declares.
 */
export default function Footer() {
  const t = getTranslation('en');

  return (
    <footer className="border-t border-white/10 bg-[#0A0C10] py-4 text-center text-xs text-[#8f9dac]">
      <p>
        {t.madeByLabel}{' '}
        <a
          href={CREDIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8f9dac] underline underline-offset-4 transition-colors hover:text-[#c5ced7]"
        >
          {CREDIT_NAME}
        </a>
      </p>
    </footer>
  );
}
