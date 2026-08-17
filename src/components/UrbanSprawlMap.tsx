'use client';

import React, { useRef, useState, useCallback } from 'react';
import { City } from '../lib/types';
import { Translations } from '../lib/i18n';
import { Lock, ZoomIn, ZoomOut, RotateCcw, MapPin, Compass } from 'lucide-react';

interface UrbanSprawlMapProps {
  city: City;
  isUnlocked: boolean;
  guessCount: number;
  unlockedAtGuess?: number;
  t: Translations;
}

export const UrbanSprawlMap: React.FC<UrbanSprawlMapProps> = ({
  city,
  isUnlocked,
  guessCount,
  unlockedAtGuess = 4,
  t,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(11);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Convert (lat, lng) to tile pixel coordinates at current zoom level
  const projectToPixels = useCallback(
    (lat: number, lng: number, zoom: number) => {
      const n = Math.pow(2, zoom);
      const x = ((lng + 180) / 360) * n * 256;
      const latRad = (lat * Math.PI) / 180;
      const y =
        ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n * 256;
      return { x, y };
    },
    []
  );

  // Compute tile grid around the city center
  const centerPixels = projectToPixels(city.lat, city.lng, zoomLevel);

  // 5x5 grid of tiles to cover full viewport with panning room
  const tiles = [];
  const baseTileX = Math.floor(centerPixels.x / 256);
  const baseTileY = Math.floor(centerPixels.y / 256);
  const subservers = ['a', 'b', 'c', 'd'];

  const maxTiles = Math.pow(2, zoomLevel);

  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const tileX = (baseTileX + dx + maxTiles) % maxTiles;
      const tileY = baseTileY + dy;

      if (tileY >= 0 && tileY < maxTiles) {
        const sub = subservers[Math.abs(tileX + tileY) % subservers.length];
        const url = `https://${sub}.basemaps.cartocdn.com/rastertiles/dark_nolabels/${zoomLevel}/${tileX}/${tileY}.png`;

        const posX = (baseTileX + dx) * 256 - centerPixels.x + panOffset.x;
        const posY = (baseTileY + dy) * 256 - centerPixels.y + panOffset.y;

        tiles.push({
          key: `${zoomLevel}-${tileX}-${tileY}`,
          url,
          posX,
          posY,
        });
      }
    }
  }

  // Calculate real scale in meters (at this latitude and zoom)
  const metersPerPixel =
    (156543.03392 * Math.cos((city.lat * Math.PI) / 180)) / Math.pow(2, zoomLevel);
  const scaleBarWidthPx = Math.round(5000 / metersPerPixel);
  const fifteenMinuteRadiusPx = Math.min(
    140,
    Math.max(8, Math.round(1200 / metersPerPixel))
  );

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(11);
    setPanOffset({ x: 0, y: 0 });
  };

  // Zooming must rescale panOffset (a raw screen-pixel delta) by the same factor
  // the tile pixel-space scales by (2^zoom * 256), otherwise the visually-centered
  // point jumps to a different real-world location after panning away from center.
  const zoomBy = (delta: number) => {
    setZoomLevel((z) => {
      const newZoom = Math.min(13, Math.max(9, z + delta));
      if (newZoom !== z) {
        const scale = Math.pow(2, newZoom - z);
        setPanOffset((p) => ({ x: p.x * scale, y: p.y * scale }));
      }
      return newZoom;
    });
  };

  return (
    <div className="nothing-widget p-3 sm:p-4 flex flex-col gap-2.5 relative overflow-hidden">
      {/* Top Banner / Clue Indicator */}
      <div className="flex items-center justify-between border-b border-[rgba(232,236,240,0.06)] pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#3FD17C]" />
          <h3 className="text-sm font-semibold text-[#F4F6F8]">
            05 · {t.visualClueTitle}
          </h3>
        </div>
        <div>
          {isUnlocked ? (
            <span className="stamp text-[0.65rem] text-[#34D67E] mono">
              {t.mapUnlocked}
            </span>
          ) : (
            <span className="stamp text-[0.65rem] text-[#FFB238] mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> {t.unlocksOnGuessN.replace('{n}', String(unlockedAtGuess))}
            </span>
          )}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div
        ref={containerRef}
        onMouseDown={isUnlocked ? handleMouseDown : undefined}
        onMouseMove={isUnlocked ? handleMouseMove : undefined}
        onMouseUp={isUnlocked ? handleMouseUp : undefined}
        onMouseLeave={isUnlocked ? handleMouseUp : undefined}
        onTouchStart={isUnlocked ? handleTouchStart : undefined}
        onTouchMove={isUnlocked ? handleTouchMove : undefined}
        onTouchEnd={isUnlocked ? handleTouchEnd : undefined}
        aria-label={t.visualClueTitle}
        className="relative aspect-video w-full rounded bg-[#090d12] border border-[rgba(232,236,240,0.1)] overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none"
      >
        {isUnlocked ? (
          <>
            {/* Real GIS Dark Matter Tiles Layer without labels */}
            <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
              <div className="relative w-0 h-0">
                {tiles.map((tile) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={tile.key}
                    src={tile.url}
                    alt=""
                    loading="eager"
                    draggable={false}
                    className="absolute w-[256px] h-[256px] max-w-none pointer-events-none filter brightness-[3.8] contrast-[1.15] saturate-[1.3]"
                    style={{
                      left: `${tile.posX}px`,
                      top: `${tile.posY}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Subtle Crosshairs in Center with 1.2km radius */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className="absolute rounded-full border border-dashed border-[#FFB238]/75 bg-[#FFB238]/5"
                style={{
                  width: `${fifteenMinuteRadiusPx * 2}px`,
                  height: `${fifteenMinuteRadiusPx * 2}px`,
                }}
              />
              <div className="w-3 h-3 border border-[#3FD17C]/60 rounded-full bg-[#0A0C10]/30" />
              <div className="absolute w-6 h-px bg-[#3FD17C]/30" />
              <div className="absolute h-6 w-px bg-[#3FD17C]/30" />
            </div>

            <div className="absolute left-2 top-2 rounded border border-[#FFB238]/35 bg-[#10141C]/92 px-2 py-1 text-[0.65rem] text-[#FFB238]">
              {t.fifteenMinWalkBadge}
            </div>

            {/* Interactive Zoom Controls */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
              <button
                type="button"
                onClick={() => zoomBy(1)}
                title={t.zoomIn}
                aria-label={t.zoomIn}
                className="flex min-h-11 min-w-11 items-center justify-center rounded bg-[#10141C]/90 border border-[#2a3340] text-[#93a4b6] hover:text-[#F4F6F8] hover:bg-[#18212e] transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(-1)}
                title={t.zoomOut}
                aria-label={t.zoomOut}
                className="flex min-h-11 min-w-11 items-center justify-center rounded bg-[#10141C]/90 border border-[#2a3340] text-[#93a4b6] hover:text-[#F4F6F8] hover:bg-[#18212e] transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetView}
                title={t.resetView}
                aria-label={t.resetView}
                className="flex min-h-11 min-w-11 items-center justify-center rounded bg-[#10141C]/90 border border-[#2a3340] text-[#93a4b6] hover:text-[#F4F6F8] hover:bg-[#18212e] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Real Scale Bar (5 km) */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2 py-1 rounded bg-[#10141C]/90 border border-[#2a3340] text-[0.65rem] mono text-[#9aa7b3] backdrop-blur-xs">
              <div className="flex items-center gap-1">
                <span
                  className="inline-block h-1 bg-[#F4F6F8] border-l border-r border-[#3FD17C]"
                  style={{ width: `${Math.min(100, Math.max(25, scaleBarWidthPx))}px` }}
                />
                <span className="font-bold text-[#F4F6F8]">5 km</span>
              </div>
            </div>

            {/* North Compass Indicator */}
            <div className="absolute bottom-2 right-2 px-1.5 py-1 rounded bg-[#10141C]/90 border border-[#2a3340] text-[0.68rem] mono text-[#9aa7b3] flex items-center gap-1 backdrop-blur-xs">
              <Compass className="w-3 h-3 text-[#3FD17C]" />
              <span>N</span>
            </div>
            <a
              href="https://carto.com/attributions"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-[#10141C]/90 px-1.5 py-1 text-[0.62rem] text-[#aab6c2] underline underline-offset-2"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <span className="hidden sm:inline">© OpenStreetMap · © CARTO</span>
              <span className="sm:hidden">© CARTO</span>
            </a>
          </>
        ) : (
          /* Locked State Frosted Overlay */
          <div className="absolute inset-0 bg-[#0A0C10]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-10 h-10 rounded-full border border-[#FFB238]/40 bg-[#FFB238]/10 flex items-center justify-center text-[#FFB238] mb-2 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#F4F6F8] mono mb-1">
              {t.urbanMapLocked}
            </h4>
            <p className="text-[0.72rem] text-[#8a97a5] max-w-xs mb-3">
              {t.urbanMapLockedDesc}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-6 h-1.5 rounded-xs ${
                      guessCount >= step ? 'bg-[#3FD17C]' : 'bg-[#2a3340]'
                    }`}
                  />
                ))}
              </div>
              <span className="stamp text-[0.6rem] text-[#FFB238]">
                {guessCount >= unlockedAtGuess
                  ? t.readyBadge
                  : t.unlocksOnGuessN.replace('{n}', String(unlockedAtGuess))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
