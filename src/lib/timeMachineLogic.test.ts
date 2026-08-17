import { describe, it, expect } from 'vitest';
import { buildSyntheticFutureTarget, getRandomTimeMachineTarget } from './timeMachineLogic';
import { evaluateGuess } from './gameLogic';
import { makeCity, makeCities } from './testFixtures';

describe('buildSyntheticFutureTarget', () => {
  it('substitutes koppen_current/temp_mean_annual_c/precip_annual_mm from the 2050 fields', () => {
    const city = makeCity({
      id: 'tokyo-jp',
      koppen_current: { code: 'Cfa', name: 'Humid Subtropical', group: 'C: Temperate' },
      koppen_2050: { code: 'Cfb', name: 'Oceanic (Maritime)', group: 'C: Temperate' },
      temp_mean_annual_c: 18.0,
      temp_2050_anomaly_c: 2.4,
      precip_annual_mm: 1000,
      precip_2050_shift_pct: -12,
    });

    const synthetic = buildSyntheticFutureTarget(city);

    expect(synthetic.koppen_current).toEqual(city.koppen_2050);
    expect(synthetic.temp_mean_annual_c).toBeCloseTo(20.4, 10);
    expect(synthetic.precip_annual_mm).toBeCloseTo(880, 10);
  });

  it('keeps the same id as the real city (so isCorrect still resolves against it)', () => {
    const city = makeCity({ id: 'lima-pe' });
    const synthetic = buildSyntheticFutureTarget(city);
    expect(synthetic.id).toBe(city.id);
  });

  it('holds every non-climate field exactly as the real city', () => {
    const city = makeCity({
      id: 'lagos-ng',
      population_metro: 15_000_000,
      pm25_annual_ugm3: 42,
      elevation_m: 41,
      transit_active_share_pct: 55,
      lat: 6.5,
      lng: 3.4,
    });
    const synthetic = buildSyntheticFutureTarget(city);

    expect(synthetic.population_metro).toBe(city.population_metro);
    expect(synthetic.pm25_annual_ugm3).toBe(city.pm25_annual_ugm3);
    expect(synthetic.elevation_m).toBe(city.elevation_m);
    expect(synthetic.transit_active_share_pct).toBe(city.transit_active_share_pct);
    expect(synthetic.lat).toBe(city.lat);
    expect(synthetic.lng).toBe(city.lng);
    expect(synthetic.morphology).toEqual(city.morphology);
  });

  it('does not mutate the input city', () => {
    const city = makeCity({
      koppen_current: { code: 'Cfa', name: 'Humid Subtropical', group: 'C: Temperate' },
      koppen_2050: { code: 'BWh', name: 'Hot Desert', group: 'B: Arid' },
      temp_mean_annual_c: 10,
      temp_2050_anomaly_c: 3,
    });
    const before = JSON.parse(JSON.stringify(city));
    buildSyntheticFutureTarget(city);
    expect(city).toEqual(before);
  });

  it('feeds unchanged into evaluateGuess and scores an exact-Köppen match for a guess sharing the 2050 code', () => {
    const realTarget = makeCity({
      id: 'future-city',
      koppen_current: { code: 'Cfa', name: 'Humid Subtropical', group: 'C: Temperate' },
      koppen_2050: { code: 'BSk', name: 'Cold Semi-Arid', group: 'B: Arid' },
      temp_mean_annual_c: 12,
      temp_2050_anomaly_c: 4,
      precip_annual_mm: 500,
      precip_2050_shift_pct: 10,
    });
    const synthetic = buildSyntheticFutureTarget(realTarget);

    const guessCity = makeCity({
      id: 'guess-city',
      koppen_current: { code: 'BSk', name: 'Cold Semi-Arid', group: 'B: Arid' },
      temp_mean_annual_c: 16, // synthetic target's temp is 12 + 4 = 16, so this is an exact match
    });

    const result = evaluateGuess(guessCity, synthetic, 1);
    expect(result.koppenComp.status).toBe('exact');
    expect(result.koppenComp.target).toBe('BSk');
    expect(result.isCorrect).toBe(false); // right climate, wrong (real) city id

    // Guessing the real target city itself (same id, whatever its own
    // *current* climate fields happen to be) is still what wins — isCorrect
    // is an id match against the synthetic object, which deliberately kept
    // the real target's id.
    const winResult = evaluateGuess(realTarget, synthetic, 2);
    expect(winResult.isCorrect).toBe(true);
  });
});

describe('getRandomTimeMachineTarget', () => {
  it('always returns a city that is actually in the pool', () => {
    const cities = makeCities(10);
    for (let i = 0; i < 25; i += 1) {
      const picked = getRandomTimeMachineTarget(cities);
      expect(cities.some((c) => c.id === picked.id)).toBe(true);
    }
  });

  it('throws on an empty pool rather than silently returning undefined', () => {
    expect(() => getRandomTimeMachineTarget([])).toThrow();
  });
});
