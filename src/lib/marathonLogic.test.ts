import { describe, it, expect } from 'vitest';
import { getMarathonCities, computeMarathonScore, MARATHON_UNSOLVED_PENALTY } from './marathonLogic';
import { makeCities } from './testFixtures';
import { MarathonState } from './types';

describe('getMarathonCities', () => {
  const cities = makeCities(20);

  it('is deterministic: the same marathonNumber always returns the same sequence', () => {
    const first = getMarathonCities(7, cities, 5).map((c) => c.id);
    const second = getMarathonCities(7, cities, 5).map((c) => c.id);
    expect(second).toEqual(first);
  });

  it('returns distinct cities (no duplicates) for a given call', () => {
    const result = getMarathonCities(11, cities, 5);
    const ids = result.map((c) => c.id);
    expect(ids.length).toBe(5);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('different marathonNumbers tend to produce different sequences (spot check)', () => {
    const a = getMarathonCities(1, cities, 5).map((c) => c.id);
    const b = getMarathonCities(2, cities, 5).map((c) => c.id);
    expect(a).not.toEqual(b);
  });
});

describe('computeMarathonScore', () => {
  function makeRound(
    won: boolean,
    guessesUsed: number
  ): MarathonState['roundResults'][number] {
    return { targetCityId: 'x', guesses: [], guessesUsed, won };
  }

  it('a won round contributes its guessesUsed', () => {
    const score = computeMarathonScore([makeRound(true, 3)]);
    expect(score).toBe(3);
  });

  it('a lost round contributes exactly MARATHON_UNSOLVED_PENALTY regardless of guessesUsed', () => {
    const scoreWithLowGuessesUsed = computeMarathonScore([makeRound(false, 1)]);
    const scoreWithHighGuessesUsed = computeMarathonScore([makeRound(false, 6)]);
    expect(scoreWithLowGuessesUsed).toBe(MARATHON_UNSOLVED_PENALTY);
    expect(scoreWithHighGuessesUsed).toBe(MARATHON_UNSOLVED_PENALTY);
  });

  it('sums correctly across multiple rounds', () => {
    const score = computeMarathonScore([
      makeRound(true, 2),
      makeRound(false, 4), // counts as MARATHON_UNSOLVED_PENALTY, not 4
      makeRound(true, 5),
    ]);
    expect(score).toBe(2 + MARATHON_UNSOLVED_PENALTY + 5);
  });

  it('returns 0 for an empty round list', () => {
    expect(computeMarathonScore([])).toBe(0);
  });
});
