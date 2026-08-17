import { City } from './types';

/**
 * Sixty-Second Cityle (Phase 7, Workstream MM): a fast, session-based
 * "which city has the highest/lowest X" quiz. Deliberately pure — no DOM,
 * timer, or storage access here, that all lives in the page component
 * (src/app/quickfire/page.tsx). Field *labels* are intentionally plain
 * English defaults, not i18n-aware — the page component maps `field.key`
 * to a translated label via `Translations`, the same separation gameLogic.ts
 * keeps from i18n.ts everywhere else in this app.
 */

export type QuickfireFieldKey =
  | 'population_metro'
  | 'pm25_annual_ugm3'
  | 'elevation_m'
  | 'temp_mean_annual_c'
  | 'tree_canopy_pct'
  | 'transit_active_share_pct'
  | 'equator_distance';

export interface QuickfireField {
  key: QuickfireFieldKey;
  /** Plain-English default label, used as a fallback and in tests. */
  label: string;
  unit?: string;
  /** Always a plain number so higher/lower comparisons are unambiguous. */
  getValue: (city: City) => number;
}

/**
 * Curated whitelist of "fun, at-a-glance" comparative fields — every one of
 * these is legible from a quick glance at 4 city names/flags without needing
 * extra context to interpret (unlike, say, gini_tier or coastal_flood_risk,
 * which need a labeled scale to mean anything). `equator_distance` is
 * derived (not a raw City field): Math.abs(lat), where a *lower* value means
 * *closer* to the equator.
 */
export const QUICKFIRE_FIELDS: QuickfireField[] = [
  {
    key: 'population_metro',
    label: 'metro population',
    unit: 'people',
    getValue: (city) => city.population_metro,
  },
  {
    key: 'pm25_annual_ugm3',
    label: 'annual PM2.5 pollution',
    unit: 'µg/m³',
    getValue: (city) => city.pm25_annual_ugm3,
  },
  {
    key: 'elevation_m',
    label: 'elevation',
    unit: 'm',
    getValue: (city) => city.elevation_m,
  },
  {
    key: 'temp_mean_annual_c',
    label: 'average annual temperature',
    unit: '°C',
    getValue: (city) => city.temp_mean_annual_c,
  },
  {
    key: 'tree_canopy_pct',
    label: 'tree canopy cover',
    unit: '%',
    getValue: (city) => city.tree_canopy_pct,
  },
  {
    key: 'transit_active_share_pct',
    label: 'transit & active-travel commuting share',
    unit: '%',
    getValue: (city) => city.transit_active_share_pct,
  },
  {
    key: 'equator_distance',
    label: 'distance from the equator',
    unit: '° latitude',
    getValue: (city) => Math.abs(city.lat),
  },
];

export interface QuickfireQuestion {
  /** Exactly 4 distinct cities, in randomized order. */
  cities: City[];
  field: QuickfireField;
  /** true = "which is highest" framing, false = "which is lowest". */
  higherIsAnswer: boolean;
  /**
   * Ids of every city tied for the winning value, computed from real field
   * values (never hardcoded) — usually one city, but the real dataset has
   * frequent exact ties on these fields (e.g. several cities share
   * elevation_m === 5), so more than one id can legitimately be correct.
   */
  correctCityIds: string[];
}

const QUESTION_CITY_COUNT = 4;

/**
 * Partial Fisher-Yates selection using an injectable RNG (defaults to
 * Math.random) so tests can pass a seeded generator for deterministic
 * assertions — mirrors the shuffle-with-injectable-randomness shape already
 * used by gameLogic.ts/marathonLogic.ts, just without the day-locked seeding
 * since Quickfire is a freely-repeatable session, not a shared daily puzzle.
 *
 * Unlike a full shuffle, this only performs `count` swap steps: for
 * i = 0..count-1, swap element i with a uniformly random element from
 * i..n-1, then return the first `count` elements. That still yields a
 * uniform, unbiased sample of `count` distinct items (it's the standard
 * partial Fisher-Yates / selection-sampling proof: after i swaps the first i
 * slots hold a uniform random permutation of i items drawn from the whole
 * pool), but does O(count) work and exactly `count` rng() calls instead of
 * O(n) work and n-1 calls. That matters here because every call only ever
 * needs 4 cities out of a pool that can hold up to 255 — a 60-second timed
 * mode calling this repeatedly was doing up to ~64x more shuffle work than
 * necessary. Callers must ensure items.length >= count.
 */
function pickRandomItems<T>(items: T[], count: number, rng: () => number): T[] {
  const pool = [...items];
  for (let index = 0; index < count; index += 1) {
    const swapIndex = index + Math.floor(rng() * (pool.length - index));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count);
}

/**
 * Picks 4 distinct random cities and one random field from the whitelist,
 * then computes the actual correct answer by comparing real field values
 * (never hardcoded). Pass a seeded `rng` (returning [0, 1)) for deterministic
 * tests; production callers can omit it and get Math.random.
 */
export function generateQuestion(cities: City[], rng: () => number = Math.random): QuickfireQuestion {
  if (cities.length < QUESTION_CITY_COUNT) {
    throw new Error(`generateQuestion needs at least ${QUESTION_CITY_COUNT} cities, got ${cities.length}`);
  }

  const roundCities = pickRandomItems(cities, QUESTION_CITY_COUNT, rng);
  const field = QUICKFIRE_FIELDS[Math.floor(rng() * QUICKFIRE_FIELDS.length)];
  const higherIsAnswer = rng() < 0.5;

  // Collect every city tied for the winning value, not just the first one
  // encountered — the real dataset has frequent exact ties on these fields
  // (e.g. 9 cities share elevation_m === 5), and picking only the
  // shuffle-order winner would mark an equally-correct tap as wrong.
  let correctCities = [roundCities[0]];
  let correctValue = field.getValue(roundCities[0]);
  for (const city of roundCities.slice(1)) {
    const value = field.getValue(city);
    const isBetter = higherIsAnswer ? value > correctValue : value < correctValue;
    const isTie = value === correctValue;
    if (isBetter) {
      correctCities = [city];
      correctValue = value;
    } else if (isTie) {
      correctCities.push(city);
    }
  }

  return {
    cities: roundCities,
    field,
    higherIsAnswer,
    correctCityIds: correctCities.map((city) => city.id),
  };
}
