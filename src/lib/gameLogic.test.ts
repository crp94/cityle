import { describe, it, expect } from 'vitest';
import {
  evaluateGuess,
  getDailyTargetCity,
  generateShareText,
  shouldLoseLife,
  LIVES_MODE_CLOSENESS_THRESHOLD,
} from './gameLogic';
import { makeCity, makeCities } from './testFixtures';
import { GameMode } from './types';

describe('evaluateGuess', () => {
  it('reports an exact match on every metric when guess === target', () => {
    const city = makeCity();
    const result = evaluateGuess(city, city, 1);

    expect(result.isCorrect).toBe(true);
    expect(result.distanceKm).toBe(0);
    expect(result.closenessPct).toBe(100);
    expect(result.countryMatch).toBe(true);
    expect(result.continentMatch).toBe(true);
    expect(result.populationComp.status).toBe('exact');
    expect(result.pm25Comp.status).toBe('exact');
    expect(result.tempComp.status).toBe('exact');
    expect(result.koppenComp.status).toBe('exact');
    expect(result.transitComp.status).toBe('exact');
    expect(result.elevationComp.status).toBe('exact');
  });

  describe('Köppen 4-tier comparison', () => {
    it('is "exact" when the codes are identical (different cities)', () => {
      const target = makeCity({
        id: 'target',
        koppen_current: { code: 'Cfa', name: 'x', group: 'C: Temperate' },
      });
      const guess = makeCity({
        id: 'guess',
        koppen_current: { code: 'Cfa', name: 'x', group: 'C: Temperate' },
      });
      expect(evaluateGuess(guess, target, 1).koppenComp.status).toBe('exact');
    });

    it('is "same-subtype" when the first two letters match but the third differs', () => {
      // Cfa vs Cfb: same group (C) and same moisture pattern (f), differ only
      // in the third (heat-severity) letter.
      const target = makeCity({
        id: 'target',
        koppen_current: { code: 'Cfb', name: 'x', group: 'C: Temperate' },
      });
      const guess = makeCity({
        id: 'guess',
        koppen_current: { code: 'Cfa', name: 'x', group: 'C: Temperate' },
      });
      expect(evaluateGuess(guess, target, 1).koppenComp.status).toBe('same-subtype');
    });

    it('is "same-group" when only the first letter matches', () => {
      // Csa vs Cfa: same group letter (C), different second letter (s vs f).
      const target = makeCity({
        id: 'target',
        koppen_current: { code: 'Cfa', name: 'x', group: 'C: Temperate' },
      });
      const guess = makeCity({
        id: 'guess',
        koppen_current: { code: 'Csa', name: 'x', group: 'C: Temperate' },
      });
      expect(evaluateGuess(guess, target, 1).koppenComp.status).toBe('same-group');
    });

    it('is "different" when neither the group letter nor the group string match', () => {
      const target = makeCity({
        id: 'target',
        koppen_current: { code: 'Dfb', name: 'x', group: 'D: Continental' },
      });
      const guess = makeCity({
        id: 'guess',
        koppen_current: { code: 'Cfa', name: 'x', group: 'C: Temperate' },
      });
      expect(evaluateGuess(guess, target, 1).koppenComp.status).toBe('different');
    });
  });

  describe('elevation hybrid tolerance: max(0.15 * target, 40m)', () => {
    it('uses the 40m floor for a low-elevation target (15% would be tiny)', () => {
      // target = 10m -> 15% = 1.5m, so the 40m floor governs.
      const target = makeCity({ id: 'target', elevation_m: 10 });

      const withinFloor = makeCity({ id: 'guess1', elevation_m: 10 + 40 }); // diff 40, boundary inclusive
      expect(evaluateGuess(withinFloor, target, 1).elevationComp.status).toBe('exact');

      const beyondFloor = makeCity({ id: 'guess2', elevation_m: 10 + 41 }); // diff 41
      expect(evaluateGuess(beyondFloor, target, 1).elevationComp.status).toBe('higher');
    });

    it('uses the 15% factor for a high-elevation target (40m floor would be tiny)', () => {
      // target = 1000m -> 15% = 150m, which dominates the 40m floor.
      const target = makeCity({ id: 'target', elevation_m: 1000 });

      const withinPct = makeCity({ id: 'guess1', elevation_m: 1000 + 150 }); // diff 150, boundary inclusive
      expect(evaluateGuess(withinPct, target, 1).elevationComp.status).toBe('exact');

      const beyondPct = makeCity({ id: 'guess2', elevation_m: 1000 + 151 }); // diff 151
      expect(evaluateGuess(beyondPct, target, 1).elevationComp.status).toBe('higher');

      const lowerBeyondPct = makeCity({ id: 'guess3', elevation_m: 1000 - 151 }); // diff -151
      expect(evaluateGuess(lowerBeyondPct, target, 1).elevationComp.status).toBe('lower');
    });
  });

  describe("population's 10% tolerance", () => {
    const target = makeCity({ id: 'target', population_metro: 1_000_000 });

    it('is exact at the 10% boundary', () => {
      const guess = makeCity({ id: 'guess', population_metro: 1_100_000 }); // +10%
      expect(evaluateGuess(guess, target, 1).populationComp.status).toBe('exact');
    });

    it('is not exact just beyond the 10% boundary', () => {
      const higher = makeCity({ id: 'guess-higher', population_metro: 1_150_000 }); // +15%
      expect(evaluateGuess(higher, target, 1).populationComp.status).toBe('higher');

      const lower = makeCity({ id: 'guess-lower', population_metro: 850_000 }); // -15%
      expect(evaluateGuess(lower, target, 1).populationComp.status).toBe('lower');
    });
  });

  describe("PM2.5's 20% tolerance", () => {
    const target = makeCity({ id: 'target', pm25_annual_ugm3: 10 });

    it('is exact at the 20% boundary', () => {
      const guess = makeCity({ id: 'guess', pm25_annual_ugm3: 12 }); // +20%
      expect(evaluateGuess(guess, target, 1).pm25Comp.status).toBe('exact');
    });

    it('is not exact just beyond the 20% boundary', () => {
      const guess = makeCity({ id: 'guess', pm25_annual_ugm3: 12.5 }); // +25%
      expect(evaluateGuess(guess, target, 1).pm25Comp.status).toBe('higher');
    });
  });
});

describe('getDailyTargetCity', () => {
  const cities = makeCities(6);

  it('is deterministic: the same dailyNumber always returns the same city', () => {
    const first = getDailyTargetCity(cities, 3);
    const second = getDailyTargetCity(cities, 3);
    expect(second.id).toBe(first.id);
  });

  it('every city appears exactly once across one full cycle', () => {
    const seenIds = new Set<string>();
    for (let dailyNumber = 1; dailyNumber <= cities.length; dailyNumber += 1) {
      seenIds.add(getDailyTargetCity(cities, dailyNumber).id);
    }
    expect(seenIds.size).toBe(cities.length);
    expect([...seenIds].sort()).toEqual(cities.map((c) => c.id).sort());
  });
});

describe('generateShareText', () => {
  const modes: { mode: GameMode; expectedTitle: string }[] = [
    { mode: 'daily', expectedTitle: '🏙️ Cityle #5 0/6' },
    { mode: 'archive', expectedTitle: '🏙️ Cityle #5 (Archive) 0/6' },
    { mode: 'challenge', expectedTitle: '🏙️ Cityle Challenge 0/6' },
    { mode: 'photo', expectedTitle: '🏙️ Cityle Photo Mode 0/6' },
    { mode: 'unlimited', expectedTitle: '🏙️ Cityle Unlimited 0/6' },
  ];

  for (const { mode, expectedTitle } of modes) {
    it(`produces the correct distinct title for mode "${mode}"`, () => {
      const text = generateShareText(5, [], true, mode);
      const titleLine = text.split('\n')[0];
      expect(titleLine).toBe(expectedTitle);
    });
  }

  it('all five title formats are mutually distinct', () => {
    const titles = modes.map(({ mode }) => generateShareText(5, [], true, mode).split('\n')[0]);
    expect(new Set(titles).size).toBe(modes.length);
  });
});

describe('shouldLoseLife', () => {
  it('is true just below the threshold', () => {
    expect(shouldLoseLife(LIVES_MODE_CLOSENESS_THRESHOLD - 1)).toBe(true);
  });

  it('is false exactly at the threshold', () => {
    expect(shouldLoseLife(LIVES_MODE_CLOSENESS_THRESHOLD)).toBe(false);
  });

  it('is false just above the threshold', () => {
    expect(shouldLoseLife(LIVES_MODE_CLOSENESS_THRESHOLD + 1)).toBe(false);
  });
});
