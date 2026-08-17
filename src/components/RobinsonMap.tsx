'use client';

import React, { useState, useMemo } from 'react';
import { City, GuessResult } from '../lib/types';
import { Translations } from '../lib/i18n';
import { getCountryFlag } from '../lib/geo';
import worldData from '../data/worldMapData.json';
// @ts-expect-error d3-geo-projection lacks official types
import { geoRobinson } from 'd3-geo-projection';
import { Globe } from 'lucide-react';

interface RobinsonMapProps {
  guesses: GuessResult[];
  targetCity?: City;
  isGameOver?: boolean;
  t: Translations;
}

export const RobinsonMap: React.FC<RobinsonMapProps> = ({
  guesses,
  targetCity,
  isGameOver = false,
  t,
}) => {
  const [hoveredGuess, setHoveredGuess] = useState<GuessResult | null>(null);

  // Initialize the exact d3 Robinson projection matching worldMapData.json (800 x 450)
  const projection = useMemo(() => {
    return geoRobinson().fitSize([worldData.width, worldData.height], {
      type: 'Sphere',
    });
  }, []);

  // Compute target coordinates
  const targetCoords = useMemo(() => {
    if (!targetCity) return null;
    return projection([targetCity.lng, targetCity.lat]) as [number, number] | null;
  }, [targetCity, projection]);

  // Antimeridian-aware trajectory segment: when a pair of cities straddles the
  // +/-180 line and the wraparound path is shorter than the direct path, a naive
  // straight line in flat projection space cuts across almost the entire map
  // instead of the short way. Detect that case and split into two segments (one
  // from each city to the map edge nearest it, at the same latitude-interpolated
  // point) instead of one straight line across the whole width.
  const getTrajectorySegments = (
    fromCity: City,
    toCity: City
  ): Array<[[number, number], [number, number]]> | null => {
    const fromCoords = projection([fromCity.lng, fromCity.lat]) as [number, number] | null;
    const toCoords = projection([toCity.lng, toCity.lat]) as [number, number] | null;
    if (!fromCoords || !toCoords) return null;

    const lngA = fromCity.lng;
    const lngB = toCity.lng;
    const crossesAntimeridian = Math.sign(lngA) !== Math.sign(lngB) && Math.abs(lngA - lngB) > 180;

    if (!crossesAntimeridian) {
      return [[fromCoords, toCoords]];
    }

    // Wraparound path is shorter than the direct path — split at the near edge
    // of each city, interpolating latitude by how far each city is from its edge.
    const distToEdgeA = 180 - Math.abs(lngA);
    const distToEdgeB = 180 - Math.abs(lngB);
    const totalDist = distToEdgeA + distToEdgeB;
    const fraction = totalDist > 0 ? distToEdgeA / totalDist : 0.5;
    const interpolatedLat = fromCity.lat + fraction * (toCity.lat - fromCity.lat);

    const edgeLngA = lngA >= 0 ? 180 : -180;
    const edgeLngB = lngB >= 0 ? 180 : -180;
    const edgeA = projection([edgeLngA, interpolatedLat]) as [number, number] | null;
    const edgeB = projection([edgeLngB, interpolatedLat]) as [number, number] | null;
    if (!edgeA || !edgeB) return [[fromCoords, toCoords]];

    return [
      [fromCoords, edgeA],
      [toCoords, edgeB],
    ];
  };

  return (
    <div className="nothing-widget p-2.5 sm:p-3 flex flex-col gap-2 relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(232,236,240,0.06)] pb-1.5">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-[#3FD17C]" />
          <span className="stamp text-[0.62rem] text-[#F4F6F8] font-bold">
            🗺️ {t.mapTitle}
          </span>
        </div>
        <span className="stamp text-[0.65rem] text-[#8f9dac] mono">
          {t.mapPlottedCount.replace('{n}', String(guesses.length))}
        </span>
      </div>

      {/* SVG Canvas with Real Geographic World Vectors */}
      <div className="relative w-full aspect-[16/9] rounded bg-[#070b10] border border-[rgba(232,236,240,0.1)] overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${worldData.width} ${worldData.height}`}
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Ocean Background (Robinson Outline) */}
          <path
            d={worldData.spherePath}
            fill="#080d14"
            stroke="rgba(232, 236, 240, 0.15)"
            strokeWidth={1.5}
          />

          {/* Graticule Gridlines */}
          <path
            d={worldData.graticulePath}
            fill="none"
            stroke="rgba(232, 236, 240, 0.06)"
            strokeWidth={0.75}
            strokeDasharray="2 2"
          />

          {/* Real World Landmasses (High Precision GIS Coastlines) */}
          <path
            d={worldData.landPath}
            fill="#141c26"
            stroke="rgba(232, 236, 240, 0.28)"
            strokeWidth={1}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Country Borders */}
          {worldData.countryPaths && (
            <g fill="none" stroke="rgba(232, 236, 240, 0.08)" strokeWidth={0.5}>
              {worldData.countryPaths.map((country, i) => (
                <path key={`cp-${country.id || i}`} d={country.path} />
              ))}
            </g>
          )}

          {/* Connecting Trajectory Lines Between Sequential Guesses */}
          {guesses.map((g, idx) => {
            if (idx === 0) return null;
            const prevG = guesses[idx - 1];

            const segments = getTrajectorySegments(prevG.city, g.city);
            if (!segments) return null;

            const stroke = g.isCorrect
              ? '#10b981'
              : g.closenessPct > 70
              ? '#FFB238'
              : 'rgba(232,236,240,0.35)';

            return segments.map((seg, segIdx) => (
              <line
                key={`line-${idx}-${segIdx}`}
                x1={seg[0][0]}
                y1={seg[0][1]}
                x2={seg[1][0]}
                y2={seg[1][1]}
                stroke={stroke}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.8}
              />
            ));
          })}

          {/* Guess Location Pins */}
          {guesses.map((g, idx) => {
            const coords = projection([g.city.lng, g.city.lat]) as [number, number] | null;
            if (!coords) return null;

            const [x, y] = coords;
            const isLatest = idx === guesses.length - 1;
            const isHovered = hoveredGuess?.city.id === g.city.id;

            // Closeness color coding
            let pinColor = '#94a3b8';
            if (g.isCorrect) pinColor = '#10b981';
            else if (g.closenessPct >= 75) pinColor = '#34D67E';
            else if (g.closenessPct >= 50) pinColor = '#FFB238';

            return (
              <g
                key={`pin-${g.city.id}-${idx}`}
                onMouseEnter={() => setHoveredGuess(g)}
                onMouseLeave={() => setHoveredGuess(null)}
                onTouchStart={() => setHoveredGuess(g)}
                className="cursor-pointer"
              >
                {/* Ping pulse on latest guess */}
                {isLatest && !isGameOver && (
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth={1.5}
                    opacity={0.7}
                    className="animate-ping"
                  />
                )}

                {/* Outer Pin Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 6}
                  fill="#0A0C10"
                  stroke={pinColor}
                  strokeWidth={2.2}
                />

                {/* Inner Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 3.5 : 2.5}
                  fill={pinColor}
                />

                {/* Attempt Number Badge */}
                <text
                  x={x}
                  y={y - 9}
                  fill="#F4F6F8"
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Space Mono, monospace"
                  className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                >
                  #{idx + 1}
                </text>
              </g>
            );
          })}

          {/* Target Mystery City Pin (Revealed upon Game Over / Victory) */}
          {isGameOver && targetCoords && (
            <g>
              <circle
                cx={targetCoords[0]}
                cy={targetCoords[1]}
                r={16}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                className="animate-pulse"
              />
              <circle
                cx={targetCoords[0]}
                cy={targetCoords[1]}
                r={8}
                fill="#10b981"
                stroke="#0A0C10"
                strokeWidth={2}
              />
              <text
                x={targetCoords[0]}
                y={targetCoords[1] + 18}
                fill="#10b981"
                fontSize={11}
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Space Mono, monospace"
                className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
              >
                ★ {targetCity?.name.toUpperCase()}
              </text>
            </g>
          )}
        </svg>

        {/* Hover Readout Tooltip */}
        {hoveredGuess && (
          <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded bg-[#10141C]/95 border border-[#2a3340] text-[0.65rem] mono text-[#F4F6F8] flex items-center justify-between shadow-xl backdrop-blur-xs animate-fadeIn">
            <div className="flex items-center gap-1.5 truncate">
              <span>{getCountryFlag(hoveredGuess.city.countryCode)}</span>
              <strong className="text-[#34D67E]">{hoveredGuess.city.name}</strong>
              <span className="text-[#7d8b99]">({hoveredGuess.city.country})</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#FFB238]">
                🧭 {hoveredGuess.distanceKm.toLocaleString()} km {hoveredGuess.bearingArrow}
              </span>
              <span className="text-[#7d8b99]">
                ({hoveredGuess.closenessPct}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
