import { describe, it, expect } from 'vitest';
import { PLAYLISTS } from './playlists';
import citiesData from '../data/curated-cities.json';
import { City } from './types';

// Uses the real bundled dataset deliberately (not a synthetic array): this
// is a regression guard against a future curated-cities.json change silently
// dropping a city that a playlist still references by id.
const realCities = citiesData as City[];
const realCityIds = new Set(realCities.map((c) => c.id));

describe('playlists reference real cities in the bundled dataset', () => {
  it('the bundled dataset is non-empty (sanity check for the test itself)', () => {
    expect(realCities.length).toBeGreaterThan(0);
  });

  it('has at least one playlist to check', () => {
    expect(PLAYLISTS.length).toBeGreaterThan(0);
  });

  for (const playlist of PLAYLISTS) {
    it(`every cityId in playlist "${playlist.id}" resolves to a real city`, () => {
      expect(playlist.cityIds.length).toBeGreaterThan(0);
      const missing = playlist.cityIds.filter((id) => !realCityIds.has(id));
      expect(missing).toEqual([]);
    });
  }
});
