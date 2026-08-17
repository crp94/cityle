'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Feather } from 'lucide-react';
import { getDailyGameNumber } from '../../lib/gameLogic';
import { CURATOR_NOTES, CuratorNote, getCuratorNoteForDay } from '../../lib/curatorNotes';
import { getTranslation, Locale } from '../../lib/i18n';

// Mirrors the locale-restore pattern already used independently by
// GameApp.tsx, src/app/atlas/page.tsx, src/app/almanac/page.tsx,
// src/app/marathon/page.tsx and src/app/playlists/page.tsx — deferred via
// requestAnimationFrame so the state update doesn't happen synchronously
// inside the effect body (trips the react-hooks/set-state-in-effect lint
// rule). Only the page chrome around the notes goes through this — the
// essays themselves are English-only authored content (see curatorNotes.ts).
function useNotesLocale(): Locale {
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

function NoteBody({ note, headingLevel }: { note: CuratorNote; headingLevel: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <>
      <Heading className="text-2xl font-bold leading-snug text-[#F4F6F8] sm:text-[1.75rem]">
        {note.title}
      </Heading>
      {note.paragraphs.map((paragraph, index) => (
        <p key={index} className="max-w-[65ch] text-base leading-[1.85] text-[#c5ced7]">
          {paragraph}
        </p>
      ))}
    </>
  );
}

export default function NotesPage() {
  const locale = useNotesLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);

  // Deterministic by day, same "compute directly during render, no
  // placeholder frame" tradeoff buildFreshMarathonState (marathon/page.tsx)
  // already accepts — safe here too since getCuratorNoteForDay is a pure
  // function of the current date and the fixed CURATOR_NOTES pool.
  const dailyNumber = useMemo(() => getDailyGameNumber(), []);
  const featuredNote = useMemo(
    () => getCuratorNoteForDay(dailyNumber, CURATOR_NOTES),
    [dailyNumber]
  );
  const otherNotes = useMemo(
    () => CURATOR_NOTES.filter((note) => note.id !== featuredNote.id),
    [featuredNote]
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 py-10 sm:py-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3FD17C]/40 bg-[#3FD17C]/10 text-[#3FD17C]">
            <Feather className="h-5 w-5" />
          </span>
          <span className="stamp text-[#3FD17C]">{t.notesPageEyebrow}</span>
          <h1 className="text-3xl font-bold text-[#F4F6F8] sm:text-4xl">{t.notesPageTitle}</h1>
          <p className="max-w-md text-sm leading-relaxed text-[#8f9dac]">{t.notesPageIntro}</p>
        </header>

        <section aria-labelledby="featured-note-heading" className="flex flex-col gap-4 border-y border-white/10 py-9">
          <span className="stamp stamp-accent">{t.notesFeaturedBadge}</span>
          <div id="featured-note-heading" className="flex flex-col gap-4">
            <NoteBody note={featuredNote} headingLevel="h2" />
          </div>
        </section>

        <section className="flex flex-col gap-9">
          <h2 className="stamp">{t.notesMoreHeading}</h2>
          <div className="flex flex-col divide-y divide-white/8">
            {otherNotes.map((note) => (
              <article key={note.id} className="flex flex-col gap-4 py-9 first:pt-0">
                <NoteBody note={note} headingLevel="h3" />
              </article>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
            {t.marathonBackToCityle}
          </Link>
        </div>
      </div>
    </div>
  );
}
