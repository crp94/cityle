import { createDefaultAchievementsState, type AchievementsState } from './achievements';
import { getMarathonNumber } from './marathonLogic';
import { Difficulty, GameState, GameStats, GameStatus, MarathonState, UnlimitedStats } from './types';

const DAILY_STATE_KEY = 'cityle_daily_state_v1';
const UNLIMITED_STATE_KEY = 'cityle_unlimited_state_v1';
const CHALLENGE_STATE_KEY = 'cityle_challenge_state_v1';
const PHOTO_STATE_KEY = 'cityle_photo_state_v1';
const MARATHON_STATE_KEY = 'cityle_marathon_state_v1';
const STATS_KEY = 'cityle_player_stats_v1';
const ARCHIVE_STATE_KEY = 'cityle_archive_state_v1';
const SETTINGS_KEY = 'cityle_settings_v1';
const ACHIEVEMENTS_KEY = 'cityle_achievements_v1';

export function getSavedDailyState(dailyNumber: number): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY);
    if (!raw) return null;
    const state: GameState = JSON.parse(raw);
    if (state.dailyNumber === dailyNumber && state.mode === 'daily') {
      return state;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDailyState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save daily state to localStorage', err);
  }
}

export function getSavedUnlimitedState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(UNLIMITED_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUnlimitedState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UNLIMITED_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save unlimited state to localStorage', err);
  }
}

// Single-slot, mirroring getSavedUnlimitedState/saveUnlimitedState above —
// only one challenge is in progress at a time per browser (Workstream G,
// consumed by Workstream J's /challenge/[code] route).
export function getSavedChallengeState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CHALLENGE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveChallengeState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHALLENGE_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save challenge state to localStorage', err);
  }
}

// Single-slot, mirroring getSavedUnlimitedState/saveUnlimitedState above —
// Photo mode is a free-repeat cadence like Unlimited (random target each
// time), just a different clue texture, so it gets the same single-slot
// treatment rather than Daily's per-day keying (Workstream S, consumed by
// Workstream V's Photo-first mode).
export function getSavedPhotoState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PHOTO_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePhotoState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PHOTO_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save photo state to localStorage', err);
  }
}

// Single-slot, like getSavedUnlimitedState/saveUnlimitedState, but with a
// staleness check like getSavedDailyState's dailyNumber check above: a
// saved marathon in progress from a previous day (its marathonNumber no
// longer matches today's) is treated as stale and discarded rather than
// resumed, since that day's sequence (getMarathonCities) is keyed off the
// *current* marathon number (Workstream S, consumed by Workstream T's
// Marathon mode UI).
export function getSavedMarathonState(): MarathonState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MARATHON_STATE_KEY);
    if (!raw) return null;
    const state: MarathonState = JSON.parse(raw);
    if (state.marathonNumber === getMarathonNumber()) {
      return state;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveMarathonState(state: MarathonState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MARATHON_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save marathon state to localStorage', err);
  }
}

// --- Player stats (4.1) ---------------------------------------------------
//
// IMPORTANT: never return a shared, module-level object graph from any of
// these functions. Every call that can hand a GameStats/UnlimitedStats back
// to a caller must build a brand-new object (including nested objects like
// guessDistribution), so a caller mutating the returned value in place can
// never corrupt state for the rest of the session — this was the root cause
// of the original stats-mutation bug (a shared DEFAULT_STATS constant got
// mutated in place, and if localStorage.setItem then failed, every later
// call kept returning the now-dirty shared object).

function createDefaultGuessDistribution(): Record<number, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

export function createDefaultUnlimitedStats(): UnlimitedStats {
  return {
    played: 0,
    won: 0,
    guessDistribution: createDefaultGuessDistribution(),
    currentRun: 0,
    bestRun: 0,
  };
}

export function createDefaultStats(): GameStats {
  return {
    schemaVersion: 2,
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: createDefaultGuessDistribution(),
    unlimited: createDefaultUnlimitedStats(),
  };
}

function mergeGuessDistribution(raw: unknown): Record<number, number> {
  const base = createDefaultGuessDistribution();
  if (!raw || typeof raw !== 'object') return base;
  return { ...base, ...(raw as Record<number, number>) };
}

function migrateUnlimitedStats(raw: unknown): UnlimitedStats {
  const base = createDefaultUnlimitedStats();
  if (!raw || typeof raw !== 'object') return base;
  const src = raw as Partial<UnlimitedStats> & Record<string, unknown>;
  return {
    played: typeof src.played === 'number' ? src.played : base.played,
    won: typeof src.won === 'number' ? src.won : base.won,
    guessDistribution: mergeGuessDistribution(src.guessDistribution),
    currentRun: typeof src.currentRun === 'number' ? src.currentRun : base.currentRun,
    bestRun: typeof src.bestRun === 'number' ? src.bestRun : base.bestRun,
    bestGuessCount:
      typeof src.bestGuessCount === 'number' ? src.bestGuessCount : undefined,
  };
}

/**
 * Non-destructively merges any old-shape (v1, pre-schemaVersion) saved JSON
 * into the current GameStats shape. Every existing top-level field from the
 * old shape (played, won, currentStreak, maxStreak, guessDistribution,
 * lastPlayedDate) passes through untouched; `unlimited` is simply absent on
 * old saves and gets a fresh default (never a shared reference). No existing
 * player's streak or guess distribution is ever dropped, reset, or
 * corrupted by this migration.
 */
export function migrateStats(raw: unknown): GameStats {
  const base = createDefaultStats();
  if (!raw || typeof raw !== 'object') return base;
  const src = raw as Partial<GameStats> & Record<string, unknown>;

  return {
    schemaVersion: 2,
    played: typeof src.played === 'number' ? src.played : base.played,
    won: typeof src.won === 'number' ? src.won : base.won,
    currentStreak:
      typeof src.currentStreak === 'number' ? src.currentStreak : base.currentStreak,
    maxStreak: typeof src.maxStreak === 'number' ? src.maxStreak : base.maxStreak,
    guessDistribution: mergeGuessDistribution(src.guessDistribution),
    lastPlayedDate:
      typeof src.lastPlayedDate === 'string' ? src.lastPlayedDate : undefined,
    unlimited: migrateUnlimitedStats(src.unlimited),
  };
}

export function getPlayerStats(): GameStats {
  if (typeof window === 'undefined') return createDefaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return createDefaultStats();
    return migrateStats(JSON.parse(raw));
  } catch {
    return createDefaultStats();
  }
}

function persistStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save player stats', err);
  }
}

/**
 * Records the result of a completed Daily game. Renamed from the previous
 * recordGameResult — behavior is otherwise unchanged. Daily-only stats
 * (streak, lastPlayedDate) must only ever be updated for a real, same-day
 * Daily game — never for Archive replays (see achievements.ts for the
 * distinct rule that governs those).
 */
export function recordDailyResult(
  won: boolean,
  guessCount: number,
  todayStr: string
): GameStats {
  const stats = getPlayerStats();
  if (stats.lastPlayedDate === todayStr) {
    return stats; // Already recorded for today
  }

  const previousDate = new Date(`${todayStr}T00:00:00Z`);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  const expectedPreviousDay = previousDate.toISOString().slice(0, 10);
  const continuedStreak = stats.lastPlayedDate === expectedPreviousDay;

  stats.played += 1;
  stats.lastPlayedDate = todayStr;

  if (won) {
    stats.won += 1;
    stats.currentStreak = continuedStreak ? stats.currentStreak + 1 : 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  persistStats(stats);
  return stats;
}

/**
 * Records the result of a completed Unlimited game. Unlimited has no daily
 * cadence, so instead of a streak it tracks `currentRun` — consecutive wins
 * since the last loss — and `bestRun`, the best such run ever achieved.
 */
export function recordUnlimitedResult(won: boolean, guessCount: number): GameStats {
  const stats = getPlayerStats();

  stats.unlimited.played += 1;
  if (won) {
    stats.unlimited.won += 1;
    stats.unlimited.currentRun += 1;
    stats.unlimited.bestRun = Math.max(stats.unlimited.bestRun, stats.unlimited.currentRun);
    stats.unlimited.guessDistribution[guessCount] =
      (stats.unlimited.guessDistribution[guessCount] || 0) + 1;
    stats.unlimited.bestGuessCount = stats.unlimited.bestGuessCount
      ? Math.min(stats.unlimited.bestGuessCount, guessCount)
      : guessCount;
  } else {
    stats.unlimited.currentRun = 0;
  }

  persistStats(stats);
  return stats;
}

// --- Daily Archive (4.2) ---------------------------------------------------

function getArchiveStateMap(): Record<number, GameState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ARCHIVE_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getArchiveState(day: number): GameState | null {
  const map = getArchiveStateMap();
  return map[day] ?? null;
}

/** Cheap day -> status lookup for rendering the archive picker's badges. */
export function getArchiveCompletionMap(): Record<number, GameStatus> {
  const map = getArchiveStateMap();
  const result: Record<number, GameStatus> = {};
  for (const key of Object.keys(map)) {
    const day = Number(key);
    const state = map[day];
    if (state) result[day] = state.status;
  }
  return result;
}

function trySetArchiveMap(map: Record<number, GameState>): boolean {
  try {
    localStorage.setItem(ARCHIVE_STATE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves the full guess history for one archive day, keyed by dailyNumber.
 * On localStorage quota failure, evicts the single oldest completed
 * (non-'playing') entry by completedAt and retries once, then gives up
 * silently — this function must never throw.
 */
export function saveArchiveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    const map = getArchiveStateMap();
    map[state.dailyNumber] = state;

    if (trySetArchiveMap(map)) return;

    const completedEntries = Object.entries(map).filter(
      ([, s]) => s.status !== 'playing' && s.completedAt
    );
    if (completedEntries.length === 0) return;

    completedEntries.sort((a, b) => {
      const aTime = new Date(a[1].completedAt as string).getTime();
      const bTime = new Date(b[1].completedAt as string).getTime();
      return aTime - bTime;
    });
    const [oldestKey] = completedEntries[0];
    delete map[Number(oldestKey)];
    trySetArchiveMap(map);
  } catch (err) {
    console.error('Failed to save archive state to localStorage', err);
  }
}

// --- Settings / Hard Mode (4.4) --------------------------------------------

export interface GameSettings {
  difficulty: Difficulty;
  // Lives mode (an orthogonal extension of Hard Mode, not a separate
  // Difficulty value — surfaced in Header.tsx as "Hard Mode: 3 Lives").
  // Follows the exact same backward-compatible pattern as `difficulty`:
  // always present on the resolved GameSettings object (default false), but
  // tolerated as absent on raw JSON read from old saves. When true, a fresh
  // game should start with LIVES_MODE_START_COUNT lives
  // (GameState.livesRemaining, gameLogic.ts) and lose one whenever
  // shouldLoseLife() returns true for a guess; wiring that into actual
  // gameplay is a later integration step, not implemented here.
  livesMode: boolean;
}

function createDefaultSettings(): GameSettings {
  return { difficulty: 'standard', livesMode: false };
}

export function getSettings(): GameSettings {
  if (typeof window === 'undefined') return createDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return createDefaultSettings();
    const parsed = JSON.parse(raw);
    const difficulty: Difficulty = parsed?.difficulty === 'hard' ? 'hard' : 'standard';
    const livesMode: boolean = parsed?.livesMode === true;
    return { difficulty, livesMode };
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

// --- Achievements (4.5) -----------------------------------------------------

function sanitizeAchievementsState(raw: unknown): AchievementsState {
  const base = createDefaultAchievementsState();
  if (!raw || typeof raw !== 'object') return base;
  const src = raw as Partial<AchievementsState> & Record<string, unknown>;
  return {
    unlocked:
      src.unlocked && typeof src.unlocked === 'object'
        ? { ...(src.unlocked as Record<string, string>) }
        : base.unlocked,
    continentsWon: Array.isArray(src.continentsWon) ? [...src.continentsWon] : base.continentsWon,
    koppenGroupsWon: Array.isArray(src.koppenGroupsWon)
      ? [...src.koppenGroupsWon]
      : base.koppenGroupsWon,
  };
}

export function getAchievementsState(): AchievementsState {
  if (typeof window === 'undefined') return createDefaultAchievementsState();
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return createDefaultAchievementsState();
    return sanitizeAchievementsState(JSON.parse(raw));
  } catch {
    return createDefaultAchievementsState();
  }
}

export function saveAchievementsState(state: AchievementsState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save achievements state to localStorage', err);
  }
}
