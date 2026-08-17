'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BarChart3, CalendarDays, Flame, Heart, HelpCircle, RotateCcw, Swords, Zap } from 'lucide-react';
import { ExploreMenu } from './ExploreMenu';
import { Locale, Translations } from '../lib/i18n';
import { getSettings, saveSettings } from '../lib/storage';
import { Difficulty, GameMode, GameStats } from '../lib/types';

interface HeaderProps {
  mode: GameMode;
  dailyNumber: number;
  onToggleMode: (mode: GameMode) => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onOpenArchive: () => void;
  onNewUnlimitedGame: () => void;
  // Phase 4, Workstream Y: mirrors onNewUnlimitedGame for the new Photo
  // pill's reroll button — optional so this stays a purely additive prop
  // for any other Header caller that hasn't wired Photo mode in.
  onNewPhotoGame?: () => void;
  stats: GameStats;
  difficulty: Difficulty;
  onToggleDifficulty: () => void;
  difficultyLocked: boolean;
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  t: Translations;
}

export const Header = ({
  mode,
  dailyNumber,
  onToggleMode,
  onOpenStats,
  onOpenHelp,
  onOpenArchive,
  onNewUnlimitedGame,
  onNewPhotoGame,
  stats,
  difficulty,
  onToggleDifficulty,
  difficultyLocked,
  locale,
  onChangeLocale,
  t,
}: HeaderProps) => {
  const streakValue = mode === 'unlimited' ? stats.unlimited.currentRun : stats.currentStreak;

  // Lives Mode toggle (GameSettings.livesMode in storage.ts) — an on/off control only, entirely
  // self-contained here like the locale <select> below: it reads/writes localStorage directly
  // rather than flowing through a controlled prop from the parent, mirroring how GameApp already
  // reads getSettings().livesMode straight from storage at game-start time rather than tracking it
  // as React state. Reuses `difficultyLocked` for its own disabled state: that prop already means
  // "an active game has guesses in progress," and changing Lives Mode mid-game would desync that
  // in-progress game for the exact same reason changing Hard Mode would.
  //
  // Initial state is always `false`, matching what SSR renders (no localStorage on the server) —
  // seeding this via a lazy `useState(() => getSettings().livesMode)` initializer instead caused a
  // real hydration mismatch: the client's first hydration pass already has localStorage access, so
  // a previously-saved `livesMode: true` would render immediately while the server-rendered HTML
  // still showed `false`, exactly the "aria-pressed server vs client" divergence Next.js flags as a
  // Recoverable Error. Deferring the real read to a rAF-scheduled effect (matching every locale
  // hook elsewhere in this codebase) keeps the first client render identical to the server's.
  const [livesMode, setLivesMode] = useState<boolean>(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setLivesMode(getSettings().livesMode);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleToggleLivesMode() {
    if (difficultyLocked) return;
    const next = !livesMode;
    setLivesMode(next);
    saveSettings({ ...getSettings(), livesMode: next });
  }

  return (
  <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0C10]/96 backdrop-blur-md">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2.5 sm:px-5">
      <div className="flex items-center gap-2.5">
        <Image src="/cityle-logo.png" alt="" width={38} height={38} priority className="h-9 w-9 object-contain" />
        <div>
          <span className="block font-mono text-lg font-bold tracking-[-0.08em] text-[#eef1f3] sm:text-xl">{t.appName}</span>
          <span className="hidden text-[0.68rem] text-[#8f9dac] sm:block">urban climate deduction</span>
        </div>
      </div>

      <nav aria-label="Game mode" className="order-3 flex w-full flex-wrap items-center gap-1.5 sm:order-none sm:w-auto">
        <div className="flex flex-1 rounded-md border border-[#2a3340] bg-[#10151c] p-1 sm:flex-none">
          <button
            onClick={() => onToggleMode('daily')}
            aria-pressed={mode === 'daily'}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${mode === 'daily' ? 'bg-[#F4F6F8] text-[#0A0C10]' : 'text-[#96a3af] hover:text-white'}`}
          >
            {t.daily} #{dailyNumber}
          </button>
          <button
            onClick={() => onToggleMode('unlimited')}
            aria-pressed={mode === 'unlimited'}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${mode === 'unlimited' ? 'bg-[#F4F6F8] text-[#0A0C10]' : 'text-[#96a3af] hover:text-white'}`}
          >
            {t.unlimited}
          </button>
          <button
            onClick={() => onToggleMode('photo')}
            aria-pressed={mode === 'photo'}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${mode === 'photo' ? 'bg-[#F4F6F8] text-[#0A0C10]' : 'text-[#96a3af] hover:text-white'}`}
          >
            {t.photo}
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenArchive}
          aria-label={t.openArchiveLabel}
          title={t.openArchiveLabel}
          className="icon-button shrink-0"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleDifficulty}
          disabled={difficultyLocked}
          aria-pressed={difficulty === 'hard'}
          aria-label={difficultyLocked ? t.difficultyLockedHint : t.difficultyToggleHint}
          title={difficultyLocked ? t.difficultyLockedHint : t.difficultyToggleHint}
          className={`shrink-0 flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors border disabled:cursor-not-allowed disabled:opacity-40 ${
            difficulty === 'hard'
              ? 'border-[#FFB238]/60 bg-[#FFB238]/15 text-[#FFB238]'
              : 'border-[#2a3340] bg-[#10151c] text-[#96a3af] hover:text-white'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />{' '}
          <span className="hidden sm:inline">{difficulty === 'hard' ? t.difficultyHard : t.difficultyStandard}</span>
        </button>
        <button
          type="button"
          onClick={handleToggleLivesMode}
          disabled={difficultyLocked}
          aria-pressed={livesMode}
          aria-label={difficultyLocked ? t.livesModeLockedHint : t.livesModeToggleHint}
          title={difficultyLocked ? t.livesModeLockedHint : t.livesModeToggleHint}
          className={`shrink-0 flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors border disabled:cursor-not-allowed disabled:opacity-40 ${
            livesMode
              ? 'border-[#FF4D4D]/60 bg-[#FF4D4D]/15 text-[#FF4D4D]'
              : 'border-[#2a3340] bg-[#10151c] text-[#96a3af] hover:text-white'
          }`}
        >
          <Heart className="h-3.5 w-3.5" />{' '}
          <span className="hidden sm:inline">{livesMode ? t.livesModeOn : t.livesModeOff}</span>
        </button>
      </nav>

      <div className="flex items-center gap-1.5">
        {(mode === 'unlimited' || mode === 'photo') && (
          <button
            onClick={mode === 'photo' ? onNewPhotoGame : onNewUnlimitedGame}
            aria-label={t.nextRandom}
            title={t.nextRandom}
            className="icon-button"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        {streakValue > 0 && (
          <span className="hidden items-center gap-1 text-xs font-semibold text-[#FFB238] sm:inline-flex">
            {mode === 'unlimited' ? <Zap className="h-4 w-4" /> : <Flame className="h-4 w-4" />} {streakValue}
          </span>
        )}
        <ExploreMenu t={t} />
        <label className="sr-only" htmlFor="locale">Language</label>
        <select
          id="locale"
          value={locale}
          onChange={(event) => onChangeLocale(event.target.value as Locale)}
          className="h-9 rounded border border-[#2a3340] bg-[#10151c] px-2 text-xs font-semibold uppercase text-[#b8c2cb] focus:border-[#3FD17C] focus:outline-none"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="it">IT</option>
        </select>
        <button onClick={onOpenStats} aria-label="Statistics" className="icon-button"><BarChart3 className="h-4 w-4" /></button>
        <button onClick={onOpenHelp} aria-label="How to play and methodology" className="icon-button"><HelpCircle className="h-4 w-4" /></button>
      </div>
    </div>
  </header>
  );
};
