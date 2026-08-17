// Shared resolver + Satori-safe JSX builder for the personalized
// `/result/[encoded]` opengraph-image.tsx and twitter-image.tsx routes
// (Workstream H). Mirrors the plain-function / flex-layout / no-hooks /
// no-'use client' shape of ../../ogImageContent.tsx, since this tree is
// rendered by Satori (`next/og`'s ImageResponse), not by a browser.
//
// Deliberately renders NO literal emoji characters (no 🟩/🟨/⬛ tiles, no
// flag emoji, no compass-arrow emoji) even though generateShareText() in
// gameLogic.ts uses them — @vercel/og's default emoji handling
// (`loadEmoji`) fetches a per-glyph image from a jsdelivr/twemoji CDN at
// render time, which would violate the "no external image fetches"
// requirement (this needs to render fast and never fail offline/in CI) and
// would silently reintroduce a network dependency the plain-text
// `ogImageContent.tsx` deliberately avoids. Every "emoji-grid" row below is
// therefore rebuilt from the same underlying GuessResult fields
// generateShareText reads, just painted as plain colored <div> tiles and
// text instead of Unicode glyphs — same information, zero network calls.
//
// Also deliberately renders no <text> inside the embedded <svg> map (only
// <path>/<circle>/<line>, which next/og's bundled Satori is confirmed to
// support) — any text needed near the map is a normal flex/text div
// overlaid on the map frame, not an SVG text node.

import citiesData from '../../../data/curated-cities.json';
import worldData from '../../../data/worldMapData.json';
// @ts-expect-error d3-geo-projection lacks official types
import { geoRobinson } from 'd3-geo-projection';
import { evaluateGuess } from '../../../lib/gameLogic';
import { decodeResult, DecodedResult } from '../../../lib/resultEncoding';
import { City, GuessResult } from '../../../lib/types';

const cities = citiesData as City[];

export interface ResolvedResult {
  decoded: DecodedResult;
  targetCity: City;
  guesses: GuessResult[];
  won: boolean;
}

/**
 * Decodes `encoded` and re-verifies every id against the live city dataset
 * (decodeResult() itself never does this — see its module comment). Returns
 * null on any failure: malformed encoding, or any id that doesn't resolve to
 * a real City. Never throws.
 */
export function resolveResult(encoded: string): ResolvedResult | null {
  const decoded = decodeResult(encoded);
  if (!decoded) return null;

  const targetCity = cities.find((c) => c.id === decoded.targetId);
  if (!targetCity) return null;

  const guessCities: City[] = [];
  for (const id of decoded.guessIds) {
    const city = cities.find((c) => c.id === id);
    if (!city) return null;
    guessCities.push(city);
  }

  const guesses = guessCities.map((city, index) => evaluateGuess(city, targetCity, index + 1));
  const won = decoded.guessIds[decoded.guessIds.length - 1] === decoded.targetId;

  return { decoded, targetCity, guesses, won };
}

/** `DAILY #42` / `ARCHIVE #17` / `UNLIMITED` / `CHALLENGE` */
export function formatModeBadge(decoded: DecodedResult): string {
  switch (decoded.mode) {
    case 'daily':
      return `DAILY #${decoded.dailyNumber}`;
    case 'archive':
      return `ARCHIVE #${decoded.dailyNumber}`;
    case 'challenge':
      return 'CHALLENGE';
    case 'unlimited':
    default:
      return 'UNLIMITED';
  }
}

const GREEN = '#3FD17C';
const GOLD = '#FFB238';
const MISS = '#3a4451';

// Same three-way tile logic generateShareText() uses per row (gameLogic.ts),
// rebuilt without emoji — see file header comment.
function rowTiles(g: GuessResult): string[] {
  if (g.isCorrect) return [GREEN, GREEN, GREEN];
  const continentTile = g.continentMatch ? (g.countryMatch ? GREEN : GOLD) : MISS;
  const popTile = g.populationComp.status === 'exact' ? GREEN : MISS;
  const pmTile = g.pm25Comp.status === 'exact' ? GREEN : MISS;
  const koppenTile =
    g.koppenComp.status === 'exact' ? GREEN : g.koppenComp.status === 'same-group' ? GOLD : MISS;
  return [continentTile, popTile, pmTile, koppenTile];
}

// Mirrors RobinsonMap.tsx's pin/line closeness coloring exactly.
function pinColor(g: GuessResult): string {
  if (g.isCorrect) return '#10b981';
  if (g.closenessPct >= 75) return '#34D67E';
  if (g.closenessPct >= 50) return '#FFB238';
  return '#94a3b8';
}
function lineColor(g: GuessResult): string {
  if (g.isCorrect) return '#10b981';
  if (g.closenessPct > 70) return '#FFB238';
  return 'rgba(232,236,240,0.35)';
}

const MAP_VIEW_WIDTH = 620;
const MAP_VIEW_HEIGHT = Math.round((MAP_VIEW_WIDTH * worldData.height) / worldData.width);

export function buildResultLayout(resolved: ResolvedResult) {
  const { decoded, targetCity, guesses, won } = resolved;

  // Same exact projection setup as RobinsonMap.tsx, fit to worldMapData.json's
  // declared width/height, so the recomputed pins land in the same place a
  // human visiting the real page (which uses RobinsonMap directly) would see.
  const projection = geoRobinson().fitSize([worldData.width, worldData.height], {
    type: 'Sphere',
  });

  const guessPoints = guesses
    .map((g) => ({ g, coords: projection([g.city.lng, g.city.lat]) as [number, number] | null }))
    .filter((p): p is { g: GuessResult; coords: [number, number] } => Boolean(p.coords));

  const targetCoords = projection([targetCity.lng, targetCity.lat]) as [number, number] | null;

  const modeBadge = formatModeBadge(decoded);
  const headline = won ? 'SOLVED IT' : 'NOT TODAY';
  const headlineColor = won ? '#3FD17C' : '#FF4D4D';
  const scoreText = won ? `${guesses.length}/6 GUESSES` : `X/6 — REVEALED`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#0A0C10',
        padding: '44px',
        gap: '36px',
      }}
    >
      {/* Left column: headline, target city, mode badge, tile-grid summary */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '440px', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#eef1f3' }}>
            CITYLE
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#8f9dac',
              border: '1px solid rgba(232,236,240,0.25)',
              borderRadius: 999,
              padding: '5px 12px',
            }}
          >
            {modeBadge}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, lineHeight: 1, color: headlineColor }}>
          {headline}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#F4F6F8' }}>{targetCity.name}</div>
          <div style={{ display: 'flex', fontSize: 18, color: '#8f9dac' }}>
            {targetCity.country} · {targetCity.continent}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: won ? '#3FD17C' : '#FF4D4D',
          }}
        >
          {scoreText}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          {guesses.map((g, idx) => (
            <div key={`row-${g.city.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {rowTiles(g).map((color, tileIdx) => (
                  <div
                    key={`tile-${idx}-${tileIdx}`}
                    style={{ display: 'flex', width: 15, height: 15, borderRadius: 3, backgroundColor: color }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', fontSize: 15, color: '#c5ced7' }}>
                {g.isCorrect
                  ? 'SOLVED'
                  : `${g.bearingCompass} · ${Math.round(g.distanceKm).toLocaleString()} km`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column: recomputed Robinson-projection map with guess pins */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            width: `${MAP_VIEW_WIDTH}px`,
            height: `${MAP_VIEW_HEIGHT}px`,
            borderRadius: 10,
            border: '1px solid rgba(232,236,240,0.12)',
            overflow: 'hidden',
            backgroundColor: '#080d14',
          }}
        >
          <svg
            width={MAP_VIEW_WIDTH}
            height={MAP_VIEW_HEIGHT}
            viewBox={`0 0 ${worldData.width} ${worldData.height}`}
          >
            <path d={worldData.spherePath} fill="#080d14" stroke="rgba(232,236,240,0.15)" strokeWidth={1.5} />
            <path
              d={worldData.landPath}
              fill="#141c26"
              stroke="rgba(232,236,240,0.28)"
              strokeWidth={1}
            />

            {/* Sequential guess trajectory (straight segments — the
                antimeridian-aware split RobinsonMap.tsx does for its
                interactive map is skipped here as an acceptable
                simplification for a static share card). */}
            {guessPoints.slice(1).map((point, idx) => {
              const prev = guessPoints[idx];
              return (
                <line
                  key={`line-${idx}`}
                  x1={prev.coords[0]}
                  y1={prev.coords[1]}
                  x2={point.coords[0]}
                  y2={point.coords[1]}
                  stroke={lineColor(point.g)}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  opacity={0.8}
                />
              );
            })}

            {guessPoints.map((point, idx) => (
              <circle
                key={`pin-${point.g.city.id}-${idx}`}
                cx={point.coords[0]}
                cy={point.coords[1]}
                r={6}
                fill="#0A0C10"
                stroke={pinColor(point.g)}
                strokeWidth={2.2}
              />
            ))}

            {targetCoords && (
              <g>
                <circle cx={targetCoords[0]} cy={targetCoords[1]} r={16} fill="none" stroke="#10b981" strokeWidth={2} />
                <circle cx={targetCoords[0]} cy={targetCoords[1]} r={8} fill="#10b981" stroke="#0A0C10" strokeWidth={2} />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
