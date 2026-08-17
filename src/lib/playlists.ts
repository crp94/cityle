// Curated Playlists (Phase 5, Workstream AA): themed subsets of the bundled
// 255-city pool, played through the existing Marathon machinery
// (MarathonRound, reused as-is — see src/app/playlists/[playlistId]/page.tsx)
// rather than growing the city pool or standing up a new data pipeline.
// Every playlist's `cityIds` is *derived* below by sorting/filtering the real
// bundled `curated-cities.json` on fields that already exist there — nothing
// is hand-picked by eyeballing the dataset, so a future data refresh
// automatically keeps these lists honest.
//
// Blurbs quote the same cited numbers the game already surfaces in-game
// (Dossier/MetricChip) and follow this project's standing editorial rule
// (Phase 2 Workstream B): never invent precision the data doesn't have,
// never make an unhedged prediction about a named city's future, present the
// cited numbers straight.
//
// Not day-locked, freely repeatable — mirrors Unlimited mode's cadence, not
// compared across players like the daily Marathon.

import citiesData from '../data/curated-cities.json';
import { computeMarathonScore, MARATHON_MAX_GUESSES_PER_ROUND, MARATHON_UNSOLVED_PENALTY } from './marathonLogic';
import { City, GuessResult, PlaylistState } from './types';

const cities = citiesData as City[];

export interface Playlist {
  id: string;
  name: string;
  blurb: string;
  cityIds: string[];
}

const PLAYLIST_SIZE = 12;
// Slightly larger cap for the flood-risk playlist below, whose qualifying
// pool (17 cities) is bigger than the other lists' fixed top-N cut —  still
// inside this workstream's 8-15 city guideline.
const FLOOD_RISK_PLAYLIST_SIZE = 15;

function sortByDesc(selector: (city: City) => number, count: number): City[] {
  return [...cities].sort((a, b) => selector(b) - selector(a)).slice(0, count);
}

function sortByAsc(selector: (city: City) => number, count: number): City[] {
  return [...cities].sort((a, b) => selector(a) - selector(b)).slice(0, count);
}

function toIds(list: City[]): string[] {
  return list.map((city) => city.id);
}

// --- Derived city lists ------------------------------------------------
//
// Each list below is computed once at module load from the real dataset.
// Candidate angles considered (per the workstream brief) but left out because
// they overlapped too heavily with an angle already covered here: lowest
// elevation (~40% overlap with the flood-risk list below — coastal
// low-lying cities dominate both), highest tree canopy, and wettest by
// precipitation.

const highestElevation = sortByDesc((city) => city.elevation_m, PLAYLIST_SIZE);

const sinkingCities = cities
  .filter((city) => city.coastal_flood_risk === 'Severe' || city.coastal_flood_risk === 'Extremely High')
  .sort((a, b) => b.population_metro - a.population_metro)
  .slice(0, FLOOD_RISK_PLAYLIST_SIZE);

const megacities = sortByDesc((city) => city.population_metro, PLAYLIST_SIZE);

const smallButMighty = sortByAsc((city) => city.population_metro, PLAYLIST_SIZE);

const cleanestAir = sortByAsc((city) => city.pm25_annual_ugm3, PLAYLIST_SIZE);

const fastestWarming = sortByDesc((city) => city.temp_2050_anomaly_c, PLAYLIST_SIZE);

const urbanHeatIslands = sortByDesc((city) => city.uhi_index_c, PLAYLIST_SIZE);

const driestCities = sortByAsc((city) => city.precip_annual_mm, PLAYLIST_SIZE);

// --- Playlist catalog ----------------------------------------------------

export const PLAYLISTS: Playlist[] = [
  {
    id: 'highest-elevation',
    name: 'Highest Cities on Earth',
    blurb:
      'Twelve of the pool’s highest-elevation cities, from Johannesburg at 1,753m up to Potosí at 4,067m. Thinner air and a different relationship with cold and UV reshape daily life here as much as latitude does.',
    cityIds: toIds(highestElevation),
  },
  {
    id: 'sinking-cities',
    name: 'Sinking Cities',
    blurb:
      'Fifteen cities this dataset flags ‘Severe’ or ‘Extremely High’ for coastal flood risk, from megacities like Jakarta and Shanghai down to smaller ports like Semarang. A risk tier, not a forecast of when or whether any one of them floods.',
    cityIds: toIds(sinkingCities),
  },
  {
    id: 'megacities',
    name: 'Megacities',
    blurb:
      'Twelve of the largest metro populations in the pool, every one north of 20 million people — Tokyo tops it at roughly 37.4 million. Scale like this changes almost everything else about how a city runs.',
    cityIds: toIds(megacities),
  },
  {
    id: 'small-but-mighty',
    name: 'Small but Mighty',
    blurb:
      'The pool’s smallest metro populations, from Hobart at roughly 255,000 up to Nakhon Ratchasima at 466,000 — all still clearing this game’s population floor. A different texture of clue than the megacities: less name recognition to lean on.',
    cityIds: toIds(smallButMighty),
  },
  {
    id: 'cleanest-air',
    name: 'Cleanest Air',
    blurb:
      'Twelve cities with the lowest annual PM2.5 readings in the pool, from Quito at 2.1 µg/m³ up to Winnipeg at 5.5 µg/m³ — well below where most of this dataset’s 255 cities sit. Wind and geography help as much as policy does.',
    cityIds: toIds(cleanestAir),
  },
  {
    id: 'fastest-warming',
    name: 'Fastest-Warming Futures',
    blurb:
      'Twelve cities carrying this dataset’s steepest modelled 2050 temperature anomaly, each around +3.0 to +3.2°C — Ulaanbaatar and Anchorage lead the list. A modelled, directional estimate for play, not a locked-in prediction for any named city.',
    cityIds: toIds(fastestWarming),
  },
  {
    id: 'urban-heat-islands',
    name: 'Concrete Heat Islands',
    blurb:
      'Twelve cities with the strongest modelled urban heat island effect in the pool — Phoenix leads at +5.0°C over its surrounding rural baseline. Pavement, building density, and lost tree cover drive this more than raw latitude does.',
    cityIds: toIds(urbanHeatIslands),
  },
  {
    id: 'driest-cities',
    name: 'Driest Cities on the Map',
    blurb:
      'Twelve of the pool’s driest cities by annual precipitation, from Antofagasta at 4.4mm up to Khartoum at 120.4mm — a fraction of what most of the other 255 cities receive in a year. Desert climates that still support millions of people.',
    cityIds: toIds(driestCities),
  },
];

export function getPlaylistById(playlistId: string): Playlist | undefined {
  return PLAYLISTS.find((playlist) => playlist.id === playlistId);
}

/**
 * Resolves a playlist's `cityIds` to full `City` objects. Filters out any id
 * that doesn't resolve (defensively — shouldn't happen since every id here
 * is generated straight from the real dataset above, but a caller should
 * never crash if the bundled dataset and this module ever drift).
 */
export function getPlaylistCities(playlist: Playlist, allCities: City[]): City[] {
  return playlist.cityIds
    .map((id) => allCities.find((city) => city.id === id))
    .filter((city): city is City => Boolean(city));
}

// --- Sharing ---------------------------------------------------------------
//
// Reuses computeMarathonScore (marathonLogic.ts) directly for the scoring
// math itself — a playlist run is scored exactly like a Marathon run (sum of
// guesses used, MARATHON_UNSOLVED_PENALTY for an unsolved city). Only the
// title line and per-row emoji formatting are duplicated in a thin,
// playlist-specific wrapper here (mirroring generateMarathonShareText's
// pattern in marathonLogic.ts), since a playlist's share text needs to name
// the playlist rather than a marathon day number, and marathonLogic.ts's own
// row formatter isn't exported for reuse.
function formatPlaylistRoundRow(round: PlaylistState['roundResults'][number]): string {
  const lastGuess: GuessResult | undefined = round.guesses[round.guesses.length - 1];

  if (round.won) {
    return `🟩🟩🟩🎯 SOLVED! (${round.guessesUsed}/${MARATHON_MAX_GUESSES_PER_ROUND})`;
  }

  if (!lastGuess) {
    return `⬛⬛⬛⬛ ❌ (0/${MARATHON_MAX_GUESSES_PER_ROUND})`;
  }

  const continentBox = lastGuess.continentMatch ? (lastGuess.countryMatch ? '🟩' : '🟨') : '⬛';
  const popBox = lastGuess.populationComp.status === 'exact' ? '🟩' : '⬛';
  const pmBox = lastGuess.pm25Comp.status === 'exact' ? '🟩' : '⬛';
  const koppenBox =
    lastGuess.koppenComp.status === 'exact'
      ? '🟩'
      : lastGuess.koppenComp.status === 'same-subtype' || lastGuess.koppenComp.status === 'same-group'
        ? '🟨'
        : '⬛';

  return `${continentBox}${popBox}${pmBox}${koppenBox} ❌ (${round.guessesUsed}/${MARATHON_MAX_GUESSES_PER_ROUND})`;
}

/**
 * Generates a shareable Wordle-like text summary for a completed playlist
 * run, following the same title-line + emoji-rows + link pattern as
 * generateMarathonShareText.
 */
export function generatePlaylistShareText(
  playlist: Playlist,
  roundResults: PlaylistState['roundResults']
): string {
  const score = computeMarathonScore(roundResults);
  const maxScore = roundResults.length * MARATHON_UNSOLVED_PENALTY;
  const title = `🏙️ Cityle Playlist — ${playlist.name} — ${score}/${maxScore}`;

  const rows = roundResults.map(formatPlaylistRoundRow);

  return `${title}\n\n${rows.join('\n')}\n\nhttps://cityle.app`;
}
