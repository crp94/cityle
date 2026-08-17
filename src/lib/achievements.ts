import { City, Continent, Difficulty, GameStats } from './types';

export type AchievementId =
  | 'first-flight'
  | 'continental-hop'
  | 'climate-cartographer'
  | 'first-guess-ace'
  | 'streak-keeper'
  | 'marathoner'
  | 'deep-diver'
  | 'hard-mode-cartographer';

export const ACHIEVEMENT_IDS: AchievementId[] = [
  'first-flight',
  'continental-hop',
  'climate-cartographer',
  'first-guess-ace',
  'streak-keeper',
  'marathoner',
  'deep-diver',
  'hard-mode-cartographer',
];

export interface AchievementsState {
  unlocked: Record<string, string>; // achievement id -> ISO date first unlocked
  continentsWon: Continent[]; // dedup set of continents won at least once (any mode)
  koppenGroupsWon: string[]; // dedup set of Köppen group letters (A-E) won at least once
}

export function createDefaultAchievementsState(): AchievementsState {
  return {
    unlocked: {},
    continentsWon: [],
    koppenGroupsWon: [],
  };
}

export interface EvaluateAchievementsContext {
  won: boolean;
  guessCount: number;
  targetCity: City;
  difficulty: Difficulty;
  stats: GameStats;
}

export interface EvaluateAchievementsResult {
  next: AchievementsState;
  newlyUnlocked: string[];
}

const ALL_CONTINENTS: Continent[] = [
  'Europe',
  'Asia',
  'Africa',
  'North America',
  'South America',
  'Oceania',
];

const ALL_KOPPEN_GROUPS = ['A', 'B', 'C', 'D', 'E'];

function deriveKoppenGroupLetter(group: string): string | null {
  const match = /^([A-E])/.exec(group.trim());
  return match ? match[1] : null;
}

/**
 * Pure evaluator: computes the next AchievementsState plus which ids newly
 * unlocked as a result of one completed game. Does no localStorage I/O —
 * callers are responsible for persisting `next` via storage.ts.
 *
 * IMPORTANT — distinct from the Daily Archive rule (see gameLogic.ts /
 * page.tsx integration): stats/streaks are daily-only, "today for real," and
 * archive replays must NEVER feed recordDailyResult/recordUnlimitedResult.
 * Achievements are the opposite: they evaluate for EVERY completed game
 * across all three modes — daily, unlimited, AND archive. Achievements
 * measure lifetime exploration, so practice/archive plays legitimately count
 * toward them. Do not gate calls to evaluateAchievements on mode === 'daily'
 * the way stats recording is gated — that would silently under-count badges
 * for players who explore the archive.
 */
export function evaluateAchievements(
  prev: AchievementsState,
  ctx: EvaluateAchievementsContext
): EvaluateAchievementsResult {
  const { won, guessCount, targetCity, difficulty, stats } = ctx;

  const unlocked: Record<string, string> = { ...prev.unlocked };
  const continentsWon = new Set<Continent>(prev.continentsWon);
  const koppenGroupsWon = new Set<string>(prev.koppenGroupsWon);
  const newlyUnlocked: string[] = [];
  const now = new Date().toISOString();

  function unlock(id: AchievementId) {
    if (unlocked[id]) return;
    unlocked[id] = now;
    newlyUnlocked.push(id);
  }

  if (won) {
    unlock('first-flight');

    continentsWon.add(targetCity.continent);
    if (ALL_CONTINENTS.every((continent) => continentsWon.has(continent))) {
      unlock('continental-hop');
    }

    const group = deriveKoppenGroupLetter(targetCity.koppen_current.group);
    if (group) koppenGroupsWon.add(group);
    if (ALL_KOPPEN_GROUPS.every((groupLetter) => koppenGroupsWon.has(groupLetter))) {
      unlock('climate-cartographer');
    }

    if (guessCount === 1) unlock('first-guess-ace');
    if (guessCount === 6) unlock('deep-diver');
    if (difficulty === 'hard') unlock('hard-mode-cartographer');
  }

  if (stats.currentStreak >= 7) unlock('streak-keeper');
  if (stats.played + stats.unlimited.played >= 50) unlock('marathoner');

  return {
    next: {
      unlocked,
      continentsWon: Array.from(continentsWon),
      koppenGroupsWon: Array.from(koppenGroupsWon),
    },
    newlyUnlocked,
  };
}
