'use client';

import { useEffect, useMemo, useState } from 'react';
import { track } from '@vercel/analytics';
import { Database, Globe2, Trophy } from 'lucide-react';
import citiesData from '../data/curated-cities.json';
import { ComparisonMatrix } from './ComparisonMatrix';
import { Dossier } from './Dossier';
import { Header } from './Header';
import { ArchiveModal } from './Modals/ArchiveModal';
import { HelpModal } from './Modals/HelpModal';
import { StatsModal } from './Modals/StatsModal';
import { VictoryModal } from './Modals/VictoryModal';
import { MissionBriefing } from './MissionBriefing';
import { RobinsonMap } from './RobinsonMap';
import { SearchInput } from './SearchInput';
import { createDefaultAchievementsState, evaluateAchievements } from '../lib/achievements';
import { evaluateGuess, getDailyGameNumber, getDailyTargetCity, getUnlockedClues } from '../lib/gameLogic';
import { getTranslation, Locale } from '../lib/i18n';
import {
  createDefaultStats,
  getAchievementsState,
  getArchiveState,
  getPlayerStats,
  getSavedChallengeState,
  getSavedDailyState,
  getSavedUnlimitedState,
  getSettings,
  recordDailyResult,
  recordUnlimitedResult,
  saveAchievementsState,
  saveArchiveState,
  saveChallengeState,
  saveDailyState,
  saveSettings,
  saveUnlimitedState,
} from '../lib/storage';
import { City, Difficulty, GameMode, GameState, GameStats, GameStatus, GuessResult } from '../lib/types';

const cities = citiesData as City[];
const MAX_GUESSES = 6;

function randomCity(previousId?: string): City {
  const available = cities.filter((city) => city.id !== previousId);
  return available[Math.floor(Math.random() * available.length)] ?? cities[0];
}

interface GameAppProps {
  // Both are unused/undefined by default and byte-for-byte inert unless set —
  // wired up by Workstream J (challenge links, /challenge/[code]/page.tsx).
  // When set, GameApp skips daily-target/localStorage logic entirely, seeds
  // targetCity from challengeTargetCity, and reads/writes the single-slot
  // challenge save via getSavedChallengeState/saveChallengeState instead of
  // the daily one.
  forcedMode?: 'challenge';
  challengeTargetCity?: City;
}

export function GameApp({ forcedMode, challengeTargetCity }: GameAppProps = {}) {
  const isChallenge = forcedMode === 'challenge' && !!challengeTargetCity;

  const [locale, setLocale] = useState<Locale>('en');
  const [mode, setMode] = useState<GameMode>(() => (isChallenge ? 'challenge' : 'daily'));
  // Lazily resolved on first render (both server and client) so there is no placeholder
  // frame — no rAF-deferred correction needed for these two.
  const [dailyNumber] = useState<number>(() => getDailyGameNumber());
  const [archiveDayNumber, setArchiveDayNumber] = useState<number | null>(null);
  const [targetCity, setTargetCity] = useState<City>(() =>
    isChallenge ? (challengeTargetCity as City) : getDailyTargetCity(cities, getDailyGameNumber())
  );
  // Lazily resolved from settings on first render, same pattern as dailyNumber/targetCity above —
  // getSettings() already guards `typeof window === 'undefined'` (safe during SSR, returns the
  // default there) so there's no placeholder-then-correct frame. This matters beyond just avoiding
  // a visual flash: Dossier.tsx's unlock state is initialized once on mount from whatever
  // `difficulty` it's handed at that moment (keyed on city.id, not re-derived on prop change), so a
  // static 'standard' default corrected a frame later left Hard Mode games permanently stuck with
  // Climate & Air pre-unlocked for the rest of that game.
  const [difficulty, setDifficulty] = useState<Difficulty>(() => getSettings().difficulty);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [stats, setStats] = useState<GameStats>(() => createDefaultStats());
  const [achievements, setAchievements] = useState(() => createDefaultAchievementsState());
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);
  // Daily streak as it stood immediately before a loss resets it to 0 —
  // captured here (before recordDailyResult runs) so VictoryModal's
  // streak-aware loss subline can still name the streak that just broke.
  const [streakBeforeLoss, setStreakBeforeLoss] = useState<number>(0);
  const t = useMemo(() => getTranslation(locale), [locale]);

  useEffect(() => {
    // dailyNumber/targetCity/difficulty are already correct from lazy initial state (no flash to
    // fix here) — this effect only restores what genuinely requires localStorage: locale, stats,
    // achievements, and any in-progress daily (or, in challenge mode, challenge) save (which may
    // carry its own difficulty, set when that game's first guess was made — see the branches
    // below). Deferred one frame (matching the app's existing localStorage-restore timing) so the
    // batch of setState calls below doesn't fire synchronously within the effect body.
    const frame = requestAnimationFrame(() => {
      let savedLocale: Locale | null = null;
      try {
        savedLocale = localStorage.getItem('cityle_locale') as Locale | null;
      } catch {
        // Storage may be unavailable in strict privacy modes.
      }

      setStats(getPlayerStats());
      setAchievements(getAchievementsState());

      if (savedLocale && ['en', 'es', 'it'].includes(savedLocale)) {
        setLocale(savedLocale);
        document.documentElement.lang = savedLocale;
      }

      if (isChallenge) {
        // Challenge mode (Workstream J) skips getDailyTargetCity/daily localStorage entirely and
        // resumes from the single-slot challenge save instead — but only when that save is for
        // *this* link's target city; a challenge link for a different city always starts fresh
        // (empty guesses, matching the lazy initial state above), never showing another
        // challenge's in-progress guesses.
        const savedChallenge = getSavedChallengeState();
        if (savedChallenge?.targetCityId === targetCity.id) {
          setGuesses(savedChallenge.guesses);
          setStatus(savedChallenge.status);
          setDifficulty(savedChallenge.difficulty ?? getSettings().difficulty);
        }
        return;
      }

      const savedDaily = getSavedDailyState(dailyNumber);
      if (savedDaily?.targetCityId === targetCity.id) {
        setGuesses(savedDaily.guesses);
        setStatus(savedDaily.status);
        // A resumed game's own recorded difficulty takes precedence over the current settings
        // default (the player may have changed the global setting after this game started).
        setDifficulty(savedDaily.difficulty ?? getSettings().difficulty);
      }
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNewUnlimitedGame() {
    const nextCity = randomCity(targetCity.id);
    const nextDifficulty = getSettings().difficulty;
    setTargetCity(nextCity);
    setGuesses([]);
    setStatus('playing');
    setDifficulty(nextDifficulty);
    setIsVictoryModalOpen(false);
    setNewlyUnlockedBadges([]);
    saveUnlimitedState({
      mode: 'unlimited',
      dailyNumber: 0,
      targetCityId: nextCity.id,
      guesses: [],
      status: 'playing',
      maxGuesses: MAX_GUESSES,
      difficulty: nextDifficulty,
    });
  }

  function handleToggleMode(nextMode: GameMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setArchiveDayNumber(null);
    setIsVictoryModalOpen(false);
    setNewlyUnlockedBadges([]);

    if (nextMode === 'daily') {
      const dailyCity = getDailyTargetCity(cities, dailyNumber);
      const saved = getSavedDailyState(dailyNumber);
      const validSaved = saved?.targetCityId === dailyCity.id ? saved : null;
      setTargetCity(dailyCity);
      setGuesses(validSaved?.guesses ?? []);
      setStatus(validSaved?.status ?? 'playing');
      setDifficulty(validSaved?.difficulty ?? getSettings().difficulty);
      return;
    }

    const saved = getSavedUnlimitedState();
    const savedCity = saved ? cities.find((city) => city.id === saved.targetCityId) : undefined;
    if (saved?.status === 'playing' && savedCity) {
      setTargetCity(savedCity);
      setGuesses(saved.guesses);
      setStatus('playing');
      setDifficulty(saved.difficulty ?? getSettings().difficulty);
    } else {
      startNewUnlimitedGame();
    }
  }

  /**
   * Daily Archive day selection (Workstream 4.2). `day === dailyNumber` always routes to real
   * daily mode — there is exactly one representation of "today," never a duplicate archive
   * entry for it. Otherwise loads/saves via the archive map and switches to `mode: 'archive'`.
   * Archive plays never call recordDailyResult/recordUnlimitedResult (see handleSelectCity) —
   * this preserves streak/stats integrity exactly the way real Wordle-archive clones do it.
   */
  function handleSelectArchiveDay(day: number) {
    setIsArchiveModalOpen(false);
    setIsVictoryModalOpen(false);
    setNewlyUnlockedBadges([]);

    if (day === dailyNumber) {
      setMode('daily');
      setArchiveDayNumber(null);
      const dailyCity = getDailyTargetCity(cities, dailyNumber);
      const saved = getSavedDailyState(dailyNumber);
      const validSaved = saved?.targetCityId === dailyCity.id ? saved : null;
      setTargetCity(dailyCity);
      setGuesses(validSaved?.guesses ?? []);
      setStatus(validSaved?.status ?? 'playing');
      setDifficulty(validSaved?.difficulty ?? getSettings().difficulty);
      return;
    }

    const dayCity = getDailyTargetCity(cities, day);
    const saved = getArchiveState(day);
    const validSaved = saved?.targetCityId === dayCity.id ? saved : null;
    setMode('archive');
    setArchiveDayNumber(day);
    setTargetCity(dayCity);
    setGuesses(validSaved?.guesses ?? []);
    setStatus(validSaved?.status ?? 'playing');
    setDifficulty(validSaved?.difficulty ?? getSettings().difficulty);
  }

  // Changing difficulty mid-game would desync already-unlocked clues, so the toggle only
  // affects the *next* fresh game — locked while the active game has guesses in progress.
  function handleToggleDifficulty() {
    if (status === 'playing' && guesses.length > 0) return;
    const next: Difficulty = difficulty === 'hard' ? 'standard' : 'hard';
    setDifficulty(next);
    // Preserve the existing livesMode setting — this toggle only changes difficulty.
    saveSettings({ ...getSettings(), difficulty: next });
  }

  function handleChangeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    try {
      localStorage.setItem('cityle_locale', nextLocale);
    } catch {
      // The selected language still applies for this session.
    }
  }

  function handleSelectCity(city: City) {
    if (status !== 'playing' || guesses.length >= MAX_GUESSES) return;

    const result = evaluateGuess(city, targetCity, guesses.length + 1);
    const updatedGuesses = [...guesses, result];
    const nextStatus: GameStatus = result.isCorrect
      ? 'won'
      : updatedGuesses.length === MAX_GUESSES
        ? 'lost'
        : 'playing';

    setGuesses(updatedGuesses);
    setStatus(nextStatus);

    const activeDailyNumber = mode === 'archive' ? archiveDayNumber ?? dailyNumber : dailyNumber;

    const gameState: GameState = {
      mode,
      // Challenge has no daily cadence, same as unlimited — 0 is a deliberate sentinel, not a
      // real day number.
      dailyNumber: mode === 'unlimited' || mode === 'challenge' ? 0 : activeDailyNumber,
      targetCityId: targetCity.id,
      guesses: updatedGuesses,
      status: nextStatus,
      maxGuesses: MAX_GUESSES,
      difficulty,
      ...(nextStatus !== 'playing' ? { completedAt: new Date().toISOString() } : {}),
    };

    if (mode === 'daily') saveDailyState(gameState);
    else if (mode === 'unlimited') saveUnlimitedState(gameState);
    else if (mode === 'challenge') saveChallengeState(gameState);
    else saveArchiveState(gameState);

    if (nextStatus !== 'playing') {
      setIsVictoryModalOpen(true);

      // Fires once per finished game across all 4 modes (daily/unlimited/archive/challenge) —
      // livesMode is read straight from settings regardless of whether it's wired into the
      // guess-loss-ends-game logic yet, per Workstream D's analytics spec.
      track('game_completed', {
        mode,
        difficulty,
        livesMode: getSettings().livesMode,
        won: result.isCorrect,
        guessCount: updatedGuesses.length,
      });

      let latestStats = stats;
      // Product rule, easy to conflate with the achievements rule just below: streak/stats
      // recording is daily-only, "today for real" — archive replays AND challenge completions
      // (Workstream J) both deliberately never call recordDailyResult/recordUnlimitedResult,
      // whereas achievements count every mode, including archive and challenge (see below).
      if (mode === 'daily') {
        // Capture the streak BEFORE recordDailyResult resets it on a loss —
        // VictoryModal's streak-aware loss subline needs the pre-reset value.
        setStreakBeforeLoss(!result.isCorrect ? stats.currentStreak : 0);
        latestStats = recordDailyResult(result.isCorrect, updatedGuesses.length, new Date().toISOString().slice(0, 10));
        setStats(latestStats);
      } else if (mode === 'unlimited') {
        latestStats = recordUnlimitedResult(result.isCorrect, updatedGuesses.length);
        setStats(latestStats);
      }

      // Achievements evaluate for every completed game across all four modes (daily, unlimited,
      // archive, AND challenge) — they measure lifetime exploration, unlike the streak/stats
      // rule above which is today-only.
      const { next: nextAchievements, newlyUnlocked } = evaluateAchievements(achievements, {
        won: result.isCorrect,
        guessCount: updatedGuesses.length,
        targetCity,
        difficulty,
        stats: latestStats,
      });
      setAchievements(nextAchievements);
      saveAchievementsState(nextAchievements);
      setNewlyUnlockedBadges(newlyUnlocked);
    } else {
      setNewlyUnlockedBadges([]);
    }
  }

  const guessedIds = useMemo(() => guesses.map((guess) => guess.city.id), [guesses]);
  const isDifficultyLocked = status === 'playing' && guesses.length > 0;
  const activeDailyNumber = mode === 'archive' ? archiveDayNumber ?? dailyNumber : dailyNumber;
  const unlockedClueCount = useMemo(
    () => Object.values(getUnlockedClues(guesses.length, difficulty)).filter(Boolean).length,
    [guesses.length, difficulty]
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <Header
        mode={mode}
        dailyNumber={dailyNumber}
        onToggleMode={handleToggleMode}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenArchive={() => setIsArchiveModalOpen(true)}
        onNewUnlimitedGame={startNewUnlimitedGame}
        stats={stats}
        difficulty={difficulty}
        onToggleDifficulty={handleToggleDifficulty}
        difficultyLocked={isDifficultyLocked}
        locale={locale}
        onChangeLocale={handleChangeLocale}
        t={t}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
        <MissionBriefing t={t} />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-5">
          <aside className="order-1 flex flex-col gap-3 md:order-2 md:col-span-5 md:sticky md:top-20">
            <section aria-labelledby="guess-heading" className="nothing-widget p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 id="guess-heading" className="stamp text-[0.7rem] text-[#FFB238]">
                  {t.submitGuess} · {t.guessesLeft.replace('{n}', String(MAX_GUESSES - guesses.length))}
                </h2>
                {status !== 'playing' && (
                  <button onClick={() => setIsVictoryModalOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D67E] hover:text-[#F4F6F8]">
                    <Trophy className="h-3.5 w-3.5" /> {t.viewResults}
                  </button>
                )}
              </div>
              <SearchInput
                cities={cities}
                onSelectCity={handleSelectCity}
                disabled={status !== 'playing'}
                alreadyGuessedIds={guessedIds}
                t={t}
              />
              <p className="mt-2 text-xs leading-relaxed text-[#8f9dac]">
                {t.bothModesPoolDesc.replace('{count}', String(cities.length))}
              </p>
            </section>

            <ComparisonMatrix guesses={guesses} maxGuesses={MAX_GUESSES} t={t} />

            {guesses.length > 0 && (
              <details className="nothing-widget group p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-[#c5ced7]">
                  <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4 text-[#3FD17C]" /> {t.guessMap}</span>
                  <span className="text-[#3FD17C] group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3">
                  <RobinsonMap guesses={guesses} targetCity={targetCity} isGameOver={status !== 'playing'} t={t} />
                </div>
              </details>
            )}
          </aside>

          <section className="order-2 flex flex-col gap-2 md:order-1 md:col-span-7" aria-labelledby="dossier-heading">
            <div className="flex items-center justify-between px-1">
              <h2 id="dossier-heading" className="stamp text-[0.7rem] font-bold text-[#3FD17C]">
                {t.urbanDossier}
              </h2>
              <span className="text-xs text-[#8f9dac]">{t.cluesFraction} {unlockedClueCount}/6</span>
            </div>
            <Dossier city={targetCity} guessCount={guesses.length} difficulty={difficulty} t={t} locale={locale} />
          </section>
        </div>
      </main>

      <footer className="mt-6 border-t border-white/10 bg-[#0A0C10] py-5 text-xs text-[#8f9dac]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <span>{t.footerTagline}</span>
          <button onClick={() => setIsHelpModalOpen(true)} className="inline-flex items-center gap-1.5 text-[#c5ced7] underline underline-offset-4 hover:text-white">
            <Database className="h-3.5 w-3.5" /> {t.methodologySources}
          </button>
        </div>
      </footer>

      <VictoryModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        targetCity={targetCity}
        guesses={guesses}
        won={status === 'won'}
        mode={mode}
        dailyNumber={activeDailyNumber}
        onPlayNextUnlimited={startNewUnlimitedGame}
        newlyUnlockedBadges={newlyUnlockedBadges}
        streakBeforeLoss={streakBeforeLoss}
        t={t}
      />
      <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={stats} achievements={achievements} mode={mode} t={t} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} t={t} />
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        cities={cities}
        currentDailyNumber={dailyNumber}
        onSelectDay={handleSelectArchiveDay}
        t={t}
      />
    </div>
  );
}
