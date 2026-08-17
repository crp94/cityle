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
  /** The id of the city that actually wins the round, computed from real field values (never hardcoded). */
  correctCityId: string;
}

const QUESTION_CITY_COUNT = 4;

/**
 * Fisher-Yates shuffle using an injectable RNG (defaults to Math.random) so
 * tests can pass a seeded generator for deterministic assertions — mirrors
 * the shuffle-with-injectable-randomness shape already used by
 * gameLogic.ts/marathonLogic.ts, just without the day-locked seeding since
 * Quickfire is a freely-repeatable session, not a shared daily puzzle.
 */
function shuffle<T>(items: T[], rng: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
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

  const roundCities = shuffle(cities, rng).slice(0, QUESTION_CITY_COUNT);
  const field = QUICKFIRE_FIELDS[Math.floor(rng() * QUICKFIRE_FIELDS.length)];
  const higherIsAnswer = rng() < 0.5;

  let correctCity = roundCities[0];
  let correctValue = field.getValue(correctCity);
  for (const city of roundCities.slice(1)) {
    const value = field.getValue(city);
    const isBetter = higherIsAnswer ? value > correctValue : value < correctValue;
    if (isBetter) {
      correctCity = city;
      correctValue = value;
    }
  }

  return {
    cities: roundCities,
    field,
    higherIsAnswer,
    correctCityId: correctCity.id,
  };
}
