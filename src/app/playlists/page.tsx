'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ListMusic } from 'lucide-react';
import { getTranslation, Locale } from '../../lib/i18n';
import { PLAYLISTS } from '../../lib/playlists';

// Mirrors the locale-restore pattern already used independently by
// GameApp.tsx, src/app/atlas/page.tsx, src/app/almanac/page.tsx, and
// src/app/marathon/page.tsx — deferred via requestAnimationFrame so the
// state update doesn't happen synchronously inside the effect body (trips
// the react-hooks/set-state-in-effect lint rule).
function usePlaylistsLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('cityle_locale') as Locale | null;
        if (saved && ['en', 'es', 'it'].includes(saved)) {
          setLocale(saved);
        }
      } catch {
        // Storage may be unavailable in strict privacy modes — fall back to 'en'.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return locale;
}

export default function PlaylistsPage() {
  const locale = usePlaylistsLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <header className="border-b border-white/10 bg-[#0A0C10]/96 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="stamp text-[#FFB238]">{t.playlistPageEyebrow}</p>
              <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">{t.playlistsPageTitle}</h1>
            </div>
            <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
              {t.marathonBackToCityle}
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-[#8f9dac]">{t.playlistsPageIntro}</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLAYLISTS.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.id}`}
              className="nothing-widget group flex flex-col gap-2 p-4 transition-colors hover:border-[#3FD17C]/40 sm:p-5"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3FD17C]/15 text-[#3FD17C]">
                  <ListMusic className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-[#F4F6F8] sm:text-lg">{playlist.name}</h2>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-[#8f9dac]">{playlist.blurb}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="stamp text-[0.65rem] text-[#8f9dac]">
                  {t.playlistCityCount.replace('{n}', String(playlist.cityIds.length))}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-[#3FD17C] px-3 py-1.5 text-xs font-semibold text-[#0A0C10] transition-colors group-hover:bg-[#34D67E]">
                  {t.playlistPlayCta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
