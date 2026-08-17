import { City } from './types';

/**
 * Climate Time Machine (Phase 7, Workstream II): builds a synthetic "2050"
 * version of `city` by substituting its own required 2050-projection fields
 * into the three fields evaluateGuess() actually reads for scoring —
 * `koppen_current`, `temp_mean_annual_c`, `precip_annual_mm` — while every
 * other field (population, PM2.5, elevation, transit, morphology, lat/lng,
 * etc.) is held exactly as the real city's current value, since the data
 * model has no projected-2050 counterpart for those.
 *
 * This is pure data substitution, NOT a new comparison/scoring path: the
 * object this returns is fed straight into the existing, already-tested
 * evaluateGuess(guessCity, targetCity, guessNumber) from gameLogic.ts, which
 * works completely unchanged against it. Deliberately keeps the same `id`
 * as the real city, so evaluateGuess's own `isCorrect` check
 * (`guessCity.id === targetCity.id`) still resolves correctly against the
 * real city the player is meant to identify.
 *
 * Does not mutate `city` — returns a new object.
 */
export function buildSyntheticFutureTarget(city: City): City {
  return {
    ...city,
    koppen_current: city.koppen_2050,
    temp_mean_annual_c: city.temp_mean_annual_c + city.temp_2050_anomaly_c,
    precip_annual_mm: city.precip_annual_mm * (1 + city.precip_2050_shift_pct / 100),
  };
}

/**
 * Picks a random real city from `cities` to be this round's Climate Time
 * Machine target (before the synthetic-future substitution above is
 * applied). Climate Time Machine is a freely repeatable practice mode, not
 * day-locked and not compared across players — unlike getDailyTargetCity's
 * deterministic per-day shuffle, a genuinely random pick each fresh round is
 * fine here, and arguably more fun for a practice mode.
 */
export function getRandomTimeMachineTarget(cities: City[]): City {
  if (!cities.length) throw new Error('City dataset is empty');
  return cities[Math.floor(Math.random() * cities.length)];
}
