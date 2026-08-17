import { describe, it, expect } from 'vitest';
import { generateQuestion, QUICKFIRE_FIELDS } from './quickfireLogic';
import { makeCities, makeCity } from './testFixtures';

/** Deterministic sequence RNG for reproducible test assertions. */
function sequenceRng(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe('generateQuestion', () => {
  const cities = makeCities(20);

  it('picks exactly 4 distinct cities', () => {
    const question = generateQuestion(cities);
    expect(question.cities.length).toBe(4);
    expect(new Set(question.cities.map((c) => c.id)).size).toBe(4);
  });

  it('picks a field from the curated whitelist', () => {
    const question = generateQuestion(cities);
    expect(QUICKFIRE_FIELDS.map((f) => f.key)).toContain(question.field.key);
  });

  it('throws if fewer than 4 cities are available', () => {
    expect(() => generateQuestion(cities.slice(0, 3))).toThrow();
  });

  it('computes the correct answer from real field values for a "highest" question, not hardcoded', () => {
    const a = makeCity({ id: 'a', lat: 0, population_metro: 1_000_000 });
    const b = makeCity({ id: 'b', lat: 1, population_metro: 5_000_000 });
    const c = makeCity({ id: 'c', lat: 2, population_metro: 2_000_000 });
    const d = makeCity({ id: 'd', lat: 3, population_metro: 500_000 });
    const pool = [a, b, c, d];

    // generateQuestion consumes exactly 5 rng() calls for a 4-city pool:
    // 3 for the Fisher-Yates shuffle, 1 for the field pick, 1 for the
    // highest/lowest framing (higherIsAnswer = rng() < 0.5, so a *low*
    // draw here forces "highest"). Field index 0 is population_metro (see
    // QUICKFIRE_FIELDS above).
    const rng = sequenceRng([0, 0, 0, 0, 0.1]);
    const question = generateQuestion(pool, rng);

    expect(question.field.key).toBe('population_metro');
    expect(question.higherIsAnswer).toBe(true);
    expect(question.correctCityIds).toEqual(['b']); // highest population_metro
  });

  it('computes the correct answer from real field values for a "lowest" question, not hardcoded', () => {
    const a = makeCity({ id: 'a', lat: 0, elevation_m: 800 });
    const b = makeCity({ id: 'b', lat: 1, elevation_m: 50 });
    const c = makeCity({ id: 'c', lat: 2, elevation_m: 300 });
    const d = makeCity({ id: 'd', lat: 3, elevation_m: 1200 });
    const pool = [a, b, c, d];

    // 3 shuffle calls (all 0, leaving pool order untouched), then a field
    // draw landing on elevation_m's slot in QUICKFIRE_FIELDS, then a
    // >= 0.5 draw to force the "lowest" framing (higherIsAnswer = rng() < 0.5).
    const fieldIndex = QUICKFIRE_FIELDS.findIndex((f) => f.key === 'elevation_m');
    const fieldRngValue = fieldIndex / QUICKFIRE_FIELDS.length;
    const rng = sequenceRng([0, 0, 0, fieldRngValue, 0.9]);
    const question = generateQuestion(pool, rng);

    expect(question.field.key).toBe('elevation_m');
    expect(question.higherIsAnswer).toBe(false);
    expect(question.correctCityIds).toEqual(['b']); // lowest elevation_m
  });

  it('equator_distance field: lower |lat| wins a "lowest" (closest-to-equator) question', () => {
    const field = QUICKFIRE_FIELDS.find((f) => f.key === 'equator_distance')!;
    const near = makeCity({ id: 'near', lat: 2 });
    const far = makeCity({ id: 'far', lat: -55 });
    expect(field.getValue(near)).toBeLessThan(field.getValue(far));
  });

  it('never selects the same city twice in one question', () => {
    for (let trial = 0; trial < 25; trial += 1) {
      const question = generateQuestion(cities);
      const ids = question.cities.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('marks every tied city as correct when two cities share the extreme value, not just the shuffle-order winner', () => {
    // Real dataset has frequent exact ties (e.g. several cities share
    // elevation_m === 5) — a naive "first city wins" comparison would mark
    // an equally-correct tap as wrong.
    const a = makeCity({ id: 'a', lat: 0, elevation_m: 300 });
    const b = makeCity({ id: 'b', lat: 1, elevation_m: 5 });
    const c = makeCity({ id: 'c', lat: 2, elevation_m: 800 });
    const d = makeCity({ id: 'd', lat: 3, elevation_m: 5 }); // tied with b
    const pool = [a, b, c, d];

    const fieldIndex = QUICKFIRE_FIELDS.findIndex((f) => f.key === 'elevation_m');
    const fieldRngValue = fieldIndex / QUICKFIRE_FIELDS.length;
    const rng = sequenceRng([0, 0, 0, fieldRngValue, 0.9]); // "lowest" framing

    const question = generateQuestion(pool, rng);

    expect(question.field.key).toBe('elevation_m');
    expect(question.higherIsAnswer).toBe(false);
    expect(question.correctCityIds.sort()).toEqual(['b', 'd']);
  });
});
