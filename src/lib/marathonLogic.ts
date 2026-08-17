import { getDailyGameNumber } from './gameLogic';
import { City, GuessResult, MarathonState } from './types';

/**
 * Marathon resets on the same UTC day as Daily mode, so this delegates
 * directly to the existing epoch/day-boundary logic in gameLogic.ts rather
 * than duplicating it.
 */
export function getMarathonNumber(date: Date = new Date()): number {
  return getDailyGameNumber(date);
}

/**
 * Mulberry32-style PRNG, duplicated from the (unexported) `seededRandom` in
 * gameLogic.ts — kept local since gameLogic.ts doesn't export it.
 */
function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Distinct multiplier/offset from getDailyTargetCity's seed formula
// (`cycle * 7919 + 42`) in gameLogic.ts, so a given day's Marathon sequence
// isn't just a prefix of that same day's Daily rotation. Both large,
// unrelated constants relative to Daily's.
const MARATHON_SEED_MULTIPLIER = 1_000_003;
const MARATHON_SEED_OFFSET = 424_242;

/**
 * Deterministic seeded shuffle picking `count` distinct cities for a given
 * marathon number — every player sees the same sequence on the same day.
 * Mirrors getDailyTargetCity's Fisher-Yates + mulberry32 pattern, but with
 * an independent seed (see MARATHON_SEED_* above) so it doesn't just
 * reproduce a prefix of that day's Daily shuffle.
 */
export function getMarathonCities(
  marathonNumber: number,
  cities: City[],
  count: number = 5
): City[] {
  if (!cities.length) throw new Error('City dataset is empty');
  const safeCount = Math.min(Math.max(1, Math.floor(count)), cities.length);
  const shuffled = [...cities];
  let seed = Math.floor(marathonNumber) * MARATHON_SEED_MULTIPLIER + MARATHON_SEED_OFFSET;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed += 1;
    const swapIndex = Math.floor(seededRandom(seed) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, safeCount);
}

/** Max guesses per round (mirrors GameState.maxGuesses' default of 6). */
export const MARATHON_MAX_GUESSES_PER_ROUND = 6;

/**
 * Penalty applied to a round's score when it wasn't solved
 * (maxGuesses + 1) — always worse than any real guess count.
 */
export const MARATHON_UNSOLVED_PENALTY = MARATHON_MAX_GUESSES_PER_ROUND + 1;

/**
 * Sum of guessesUsed across all rounds; any round where `won` is false
 * contributes MARATHON_UNSOLVED_PENALTY (7) regardless of its actual
 * guessesUsed value, so an unsolved round is always scored worse than a
 * real 6-guess solve.
 */
export function computeMarathonScore(roundResults: MarathonState['roundResults']): number {
  return roundResults.reduce(
    (total, round) => total + (round.won ? round.guessesUsed : MARATHON_UNSOLVED_PENALTY),
    0
  );
}

/**
 * Builds one emoji-summary row per round, approximating the same
 * closeness-based box logic generateShareText (gameLogic.ts) uses per guess
 * — continent/country match, exact population, exact PM2.5, Köppen
 * closeness — applied to the round's final guess, plus a solved/unsolved
 * marker. Not a literal re-export since generateShareText's per-row logic
 * isn't factored out as its own function in gameLogic.ts.
 */
function formatRoundRow(round: MarathonState['roundResults'][number]): string {
  const lastGuess: GuessResult | undefined = round.guesses[round.guesses.length - 1];

  if (round.won) {
    return `🟩🟩🟩🎯 SOLVED! (${round.guessesUsed}/${MARATHON_MAX_GUESSES_PER_ROUND})`;
  }

  if (!lastGuess) {
    return `⬛⬛⬛⬛ ❌ (0/${MARATHON_MAX_GUESSES_PER_ROUND})`;
  }

  const continentBox = lastGuess.continentMatch
    ? lastGuess.countryMatch
      ? '🟩'
      : '🟨'
    : '⬛';
  const popBox = lastGuess.populationComp.status === 'exact' ? '🟩' : '⬛';
  const pmBox = lastGuess.pm25Comp.status === 'exact' ? '🟩' : '⬛';
  const koppenBox =
    lastGuess.koppenComp.status === 'exact'
      ? '🟩'
      : lastGuess.koppenComp.status === 'same-subtype' ||
          lastGuess.koppenComp.status === 'same-group'
        ? '🟨'
        : '⬛';

  return `${continentBox}${popBox}${pmBox}${koppenBox} ❌ (${round.guessesUsed}/${MARATHON_MAX_GUESSES_PER_ROUND})`;
}

/**
 * Generates a shareable Wordle-like text summary for a completed marathon,
 * following the same title-line + emoji-rows + link pattern as
 * generateShareText (gameLogic.ts): a title line with the total score out
 * of `rounds * MARATHON_MAX_GUESSES_PER_ROUND`, one row per city round, then
 * the same closing link.
 */
export function generateMarathonShareText(
  marathonNumber: number,
  roundResults: MarathonState['roundResults']
): string {
  const score = computeMarathonScore(roundResults);
  // Worst-case per round is MARATHON_UNSOLVED_PENALTY (7), not
  // MARATHON_MAX_GUESSES_PER_ROUND (6) — using the latter here let an
  // all-losses run display a score higher than its own stated maximum
  // (e.g. "35/30"), which is self-contradictory in a "score/max" display.
  const maxScore = roundResults.length * MARATHON_UNSOLVED_PENALTY;
  const title = `🏙️ Cityle Marathon #${marathonNumber} — ${score}/${maxScore}`;

  const rows = roundResults.map(formatRoundRow);

  return `${title}\n\n${rows.join('\n')}\n\nhttps://cityle.app`;
}
