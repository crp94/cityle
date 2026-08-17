'use client';

import React, { useState } from 'react';
import { Translations } from '../lib/i18n';

interface SparklineProps {
  monthlyTemps: number[];
  monthlyPrecip: number[];
  monthlyTemps2050?: number[];
  monthlyPrecip2050?: number[];
  showFuture?: boolean;
  t: Translations;
}

export const Sparkline: React.FC<SparklineProps> = ({
  monthlyTemps,
  monthlyPrecip,
  monthlyTemps2050,
  monthlyPrecip2050,
  showFuture = false,
  t,
}) => {
  const [viewMode, setViewMode] = useState<'current' | 'future' | 'compare'>('current');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // SVG Coordinate space
  const svgWidth = 420;
  const svgHeight = 120;
  const padLeft = 32;
  const padRight = 32;
  const padTop = 14;
  const padBottom = 24;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Derive future curves if not provided
  const futureTemps = monthlyTemps2050 ?? monthlyTemps;
  const futurePrecip = monthlyPrecip2050 ?? monthlyPrecip;
  const activeMode = showFuture ? viewMode : 'current';

  const allTemps = [...monthlyTemps, ...futureTemps];
  const minTemp = Math.floor(Math.min(...allTemps, 0));
  const maxTemp = Math.ceil(Math.max(...allTemps, 30));
  const tempRange = Math.max(1, maxTemp - minTemp);

  const maxPrecip = Math.max(...monthlyPrecip, ...futurePrecip, 80);

  // Calculate coordinates
  const getX = (i: number) => padLeft + (i / 11) * chartWidth;
  const getYTemp = (t: number) => padTop + chartHeight - ((t - minTemp) / tempRange) * chartHeight;
  const getYPrecip = (p: number) => padTop + chartHeight - (p / maxPrecip) * chartHeight;

  // Present line path
  const pointsCurrent = monthlyTemps.map((t, i) => `${getX(i)},${getYTemp(t)}`);
  const linePathCurrent = `M ${pointsCurrent.join(' L ')}`;

  // 2050 future line path
  const pointsFuture = futureTemps.map((t, i) => `${getX(i)},${getYTemp(t)}`);
  const linePathFuture = `M ${pointsFuture.join(' L ')}`;

  // Zero freeze line
  const zeroY = getYTemp(0);

  return (
    <div className="w-full bg-[#0A0C10] p-3 sm:p-3.5 rounded border border-[rgba(232,236,240,0.12)] flex flex-col gap-2 font-mono text-xs">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 border-b border-[rgba(232,236,240,0.08)] pb-2">
        <div className="flex items-center gap-2">
          <span className="stamp text-[0.68rem] text-[#F4F6F8] font-bold">
            {t.annualCycle}
          </span>
        </div>

        {/* Mode Selector */}
        {showFuture && <div className="flex items-center rounded-xs bg-[#10141C] border border-[#2a3340] p-0.5 text-[0.68rem]">
          <button
            type="button"
            onClick={() => setViewMode('current')}
            className={`px-2 py-0.5 rounded-xs transition-colors ${
              activeMode === 'current'
                ? 'bg-[#3FD17C] text-[#0A0C10] font-bold'
                : 'text-[#7d8b99] hover:text-[#F4F6F8]'
            }`}
          >
            {t.baselineLabel}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('future')}
            className={`px-2 py-0.5 rounded-xs transition-colors ${
              activeMode === 'future'
                ? 'bg-[#FFB238] text-[#0A0C10] font-bold'
                : 'text-[#7d8b99] hover:text-[#F4F6F8]'
            }`}
          >
            {t.estimate2050Label}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compare')}
            className={`px-2 py-0.5 rounded-xs transition-colors ${
              activeMode === 'compare'
                ? 'bg-[#F4F6F8] text-[#0A0C10] font-bold'
                : 'text-[#7d8b99] hover:text-[#F4F6F8]'
            }`}
          >
            {t.overlayLabel}
          </button>
        </div>}
      </div>

      {/* Legend & Telemetry Key */}
      <div className="flex items-center justify-between text-[0.6rem] text-[#7d8b99] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {(activeMode === 'current' || activeMode === 'compare') && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#FFB238]" /> {t.baselineLabel} {t.tempLine}
            </span>
          )}
          {(activeMode === 'future' || activeMode === 'compare') && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-red-400 border-b border-dashed border-red-400" /> {t.tempAnomalyLabel}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#3FD17C]/50 rounded-xs" /> {t.rainBars}
          </span>
        </div>
        <span className="hidden text-[0.68rem] text-[#8f9dac] sm:inline">
          {t.touchHoverHint}
        </span>
      </div>

      {/* 100% Fluid Scalable SVG Chart Container */}
      <div className="w-full relative select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-Axis Gridlines */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={svgWidth - padRight}
            y2={padTop}
            stroke="rgba(232,236,240,0.06)"
            strokeWidth={1}
          />
          <line
            x1={padLeft}
            y1={padTop + chartHeight}
            x2={svgWidth - padRight}
            y2={padTop + chartHeight}
            stroke="rgba(232,236,240,0.12)"
            strokeWidth={1}
          />

          {/* Freeze 0°C Line */}
          {minTemp <= 0 && zeroY >= padTop && zeroY <= padTop + chartHeight && (
            <g>
              <line
                x1={padLeft}
                y1={zeroY}
                x2={svgWidth - padRight}
                y2={zeroY}
                stroke="#38bdf8"
                strokeWidth={0.8}
                strokeDasharray="2 2"
                opacity={0.5}
              />
              <text
                x={padLeft - 4}
                y={zeroY + 3}
                fill="#38bdf8"
                fontSize={8}
                textAnchor="end"
                fontFamily="Space Mono, monospace"
              >
                0°
              </text>
            </g>
          )}

          {/* Left Y-Axis Labels (Temperature) */}
          <text
            x={padLeft - 4}
            y={padTop + 4}
            fill="#FFB238"
            fontSize={8}
            textAnchor="end"
            fontFamily="Space Mono, monospace"
          >
            {maxTemp}°
          </text>
          <text
            x={padLeft - 4}
            y={padTop + chartHeight}
            fill="#FFB238"
            fontSize={8}
            textAnchor="end"
            fontFamily="Space Mono, monospace"
          >
            {minTemp}°
          </text>

          {/* Right Y-Axis Labels (Precipitation) */}
          <text
            x={svgWidth - padRight + 4}
            y={padTop + 4}
            fill="#3FD17C"
            fontSize={8}
            textAnchor="start"
            fontFamily="Space Mono, monospace"
          >
            {maxPrecip}mm
          </text>
          <text
            x={svgWidth - padRight + 4}
            y={padTop + chartHeight}
            fill="#3FD17C"
            fontSize={8}
            textAnchor="start"
            fontFamily="Space Mono, monospace"
          >
            0mm
          </text>

          {/* Monthly Rainfall Bars */}
          {monthlyPrecip.map((p, i) => {
            const barWidth = 14;
            const x = getX(i) - barWidth / 2;
            const curY = getYPrecip(p);
            const curHeight = padTop + chartHeight - curY;

            const futP = futurePrecip[i];
            const futY = getYPrecip(futP);
            const futHeight = padTop + chartHeight - futY;

            const isHovered = hoveredIndex === i;

            return (
              <g
                key={`bar-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(i)}
                className="cursor-pointer"
              >
                {/* 2050 Future bar outline in compare mode */}
                {activeMode === 'compare' && (
                  <rect
                    x={x}
                    y={futY}
                    width={barWidth}
                    height={Math.max(1, futHeight)}
                    fill="none"
                    stroke="#FFB238"
                    strokeWidth={0.9}
                    strokeDasharray="1.5 1.5"
                    opacity={0.85}
                  />
                )}

                {/* Baseline bar */}
                {(activeMode === 'current' || activeMode === 'compare') && (
                  <rect
                    x={x}
                    y={curY}
                    width={barWidth}
                    height={Math.max(1, curHeight)}
                    fill="#3FD17C"
                    fillOpacity={isHovered ? 0.65 : 0.35}
                    rx={1}
                  />
                )}

                {/* Future bar in future-only mode */}
                {activeMode === 'future' && (
                  <rect
                    x={x}
                    y={futY}
                    width={barWidth}
                    height={Math.max(1, futHeight)}
                    fill="#FFB238"
                    fillOpacity={0.45}
                    rx={1}
                  />
                )}

                {/* Month Label Text Inside SVG at Exact Mathematical Center */}
                <text
                  x={getX(i)}
                  y={svgHeight - 6}
                  fill={isHovered ? '#F4F6F8' : '#7d8b99'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontSize={isHovered ? 9 : 8}
                  textAnchor="middle"
                  fontFamily="Space Mono, monospace"
                >
                  {months[i]}
                </text>
              </g>
            );
          })}

          {/* Present Temperature Line */}
          {(activeMode === 'current' || activeMode === 'compare') && (
            <path
              d={linePathCurrent}
              fill="none"
              stroke="#FFB238"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 2050 Projected Temperature Line */}
          {(activeMode === 'future' || activeMode === 'compare') && (
            <path
              d={linePathFuture}
              fill="none"
              stroke="#f87171"
              strokeWidth={2}
              strokeDasharray={activeMode === 'compare' ? '3 2' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Temperature Node Points */}
          {monthlyTemps.map((t, i) => {
            const x = getX(i);
            const y = getYTemp(t);
            const isHovered = hoveredIndex === i;

            return (
              (activeMode === 'current' || activeMode === 'compare') && (
                <circle
                  key={`node-${i}`}
                  cx={x}
                  cy={y}
                  r={isHovered ? 3.5 : 2}
                  fill="#0A0C10"
                  stroke="#FFB238"
                  strokeWidth={1.5}
                />
              )
            );
          })}

          {/* Hover crosshair & indicator */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={padTop}
              x2={getX(hoveredIndex)}
              y2={padTop + chartHeight}
              stroke="#F4F6F8"
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.7}
            />
          )}
        </svg>

        {/* Hover telemetry readout card */}
        {hoveredIndex !== null && (
          <div className="mt-1.5 p-2 rounded bg-[#10141C] border border-[#2a3340] text-[0.68rem] flex items-center justify-between text-[#F4F6F8] shadow-md animate-fadeIn">
            <span className="font-bold text-[#34D67E]">
              {monthNames[hoveredIndex]}:
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                {t.presentLabel}{' '}
                <strong className="text-[#FFB238]">
                  {monthlyTemps[hoveredIndex]}°C
                </strong>{' '}
                /{' '}
                <strong className="text-[#3FD17C]">
                  {monthlyPrecip[hoveredIndex]} mm
                </strong>
              </span>
              {showFuture && <span>
                {t.future2050ArrowLabel}{' '}
                <strong className="text-red-400">
                  {futureTemps[hoveredIndex]}°C
                </strong>{' '}
                /{' '}
                <strong className="text-[#FFB238]">
                  {futurePrecip[hoveredIndex]} mm
                </strong>
              </span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
