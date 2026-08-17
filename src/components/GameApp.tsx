'use client';

import { useEffect, useMemo, useState } from 'react';
import { track } from '@vercel/analytics';
import { Database, Globe2, Trophy } from 'lucide-react';
import citiesData from '../data/curated-cities.json';
import { ComparisonMatrix } from './ComparisonMatrix';
import { CATEGORY_ORDER, Dossier, type ClueCategory } from './Dossier';
import { Header } from './Header';
import { ArchiveModal } from './Modals/ArchiveModal';
import { HelpModal } from './Modals/HelpModal';
import { StatsModal } from './Modals/StatsModal';
import { VictoryModal } from './Modals/VictoryModal';
import { WelcomeModal } from './Modals/WelcomeModal';
import { MissionBriefing } from './MissionBriefing';
import { RobinsonMap } from './RobinsonMap';
import { SearchInput } from './SearchInput';
import { createDefaultAchievementsState, evaluateAchievements } from '../lib/achievements';
import {
  evaluateGuess,
  getDailyGameNumber,
  getDailyTargetCity,
  getUnlockedClues,
  isDayAgnosticMode,
  LIVES_MODE_START_COUNT,
  shouldLoseLife,
} from '../lib/gameLogic';
import { getTranslation, Locale } from '../lib/i18n';
import {
  createDefaultStats,
  getAchievementsState,
  getArchiveState,
  getPlayerStats,
  getSavedChallengeState,
  getSavedDailyState,
  getSavedPhotoState,
  getSavedUnlimitedState,
  getSettings,
  hasSeenWelcome,
  markWelcomeSeen,
  recordDailyResult,
  recordUnlimitedResult,
  saveAchievementsState,
  saveArchiveState,
  saveChallengeState,
  saveDailyState,
  savePhotoState,
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

// Reconstructs the token-economy Set<ClueCategory> Dossier.tsx expects from
// the plain string[] GameState.unlockedClueCategories persists. Filters out
// anything that isn't a recognized ClueCategory (defensively — e.g. a saved
// value from a future app version, or corrupted localStorage) rather than
// trusting the persisted JSON blindly. Returns undefined when there's
// nothing to restore, so callers can pass that straight through as "no seed"
// (see Dossier's initialUnlockedCategories prop) rather than an empty Set,
// which would incorrectly override Dossier's own fresh-game default.
function toClueCategorySet(raw: string[] | undefined): Set<ClueCategory> | undefined {
  if (!raw) return undefined;
  const known = new Set<string>(CATEGORY_ORDER);
  return new Set(raw.filter((value): value is ClueCategory => known.has(value)));
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
  // Starts at the safe SSR-matching default and is corrected post-mount in the effect below (same
  // deferred pattern as locale/stats/achievements) — a real hydration-mismatch bug, previously
  // fixed by reading getSettings().difficulty synchronously here instead, since SSR has no
  // localStorage: the server always renders 'standard', but the client's first hydration pass
  // already has localStorage access, so a previously-saved 'hard' would render immediately and
  // diverge from the server-rendered HTML (React then discards and regenerates the whole tree,
  // the exact "Recoverable Error" Next.js's dev overlay flags). That synchronous-read fix was only
  // needed because Dossier.tsx's unlock state used to be keyed on city.id alone: a static
  // 'standard' default corrected a frame later left Hard Mode games permanently stuck with
  // Climate & Air pre-unlocked for the rest of that game. Dossier's key now also includes
  // difficulty/isPhotoMode (see Dossier.tsx), so it cleanly remounts when this corrects a frame
  // after mount — which is what makes the safe deferred pattern correct here again.
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  // Lives mode (GameSettings.livesMode in storage.ts): resolved once per fresh game exactly
  // like difficulty above, and re-resolved the same way whenever a fresh/resumed game is set
  // up elsewhere in this file (startNewUnlimitedGame, startNewPhotoGame, handleToggleMode,
  // handleSelectArchiveDay, and the mount-effect resume below) — never re-read mid-game.
  // undefined means Lives mode is off for this run, in which case the shouldLoseLife/decrement
  // logic in handleSelectCity is a no-op.
  const [livesRemaining, setLivesRemaining] = useState<number | undefined>(() =>
    getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined
  );
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  // Mirrors Dossier's "Choose Your Clue" token economy (GameState.
  // unlockedClueCategories/.bankedTokenCount) so it can be (a) threaded back
  // into Dossier as a resume seed and (b) folded into the next save call.
  // undefined means "no seed for the game currently on screen" — either a
  // genuinely fresh game (Dossier falls back to its own default) or an old
  // save from before this field existed (same fallback, for the same
  // reason). Updated via handleTokenStateChange (fired by Dossier itself)
  // and reset via resumeTokenEconomy below every time a fresh/resumed game
  // is set up elsewhere in this file — never derived any other way.
  const [tokenEconomy, setTokenEconomy] = useState<
    { unlockedCategories: Set<ClueCategory>; bankedTokenCount: number } | undefined
  >(undefined);
  // Bumped every time resumeTokenEconomy (below) resolves a fresh/resumed
  // token-economy baseline for the city currently on screen. Threaded to
  // Dossier as `resumeGeneration`, purely to force it to remount and pick up
  // the corresponding tokenEconomy seed above — see that prop's comment on
  // DossierProps for why this is needed on top of city.id/difficulty
  // already being part of Dossier's remount key.
  const [resumeGeneration, setResumeGeneration] = useState(0);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [stats, setStats] = useState<GameStats>(() => createDefaultStats());
  const [achievements, setAchievements] = useState(() => createDefaultAchievementsState());
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);
  // Daily streak as it stood immediately before a loss resets it to 0 —
  // captured here (before recordDailyResult runs) so VictoryModal's
  // streak-aware loss subline can still name the streak that just broke.
  const [streakBeforeLoss, setStreakBeforeLoss] = useState<number>(0);
  const t = useMemo(() => getTranslation(locale), [locale]);

  // Resolves tokenEconomy/resumeGeneration together for whichever game is
  // about to be shown — called from every place in this file that already
  // resolves guesses/difficulty/livesRemaining for a fresh-or-resumed game
  // (the mount effect's daily/challenge branches, handleToggleMode's three
  // branches, handleSelectArchiveDay's two branches, and startNewUnlimited/
  // PhotoGame). `saved` is whatever GameState that call site already
  // determined is the relevant one to resume from — null/undefined for a
  // fresh game, exactly like the `validSaved`/`saved`/`savedDaily`-style
  // variables those call sites already use for guesses/difficulty.
  function resumeTokenEconomy(saved: GameState | null | undefined) {
    setTokenEconomy(
      saved?.unlockedClueCategories
        ? {
            unlockedCategories: toClueCategorySet(saved.unlockedClueCategories) ?? new Set(),
            bankedTokenCount: saved.bankedTokenCount ?? 0,
          }
        : undefined
    );
    // Always bumped, even when nothing changed (e.g. a fresh game, or a
    // resumed game whose city.id/difficulty already differs and would force
    // a Dossier remount on its own) — one consistent mechanism is simpler
    // to reason about than trying to predict exactly when it's redundant,
    // and a redundant remount here is harmless (see DossierProps' comment).
    setResumeGeneration((generation) => generation + 1);
  }

  useEffect(() => {
    // dailyNumber/targetCity are already correct from lazy initial state (no flash to fix here) —
    // this effect restores what genuinely requires localStorage: locale, stats, achievements,
    // difficulty (see the safe-default comment on its useState above), and any in-progress daily
    // (or, in challenge mode, challenge) save (which may carry its own difficulty, set when that
    // game's first guess was made — see the branches below). Deferred one frame (matching the
    // app's existing localStorage-restore timing) so the batch of setState calls below doesn't
    // fire synchronously within the effect body.
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
          setLivesRemaining(
            savedChallenge.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
          );
          resumeTokenEconomy(savedChallenge);
        } else {
          // No in-progress save for this challenge's target city — still a fresh game, but
          // `difficulty`'s initial state is a hardcoded SSR-safe default (see its useState above),
          // not the player's real saved preference, so it needs the same correction a resumed
          // game gets above.
          setDifficulty(getSettings().difficulty);
          setLivesRemaining(getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined);
          resumeTokenEconomy(null);
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
        setLivesRemaining(
          savedDaily.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
        );
        resumeTokenEconomy(savedDaily);
      } else {
        // No in-progress save for today's puzzle — still a fresh game, but `difficulty`/
        // `livesRemaining`'s initial state is a hardcoded SSR-safe default, not the player's real
        // saved preference (see the useState comments above), so it needs the same correction a
        // resumed game gets above.
        setDifficulty(getSettings().difficulty);
        setLivesRemaining(getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined);
        resumeTokenEconomy(null);
      }
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-run onboarding (Phase 5, Workstream BB). Marks the flag the moment
  // the modal is shown, not on dismiss — so a player who closes the tab or
  // navigates away mid-modal never sees it re-trigger on a later visit.
  // Deferred via requestAnimationFrame, matching the mount effect above —
  // calling setState synchronously in the effect body trips the
  // react-hooks/set-state-in-effect lint rule.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!hasSeenWelcome()) {
        setIsWelcomeModalOpen(true);
        markWelcomeSeen();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function startNewUnlimitedGame() {
    const nextCity = randomCity(targetCity.id);
    const nextDifficulty = getSettings().difficulty;
    const nextLivesRemaining = getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined;
    setTargetCity(nextCity);
    setGuesses([]);
    setStatus('playing');
    setDifficulty(nextDifficulty);
    setLivesRemaining(nextLivesRemaining);
    setIsVictoryModalOpen(false);
    setNewlyUnlockedBadges([]);
    // A brand-new game's token economy is exactly Dossier's own fresh-game
    // default — nothing to seed, and nothing stale from the previous game
    // should leak into this one (targetCity's change already forces a
    // Dossier remount, but tokenEconomy itself must still be reset, since
    // it's not re-derived from city.id).
    resumeTokenEconomy(null);
    saveUnlimitedState({
      mode: 'unlimited',
      dailyNumber: 0,
      targetCityId: nextCity.id,
      guesses: [],
      status: 'playing',
      maxGuesses: MAX_GUESSES,
      difficulty: nextDifficulty,
      livesRemaining: nextLivesRemaining,
    });
  }

  // Photo mode (Workstream V): same free-repeat/random-city cadence as
  // Unlimited above — mirrors startNewUnlimitedGame byte-for-byte, just
  // swapping in the single-slot getSavedPhotoState/savePhotoState pair.
  function startNewPhotoGame() {
    const nextCity = randomCity(targetCity.id);
    const nextDifficulty = getSettings().difficulty;
    const nextLivesRemaining = getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined;
    setTargetCity(nextCity);
    setGuesses([]);
    setStatus('playing');
    setDifficulty(nextDifficulty);
    setLivesRemaining(nextLivesRemaining);
    setIsVictoryModalOpen(false);
    setNewlyUnlockedBadges([]);
    // See the matching call in startNewUnlimitedGame above.
    resumeTokenEconomy(null);
    savePhotoState({
      mode: 'photo',
      dailyNumber: 0,
      targetCityId: nextCity.id,
      guesses: [],
      status: 'playing',
      maxGuesses: MAX_GUESSES,
      difficulty: nextDifficulty,
      livesRemaining: nextLivesRemaining,
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
      setLivesRemaining(
        validSaved?.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
      );
      resumeTokenEconomy(validSaved);
      return;
    }

    if (nextMode === 'photo') {
      const savedPhoto = getSavedPhotoState();
      const savedPhotoCity = savedPhoto
        ? cities.find((city) => city.id === savedPhoto.targetCityId)
        : undefined;
      if (savedPhoto?.status === 'playing' && savedPhotoCity) {
        setTargetCity(savedPhotoCity);
        setGuesses(savedPhoto.guesses);
        setStatus('playing');
        setDifficulty(savedPhoto.difficulty ?? getSettings().difficulty);
        setLivesRemaining(
          savedPhoto.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
        );
        resumeTokenEconomy(savedPhoto);
      } else {
        startNewPhotoGame();
      }
      return;
    }

    const saved = getSavedUnlimitedState();
    const savedCity = saved ? cities.find((city) => city.id === saved.targetCityId) : undefined;
    if (saved?.status === 'playing' && savedCity) {
      setTargetCity(savedCity);
      setGuesses(saved.guesses);
      setStatus('playing');
      setDifficulty(saved.difficulty ?? getSettings().difficulty);
      setLivesRemaining(
        saved.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
      );
      resumeTokenEconomy(saved);
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
      setLivesRemaining(
        validSaved?.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
      );
      resumeTokenEconomy(validSaved);
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
    setLivesRemaining(
      validSaved?.livesRemaining ?? (getSettings().livesMode ? LIVES_MODE_START_COUNT : undefined)
    );
    resumeTokenEconomy(validSaved);
  }

  // Changing difficulty mid-game would desync already-unlocked clues, so the toggle only
  // affects the *next* fresh game — locked while the active game has guesses in progress.
  function handleToggleDifficulty() {
    if (status === 'playing' && guesses.length > 0) return;
    const next: Difficulty = difficulty === 'hard' ? 'standard' : 'hard';
    setDifficulty(next);
    // Preserve the existing livesMode setting — this toggle only changes difficulty.
    saveSettings({ ...getSettings(), difficulty: next });
    // The guard above guarantees zero guesses have been made yet for the game currently on
    // screen, so there's nothing real to resume token-economy-wise — but `tokenEconomy` itself
    // still needs resetting here, not just left alone: Dossier's mount effect reports its
    // token-economy snapshot even at 0 guesses (see its onTokenStateChange comment), so
    // `tokenEconomy` is already populated with the OLD difficulty's fresh-game default (e.g.
    // Standard's free `climateAir`) by the time a player can even reach this toggle. Without
    // this reset, that stale seed would flow back into Dossier as `initialUnlockedCategories`
    // when the difficulty change remounts it, leaving Climate & Air incorrectly pre-unlocked
    // after switching to Hard Mode — the exact bug the resumeGeneration/key mechanism elsewhere
    // in this file exists to prevent, just reached through a different door (confirmed live: a
    // fresh game, toggled to Hard Mode, showed Climate & Air already unlocked before this fix).
    resumeTokenEconomy(null);
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

  /** The single-slot/keyed save function for whichever mode is currently active — used by both
   * handleSelectCity and handleTokenStateChange below so they persist to the same place. */
  function saveStateForMode(gameState: GameState): void {
    if (mode === 'daily') saveDailyState(gameState);
    else if (mode === 'unlimited') saveUnlimitedState(gameState);
    else if (mode === 'challenge') saveChallengeState(gameState);
    else if (mode === 'photo') savePhotoState(gameState);
    else saveArchiveState(gameState);
  }

  /** The read-side counterpart to saveStateForMode above — used only to recover an
   * already-recorded `completedAt` in handleTokenStateChange (see its comment). */
  function getSavedStateForMode(activeDailyNumber: number): GameState | null {
    if (mode === 'daily') return getSavedDailyState(dailyNumber);
    if (mode === 'unlimited') return getSavedUnlimitedState();
    if (mode === 'challenge') return getSavedChallengeState();
    if (mode === 'photo') return getSavedPhotoState();
    return getArchiveState(activeDailyNumber);
  }

  /**
   * Fired by Dossier whenever its token economy changes (a token spent, or a new one minted) —
   * see Dossier's onTokenStateChange prop. Mirrors the new state into `tokenEconomy` (so the next
   * render passes it back down as Dossier's resume seed, and so handleSelectCity's own save below
   * includes it) AND persists immediately here, rather than waiting for the next guess: a token
   * spend can happen with no further guess afterward (spend a token, then reload before guessing
   * again), so it can't simply piggyback on handleSelectCity's save the way it might seem to.
   */
  function handleTokenStateChange(state: { unlockedCategories: Set<ClueCategory>; bankedTokenCount: number }) {
    setTokenEconomy(state);

    // Dossier reports its token-economy snapshot even at mount (0 guesses) — see its
    // onTokenStateChange comment — but nothing genuinely spendable exists yet at that point
    // (mintedThroughGuess starts at 0, so no token can have been spent), and `unlockedCategories`
    // can only be whatever initialUnlocked(difficulty, isPhotoMode) already deterministically
    // produces. Skipping the save here isn't just an optimization: `difficulty`/`livesRemaining`
    // are themselves still corrected asynchronously (via the mount effect's own deferred
    // localStorage read, to avoid a hydration mismatch — see their useState comments), so a save
    // that fires from this callback before that correction lands would capture the wrong,
    // not-yet-corrected value into gameState.difficulty below — and because a resumed game's own
    // recorded difficulty deliberately takes precedence over the live settings default (see the
    // mount effect's resume branches), that one premature save would then wrongly win over the
    // player's real saved preference on every future load of this same game, not just this one.
    // Confirmed live: without this guard, loading fresh with Hard Mode already saved in settings
    // still showed Standard, because Dossier's initial callback beat the correction to disk.
    if (guesses.length === 0) return;

    const activeDailyNumber = mode === 'archive' ? archiveDayNumber ?? dailyNumber : dailyNumber;
    // Reuse whatever completedAt a finished game already recorded, rather than re-stamping a
    // fresh one: a player can still spend a leftover token after the game's already been won or
    // lost (nothing here disables the tab bar once status !== 'playing'), and this save call
    // fires for that too — stamping a NEW completedAt on every such spend would make a game look
    // like it finished later than it really did (e.g. skewing saveArchiveState's
    // oldest-completed-first eviction order).
    const existing = getSavedStateForMode(activeDailyNumber);
    const gameState: GameState = {
      mode,
      dailyNumber: isDayAgnosticMode(mode) ? 0 : activeDailyNumber,
      targetCityId: targetCity.id,
      guesses,
      status,
      maxGuesses: MAX_GUESSES,
      difficulty,
      livesRemaining,
      unlockedClueCategories: Array.from(state.unlockedCategories),
      bankedTokenCount: state.bankedTokenCount,
      ...(existing?.completedAt
        ? { completedAt: existing.completedAt }
        : status !== 'playing'
          ? { completedAt: new Date().toISOString() }
          : {}),
    };
    saveStateForMode(gameState);
  }

  function handleSelectCity(city: City) {
    if (status !== 'playing' || guesses.length >= MAX_GUESSES) return;

    const result = evaluateGuess(city, targetCity, guesses.length + 1);
    const updatedGuesses = [...guesses, result];

    // Lives mode: livesRemaining is only ever defined for a run that started with Lives mode on
    // (see the fresh-game initializers above) — a guess below LIVES_MODE_CLOSENESS_THRESHOLD
    // costs a life whenever that's the case. shouldLoseLife(100) is always false, so a correct
    // guess never costs a life here.
    const nextLivesRemaining =
      livesRemaining !== undefined && shouldLoseLife(result.closenessPct)
        ? livesRemaining - 1
        : livesRemaining;

    // Hitting 0 lives ends the game as an immediate loss, regardless of how many of the normal
    // MAX_GUESSES guesses remain — feeds the exact same loss branch a normal 6-guess loss
    // already uses below, so no parallel game-over path is needed.
    const nextStatus: GameStatus = result.isCorrect
      ? 'won'
      : nextLivesRemaining !== undefined && nextLivesRemaining <= 0
        ? 'lost'
        : updatedGuesses.length === MAX_GUESSES
          ? 'lost'
          : 'playing';

    setGuesses(updatedGuesses);
    setStatus(nextStatus);
    setLivesRemaining(nextLivesRemaining);

    const activeDailyNumber = mode === 'archive' ? archiveDayNumber ?? dailyNumber : dailyNumber;

    const gameState: GameState = {
      mode,
      // Challenge and Photo have no daily cadence, same as unlimited — 0 is a deliberate
      // sentinel, not a real day number.
      dailyNumber: isDayAgnosticMode(mode) ? 0 : activeDailyNumber,
      targetCityId: targetCity.id,
      guesses: updatedGuesses,
      status: nextStatus,
      maxGuesses: MAX_GUESSES,
      difficulty,
      livesRemaining: nextLivesRemaining,
      // Carries forward whatever token economy Dossier last reported (via tokenEconomy/
      // handleTokenStateChange above) — this guess's own save doesn't know about any token this
      // guess itself is about to mint (that arrives moments later, in the post-render effect
      // that calls handleTokenStateChange), but omitting these fields entirely here would
      // overwrite — not merge with — whatever was already persisted, silently erasing any
      // categories unlocked before this guess. handleTokenStateChange's own save (which follows
      // immediately once the new token is minted) reconciles the rest.
      ...(tokenEconomy
        ? {
            unlockedClueCategories: Array.from(tokenEconomy.unlockedCategories),
            bankedTokenCount: tokenEconomy.bankedTokenCount,
          }
        : {}),
      ...(nextStatus !== 'playing' ? { completedAt: new Date().toISOString() } : {}),
    };

    saveStateForMode(gameState);

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
  const isPhotoMode = mode === 'photo';
  const unlockedClueCount = useMemo(
    () => Object.values(getUnlockedClues(guesses.length, difficulty, isPhotoMode)).filter(Boolean).length,
    [guesses.length, difficulty, isPhotoMode]
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
        onNewPhotoGame={startNewPhotoGame}
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
            <Dossier
              city={targetCity}
              guessCount={guesses.length}
              difficulty={difficulty}
              isPhotoMode={isPhotoMode}
              t={t}
              locale={locale}
              initialUnlockedCategories={tokenEconomy?.unlockedCategories}
              initialBankedTokenCount={tokenEconomy?.bankedTokenCount}
              resumeGeneration={resumeGeneration}
              onTokenStateChange={handleTokenStateChange}
            />
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
        onPlayNextUnlimited={mode === 'photo' ? startNewPhotoGame : startNewUnlimitedGame}
        newlyUnlockedBadges={newlyUnlockedBadges}
        streakBeforeLoss={streakBeforeLoss}
        t={t}
      />
      <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={stats} achievements={achievements} mode={mode} t={t} />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        t={t}
      />
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        cities={cities}
        currentDailyNumber={dailyNumber}
        onSelectDay={handleSelectArchiveDay}
        t={t}
      />
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} t={t} />
    </div>
  );
}
