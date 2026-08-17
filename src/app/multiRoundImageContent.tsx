// Shared resolver + Satori-safe JSX builder for the personalized
// `/marathon/result/[encoded]` and `/playlists/[playlistId]/result/[encoded]`
// pages' opengraph-image.tsx/twitter-image.tsx routes, and for the two
// page.tsx routes themselves (Workstream DD). Generalizes
// `result/[encoded]/resultImageContent.tsx`'s single-target
// resolve-then-render pattern over a multi-round (Marathon/Playlist) run
// instead of duplicating it twice, since both share the exact same shape.
//
// Same Satori constraints as resultImageContent.tsx apply to
// buildMultiRoundLayout below: no external font/image fetches, no literal
// emoji (rebuilt from GuessResult fields as plain colored <div> tiles — see
// that file's header comment for exactly why), and no <text> inside a raw
// <svg> (moot here since this card has no embedded map — a 5-to-15-round
// tile-grid summary doesn't need a recomputed Robinson projection the way
// the single-result card's 6-guess trail does).

import citiesData from '../data/curated-cities.json';
import { computeMarathonScore, MARATHON_MAX_GUESSES_PER_ROUND, MARATHON_UNSOLVED_PENALTY } from '../lib/marathonLogic';
import {
  decodeMultiRoundResult,
  MultiRoundKind,
  MultiRoundResult,
} from '../lib/multiRoundResultEncoding';
import { evaluateGuess } from '../lib/gameLogic';
import { getPlaylistById, Playlist } from '../lib/playlists';
import { City, GuessResult } from '../lib/types';

const cities = citiesData as City[];

export interface ResolvedRound {
  targetCity: City;
  guesses: GuessResult[];
  guessesUsed: number;
  won: boolean;
}

export interface ResolvedMultiRoundResult {
  decoded: MultiRoundResult;
  kind: MultiRoundKind;
  collectionId: string;
  /** Only set (and only meaningful) when kind === 'playlist'. */
  playlist?: Playlist;
  rounds: ResolvedRound[];
  totalScore: number;
  maxScore: number;
}

/**
 * Decodes `encoded` and re-verifies every id against the live city dataset
 * (decodeMultiRoundResult() itself never does this — see its module
 * comment) — and, for a playlist run, re-verifies `collectionId` still
 * resolves to a real, current playlist via getPlaylistById. Returns null on
 * any failure: malformed encoding, any city id that doesn't resolve to a
 * real City, or (kind 'playlist') a collectionId that isn't a known
 * playlist. Never throws.
 */
export function resolveMultiRoundResult(encoded: string): ResolvedMultiRoundResult | null {
  const decoded = decodeMultiRoundResult(encoded);
  if (!decoded) return null;

  let playlist: Playlist | undefined;
  if (decoded.kind === 'playlist') {
    playlist = getPlaylistById(decoded.collectionId);
    if (!playlist) return null;
  }

  const rounds: ResolvedRound[] = [];
  for (const round of decoded.rounds) {
    const targetCity = cities.find((c) => c.id === round.targetId);
    if (!targetCity) return null;

    const guessCities: City[] = [];
    for (const id of round.guessIds) {
      const city = cities.find((c) => c.id === id);
      if (!city) return null;
      guessCities.push(city);
    }

    const guesses = guessCities.map((city, index) => evaluateGuess(city, targetCity, index + 1));
    const won = round.guessIds[round.guessIds.length - 1] === round.targetId;

    rounds.push({ targetCity, guesses, guessesUsed: guesses.length, won });
  }
  if (rounds.length === 0) return null;

  // Reuses computeMarathonScore (marathonLogic.ts) directly rather than
  // re-deriving the scoring math here — a resolved multi-round result is
  // scored exactly like a live Marathon/Playlist run, by feeding it the same
  // { targetCityId, guesses, guessesUsed, won }[] shape
  // MarathonState/PlaylistState.roundResults already uses.
  const roundResultsForScoring = rounds.map((round, index) => ({
    targetCityId: decoded.rounds[index].targetId,
    guesses: round.guesses,
    guessesUsed: round.guessesUsed,
    won: round.won,
  }));
  const totalScore = computeMarathonScore(roundResultsForScoring);
  const maxScore = rounds.length * MARATHON_UNSOLVED_PENALTY;

  return {
    decoded,
    kind: decoded.kind,
    collectionId: decoded.collectionId,
    playlist,
    rounds,
    totalScore,
    maxScore,
  };
}

/** `MARATHON #17` or a playlist's real name, uppercased to match the single-
 * result card's `DAILY #42`-style mode badge (formatModeBadge in
 * resultImageContent.tsx). `resolved.playlist` is guaranteed non-null here
 * for kind 'playlist' — resolveMultiRoundResult never returns a
 * playlist-kind result without it. */
export function formatCollectionBadge(resolved: ResolvedMultiRoundResult): string {
  if (resolved.kind === 'marathon') return `MARATHON #${resolved.collectionId}`;
  return resolved.playlist ? resolved.playlist.name.toUpperCase() : 'PLAYLIST';
}

const GREEN = '#3FD17C';
const GOLD = '#FFB238';
const MISS = '#3a4451';
const LOSS_RED = '#FF4D4D';

// Same three-way tile logic generateShareText()/rowTiles() (gameLogic.ts /
// resultImageContent.tsx) use per guess, applied here to a round's FINAL
// guess — the same "last guess summarizes the round" technique
// marathonLogic.ts's formatRoundRow and playlists.ts's
// formatPlaylistRoundRow already use for their plain-text share rows.
// Rebuilt without emoji — see this file's header comment.
function roundTiles(round: ResolvedRound): string[] {
  if (round.won) return [GREEN, GREEN, GREEN, GREEN];
  const lastGuess = round.guesses[round.guesses.length - 1];
  if (!lastGuess) return [MISS, MISS, MISS, MISS];
  const continentTile = lastGuess.continentMatch ? (lastGuess.countryMatch ? GREEN : GOLD) : MISS;
  const popTile = lastGuess.populationComp.status === 'exact' ? GREEN : MISS;
  const pmTile = lastGuess.pm25Comp.status === 'exact' ? GREEN : MISS;
  const koppenTile =
    lastGuess.koppenComp.status === 'exact'
      ? GREEN
      : lastGuess.koppenComp.status === 'same-subtype' || lastGuess.koppenComp.status === 'same-group'
        ? GOLD
        : MISS;
  return [continentTile, popTile, pmTile, koppenTile];
}

// Two-column flex-wrap grid rather than a single tall column: keeps every
// row a comfortable, constant size regardless of whether this is a 5-round
// Marathon or a 12-15-round Playlist, instead of shrinking fonts/tiles as
// round count grows. 2 columns x up to 8 rows comfortably covers the
// largest playlist (15 rounds, the flood-risk list) inside the 1200x630
// frame without recomputing a map — see this file's header comment.
const ROUND_ITEM_WIDTH = 520;

export function buildMultiRoundLayout(resolved: ResolvedMultiRoundResult) {
  const badge = formatCollectionBadge(resolved);
  const kindLabel = resolved.kind === 'marathon' ? 'MARATHON RESULT' : 'PLAYLIST RESULT';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0C10',
        padding: '40px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#eef1f3' }}>
          CITYLE
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#8f9dac',
            border: '1px solid rgba(232,236,240,0.25)',
            borderRadius: 999,
            padding: '5px 12px',
          }}
        >
          {kindLabel}
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, lineHeight: 1.1, color: '#F4F6F8', marginTop: 14 }}>
        {badge}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: 8 }}>
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, lineHeight: 1, color: '#FFB238' }}>
          {resolved.totalScore}
        </div>
        <div style={{ display: 'flex', fontSize: 20, color: '#8f9dac' }}>/ {resolved.maxScore} total score</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', marginTop: 22 }}>
        {resolved.rounds.map((round, idx) => (
          <div
            key={`${round.targetCity.id}-${idx}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: `${ROUND_ITEM_WIDTH}px` }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              {roundTiles(round).map((color, tileIdx) => (
                <div
                  key={`tile-${idx}-${tileIdx}`}
                  style={{ display: 'flex', width: 16, height: 16, borderRadius: 4, backgroundColor: color }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 18,
                fontWeight: 700,
                color: '#F4F6F8',
                width: `${ROUND_ITEM_WIDTH - 76 - 80}px`,
              }}
            >
              {round.targetCity.name}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 16,
                fontWeight: 700,
                color: round.won ? GREEN : LOSS_RED,
              }}
            >
              {round.won ? `${round.guessesUsed}/${MARATHON_MAX_GUESSES_PER_ROUND}` : `${MARATHON_MAX_GUESSES_PER_ROUND}+`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
