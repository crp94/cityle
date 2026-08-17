import {
  City,
  Difficulty,
  GameMode,
  GuessResult,
  MetricComparison,
  StatStatus,
} from './types';
import {
  calculateDistanceKm,
  calculateBearingDeg,
  getCompassDirection,
  calculateClosenessPct,
} from './geo';

/**
 * Returns the day number since project epoch (e.g. Aug 1, 2026).
 */
export function getDailyGameNumber(date: Date = new Date()): number {
  const epoch = new Date('2026-08-01T00:00:00Z').getTime();
  const now = date.getTime();
  const diffDays = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Inverse of getDailyGameNumber: returns the UTC date that a given daily
 * puzzle number was (or will be) played on, anchored to the same epoch
 * (2026-08-01T00:00:00Z).
 */
export function getDateForDailyNumber(dailyNumber: number): Date {
  const epoch = new Date('2026-08-01T00:00:00Z').getTime();
  const safeDay = Math.max(1, Math.floor(dailyNumber));
  return new Date(epoch + (safeDay - 1) * 24 * 60 * 60 * 1000);
}

/**
 * Returns the 1-indexed cycle number and 1-indexed position within that
 * cycle's shuffle for a given daily puzzle number, given the current pool
 * size. Mirrors the cycle/indexInCycle math in getDailyTargetCity below.
 */
export function getCycleInfo(
  dailyNumber: number,
  poolSize: number
): { cycle: number; position: number; poolSize: number } {
  const safeDay = Math.max(1, Math.floor(dailyNumber));
  const safePoolSize = Math.max(1, Math.floor(poolSize));
  const cycle = Math.floor((safeDay - 1) / safePoolSize) + 1;
  const position = ((safeDay - 1) % safePoolSize) + 1;
  return { cycle, position, poolSize: safePoolSize };
}

function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Picks from a deterministic shuffled cycle. Every city appears once before
 * the pool repeats, while each cycle uses a new order.
 */
export function getDailyTargetCity(cities: City[], dailyNumber: number): City {
  if (!cities.length) throw new Error('City dataset is empty');
  const safeDay = Math.max(1, Math.floor(dailyNumber));
  const cycle = Math.floor((safeDay - 1) / cities.length);
  const indexInCycle = (safeDay - 1) % cities.length;
  const shuffled = [...cities];
  let seed = cycle * 7919 + 42;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed += 1;
    const swapIndex = Math.floor(seededRandom(seed) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled[indexInCycle];
}

/**
 * Compares a numeric metric with a relative tolerance for exact/close classification.
 */
function compareNumeric(
  guessVal: number,
  targetVal: number,
  exactTolerancePct: number,
  label: string,
  unit: string = ''
): MetricComparison {
  const diff = guessVal - targetVal;
  const absDiffPct = Math.abs(diff) / Math.max(1, Math.abs(targetVal));

  let status: StatStatus;
  if (absDiffPct <= exactTolerancePct) {
    status = 'exact';
  } else if (guessVal < targetVal) {
    status = 'lower'; // Guess was lower than target, arrow goes UP
  } else {
    status = 'higher'; // Guess was higher than target, arrow goes DOWN
  }

  return {
    value: guessVal,
    targetValue: targetVal,
    status,
    label,
    deltaText: `${diff > 0 ? '+' : ''}${diff.toLocaleString()} ${unit}`,
  };
}

/**
 * Evaluates a user guess against the target city.
 */
export function evaluateGuess(
  guessCity: City,
  targetCity: City,
  guessNumber: number
): GuessResult {
  const isCorrect = guessCity.id === targetCity.id;

  const distanceKm = calculateDistanceKm(
    guessCity.lat,
    guessCity.lng,
    targetCity.lat,
    targetCity.lng
  );

  const bearingDeg = calculateBearingDeg(
    guessCity.lat,
    guessCity.lng,
    targetCity.lat,
    targetCity.lng
  );

  const { compass, arrow } = getCompassDirection(bearingDeg);
  const closenessPct = isCorrect ? 100 : calculateClosenessPct(distanceKm);

  // Population comparison (within 10% is exact — tightened from 15% so a
  // denser 256-city pool doesn't produce more coincidental "exact" matches)
  const populationComp = compareNumeric(
    guessCity.population_metro,
    targetCity.population_metro,
    0.1,
    'Metro Pop'
  );

  // PM2.5 comparison (within 20% is exact)
  const pm25Comp = compareNumeric(
    guessCity.pm25_annual_ugm3,
    targetCity.pm25_annual_ugm3,
    0.2,
    'PM2.5',
    'µg/m³'
  );

  // Mean Temperature comparison (within 1.5°C is exact)
  const tempDiff = guessCity.temp_mean_annual_c - targetCity.temp_mean_annual_c;
  let tempStatus: StatStatus;
  if (Math.abs(tempDiff) <= 1.5) {
    tempStatus = 'exact';
  } else if (guessCity.temp_mean_annual_c < targetCity.temp_mean_annual_c) {
    tempStatus = 'lower';
  } else {
    tempStatus = 'higher';
  }

  const tempComp: MetricComparison = {
    value: guessCity.temp_mean_annual_c,
    targetValue: targetCity.temp_mean_annual_c,
    status: tempStatus,
    label: 'Mean Temp',
    deltaText: `${tempDiff > 0 ? '+' : ''}${tempDiff.toFixed(1)}°C`,
  };

  // Köppen class comparison (4 tiers). 'same-subtype' sits between 'exact'
  // and 'same-group': the codes share both their first (group) and second
  // (moisture-pattern) letters and differ only in the third (heat/precip
  // intensity) letter — e.g. 'Cfa' vs 'Cfb'. 'same-group' now means only the
  // first letter/group matches (e.g. 'Csa' vs 'Cfa'). Priority order is
  // unchanged: exact > same-subtype > same-group > different.
  let koppenStatus: 'exact' | 'same-subtype' | 'same-group' | 'different';
  if (guessCity.koppen_current.code === targetCity.koppen_current.code) {
    koppenStatus = 'exact';
  } else if (
    guessCity.koppen_current.code[0] === targetCity.koppen_current.code[0] &&
    guessCity.koppen_current.code[1] === targetCity.koppen_current.code[1]
  ) {
    koppenStatus = 'same-subtype';
  } else if (
    guessCity.koppen_current.group === targetCity.koppen_current.group ||
    guessCity.koppen_current.code[0] === targetCity.koppen_current.code[0]
  ) {
    koppenStatus = 'same-group';
  } else {
    koppenStatus = 'different';
  }

  // Transit & active mobility comparison
  const transitComp = compareNumeric(
    guessCity.transit_active_share_pct,
    targetCity.transit_active_share_pct,
    0.15,
    'Transit %',
    '%'
  );

  // Elevation comparison. A pure percentage tolerance is backwards here: for
  // low-elevation coastal cities (many in the pool sit under ~15m) a 20%
  // window is only a few meters, while the same 20% window on a
  // high-altitude city is hundreds of meters. Use a hybrid absolute-floor-
  // or-percentage formula instead — exact within the greater of 15% of the
  // target elevation or an absolute 40m floor. Mirrors the
  // `Math.max(15, precip * 0.05)` hybrid pattern already used for rainfall
  // reconciliation in buildCuratedCities.ts.
  const elevationDiff = guessCity.elevation_m - targetCity.elevation_m;
  const elevationTolerance = Math.max(0.15 * Math.abs(targetCity.elevation_m), 40);
  let elevationStatus: StatStatus;
  if (Math.abs(elevationDiff) <= elevationTolerance) {
    elevationStatus = 'exact';
  } else if (guessCity.elevation_m < targetCity.elevation_m) {
    elevationStatus = 'lower';
  } else {
    elevationStatus = 'higher';
  }

  const elevationComp: MetricComparison = {
    value: guessCity.elevation_m,
    targetValue: targetCity.elevation_m,
    status: elevationStatus,
    label: 'Elevation',
    deltaText: `${elevationDiff > 0 ? '+' : ''}${elevationDiff.toLocaleString()} m`,
  };

  return {
    city: guessCity,
    guessNumber,
    isCorrect,
    distanceKm,
    bearingDeg,
    bearingCompass: compass,
    bearingArrow: arrow,
    closenessPct,
    countryMatch: guessCity.countryCode === targetCity.countryCode,
    continentMatch: guessCity.continent === targetCity.continent,
    populationComp,
    pm25Comp,
    tempComp,
    koppenComp: {
      guessed: guessCity.koppen_current.code,
      target: targetCity.koppen_current.code,
      status: koppenStatus,
    },
    transitComp,
    elevationComp,
  };
}

// --- Lives mode -------------------------------------------------------------
//
// An orthogonal extension of Hard Mode (toggled independently via
// GameSettings.livesMode in storage.ts, not a Difficulty value), surfaced in
// Header.tsx as "Hard Mode: 3 Lives" rather than a separate control. These
// are the pure logic pieces only — a fresh GameState.livesRemaining starts at
// LIVES_MODE_START_COUNT, and after each guess the caller (page.tsx or
// wherever the game-over flow lives) should call shouldLoseLife() with that
// guess's closenessPct and decrement livesRemaining when it returns true.
// Hitting 0 lives ends the game as an immediate loss, regardless of how many
// guesses remain, and should feed the existing recordDailyResult loss branch
// unchanged — no parallel stats system. None of this is wired into page.tsx
// or any UI here; that wiring is a later integration step.

/** Lives mode: the number of lives a fresh game starts with. */
export const LIVES_MODE_START_COUNT = 3;

/**
 * Lives mode: the closenessPct threshold (a percentage, matching
 * GuessResult.closenessPct's 0-100 scale) below which a guess costs a life.
 */
export const LIVES_MODE_CLOSENESS_THRESHOLD = 40;

/**
 * Lives mode: pure predicate for whether a single guess costs a life — true
 * when its closenessPct falls below LIVES_MODE_CLOSENESS_THRESHOLD. No side
 * effects; the caller is responsible for decrementing
 * GameState.livesRemaining and ending the game when it reaches 0.
 */
export function shouldLoseLife(closenessPct: number): boolean {
  return closenessPct < LIVES_MODE_CLOSENESS_THRESHOLD;
}

/**
 * Returns which progressive clue levels are unlocked based on number of
 * guesses. In hard mode, every clue group — including the baseline
 * climate/air group that's normally always on — arrives one guess later.
 */
export function getUnlockedClues(guessCount: number, difficulty: Difficulty = 'standard') {
  const offset = difficulty === 'hard' ? 1 : 0;
  return {
    climateAndAir: difficulty === 'hard' ? guessCount >= 1 : true,
    demographicsAndEconomy: guessCount >= 1 + offset,
    mobilityAndForm: guessCount >= 2 + offset,
    climateProjections2050: guessCount >= 3 + offset,
    urbanSprawlMap: guessCount >= 4 + offset,
    urbanFact: guessCount >= 5 + offset,
  };
}

/**
 * Generates a shareable Wordle-like text summary for social media or clipboard.
 */
export function generateShareText(
  dailyNumber: number,
  guesses: GuessResult[],
  won: boolean,
  mode: GameMode = 'daily',
  maxGuesses: number = 6
): string {
  const scoreText = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  // Archive shares are tagged distinctly so a replayed-with-hindsight result
  // never looks like a genuine same-day share. Challenge shares (Workstream G)
  // get their own tag too, since they're neither a real daily result nor an
  // Unlimited run.
  const title =
    mode === 'daily'
      ? `🏙️ Cityle #${dailyNumber} ${scoreText}`
      : mode === 'archive'
        ? `🏙️ Cityle #${dailyNumber} (Archive) ${scoreText}`
        : mode === 'challenge'
          ? `🏙️ Cityle Challenge ${scoreText}`
          : `🏙️ Cityle Unlimited ${scoreText}`;

  const rows = guesses.map((g) => {
    if (g.isCorrect) return '🟩🟩🟩🎯 SOLVED!';

    const continentBox = g.continentMatch ? (g.countryMatch ? '🟩' : '🟨') : '⬛';
    const popBox = g.populationComp.status === 'exact' ? '🟩' : '⬛';
    const pmBox = g.pm25Comp.status === 'exact' ? '🟩' : '⬛';
    const koppenBox =
      g.koppenComp.status === 'exact'
        ? '🟩'
        : g.koppenComp.status === 'same-group'
        ? '🟨'
        : '⬛';

    return `${continentBox}${popBox}${pmBox}${koppenBox} 🧭 ${g.distanceKm.toLocaleString()}km ${g.bearingArrow}`;
  });

  return `${title}\n\n${rows.join('\n')}\n\nhttps://cityle.app`;
}
