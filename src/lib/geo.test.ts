import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, calculateBearingDeg, calculateClosenessPct } from './geo';

describe('calculateDistanceKm', () => {
  it('is 0km for the same point', () => {
    // Madrid, real coordinates.
    expect(calculateDistanceKm(40.4168, -3.7038, 40.4168, -3.7038)).toBe(0);
  });

  it('is a large value (within tolerance of the true half-circumference) for antipodal-ish points', () => {
    // Madrid and its exact geometric antipode. Any two exactly-antipodal
    // points on a sphere are half the circumference apart — for this
    // module's R = 6371km sphere that's pi * R ≈ 20015 km, independent of
    // which point is chosen. This exercises the "far away" branch robustly
    // without depending on a specific pair of named cities.
    const distance = calculateDistanceKm(40.4168, -3.7038, -40.4168, 176.2962);
    expect(distance).toBeGreaterThan(19900);
    expect(distance).toBeLessThanOrEqual(20015);
  });

  it('matches a well-known real-world city-pair distance within tolerance', () => {
    // Madrid to Barcelona: commonly cited great-circle distance ~505km.
    const distance = calculateDistanceKm(40.4168, -3.7038, 41.3874, 2.1686);
    expect(distance).toBeGreaterThan(480);
    expect(distance).toBeLessThan(530);
  });
});

describe('calculateBearingDeg', () => {
  it('is ~0° (due north) when the target is directly north', () => {
    expect(calculateBearingDeg(0, 0, 10, 0)).toBeCloseTo(0, 0);
  });

  it('is ~90° (due east) when the target is directly east', () => {
    expect(calculateBearingDeg(0, 0, 0, 10)).toBeCloseTo(90, 0);
  });

  it('is ~180° (due south) when the target is directly south', () => {
    expect(calculateBearingDeg(0, 0, -10, 0)).toBeCloseTo(180, 0);
  });

  it('is ~270° (due west) when the target is directly west', () => {
    expect(calculateBearingDeg(0, 0, 0, -10)).toBeCloseTo(270, 0);
  });
});

describe('calculateClosenessPct', () => {
  it('is 100 at distance 0', () => {
    expect(calculateClosenessPct(0)).toBe(100);
  });

  it('decreases as distance increases', () => {
    const near = calculateClosenessPct(1000);
    const mid = calculateClosenessPct(8000);
    const far = calculateClosenessPct(15000);
    expect(near).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(far);
  });

  it('never goes negative, even beyond the max modeled distance', () => {
    expect(calculateClosenessPct(50000)).toBe(0);
  });
});
