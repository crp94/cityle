import { City } from './types';

/**
 * Test-only factory for a minimal-but-fully-valid City object. Not a
 * `*.test.ts` file itself (so vitest won't try to run it as a suite) — just
 * a shared helper the real test files import, kept in `src/lib` so it's
 * covered by the project's normal `tsc`/`eslint` passes like any other
 * source file.
 *
 * Field values are arbitrary but internally consistent (e.g. `group`
 * mirrors `code[0]`) since some game logic (koppen comparisons) reasons
 * about that relationship.
 */
export function makeCity(overrides: Partial<City> = {}): City {
  const base: City = {
    id: 'testville-xx',
    name: 'Testville',
    country: 'Testland',
    countryCode: 'XX',
    continent: 'Europe',
    lat: 40.0,
    lng: -3.0,
    elevation_m: 500,

    koppen_current: { code: 'Cfa', name: 'Humid Subtropical', group: 'C: Temperate' },
    koppen_2050: { code: 'Cfa', name: 'Humid Subtropical', group: 'C: Temperate' },
    temp_mean_annual_c: 15,
    temp_2050_anomaly_c: 2,
    precip_annual_mm: 600,
    precip_2050_shift_pct: -5,
    monthly_temps_c: [5, 6, 8, 11, 15, 19, 22, 22, 18, 13, 9, 6],
    monthly_precip_mm: [50, 45, 50, 55, 60, 50, 40, 40, 50, 60, 55, 50],

    pm25_annual_ugm3: 10,
    aqi_tier: 'Good',
    peak_smog_season: 'Winter',

    population_metro: 1_000_000,
    density_urban_pop_km2: 3000,
    gdp_per_capita_ppp: 30000,
    gini_tier: 'Moderate (0.30-0.40)',
    median_age: 40,

    transit_active_share_pct: 40,
    tree_canopy_pct: 20,

    uhi_index_c: 2,
    coastal_flood_risk: 'Low',
    water_stress_2050: 'Medium',

    urban_fact: 'A test city used for unit tests.',
    educational_debrief: 'A test city used for unit tests, in more detail.',

    morphology: {
      type: 'grid-sprawl',
      primaryWater: 'inland-dry',
      sprawlScaleKm: 30,
      seed: 1,
    },
  };

  return { ...base, ...overrides };
}

/** Builds `count` distinct synthetic cities with unique ids/coordinates. */
export function makeCities(count: number): City[] {
  return Array.from({ length: count }, (_, i) =>
    makeCity({
      id: `city-${i}`,
      name: `City ${i}`,
      lat: -80 + i * 3,
      lng: -170 + i * 5,
    })
  );
}
