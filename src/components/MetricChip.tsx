'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { MetricGrade } from '../lib/colorGrading';

interface MetricChipProps {
  label: string;
  value: string | number;
  unit?: string;
  badge?: string;
  badgeColor?: 'accent' | 'gold' | 'default' | 'alert';
  subtext?: string;
  icon?: React.ReactNode;
  grade?: MetricGrade;
  /** Marks this chip as opening further detail (e.g. a modal) so it needs a visible affordance. */
  interactive?: boolean;
}

// Ratings colorGrading.ts treats as "the good end" of a metric (emerald/olive
// badges) vs. "the bad end" (amber/red badges). 'moderate' badges render in
// the same brownish/gold family as 'warning', so it's grouped with the
// unfavorable side rather than treated as a true midpoint. This mirrors — not
// recomputes — the same good/bad call getBadgeClass already makes from
// grade.rating, so the percentile framing below never contradicts the badge
// color sitting right next to it.
const FAVORABLE_RATINGS = new Set(['optimal', 'good']);
const UNFAVORABLE_RATINGS = new Set(['moderate', 'warning', 'critical']);

// All 255 cities in the pool (see curatorNotes.ts) — the denominator behind
// every grade's percentileApprox.
const CITY_POOL_SIZE = 255;

/**
 * Turns a grade's percentileApprox (0-100, where higher always means
 * "further toward the good end of this metric") into a short "top/bottom X%"
 * footnote. Ratings 'neutral' has no inherent good/bad direction (e.g.
 * elevation), so it falls back to whichever half of the pool the percentile
 * itself lands in.
 */
function percentileNote(grade: MetricGrade): string {
  const { rating, percentileApprox } = grade;
  const leansTop = FAVORABLE_RATINGS.has(rating)
    ? true
    : UNFAVORABLE_RATINGS.has(rating)
      ? false
      : percentileApprox >= 50;

  const pct = Math.min(99, Math.max(1, Math.round(leansTop ? 100 - percentileApprox : percentileApprox)));
  return leansTop ? `Top ${pct}% of ${CITY_POOL_SIZE}` : `Bottom ${pct}% of ${CITY_POOL_SIZE}`;
}

export const MetricChip: React.FC<MetricChipProps> = ({
  label,
  value,
  unit,
  badge,
  badgeColor = 'default',
  subtext,
  icon,
  grade,
  interactive = false,
}) => {
  const getBadgeClass = () => {
    if (grade) {
      return `${grade.badgeBg} ${grade.badgeText} ${grade.badgeBorder}`;
    }
    switch (badgeColor) {
      case 'accent':
        return 'text-[#34D67E] border-[#3FD17C]/40 bg-[#3FD17C]/10';
      case 'gold':
        return 'text-[#FFB238] border-[#FFB238]/40 bg-[#FFB238]/10';
      case 'alert':
        return 'text-[#f87171] border-[#ef4444]/40 bg-[#ef4444]/10';
      default:
        return 'text-[#93a4b6] border-[#2a3340] bg-[#10141C]';
    }
  };

  const displayBadge = grade ? grade.label : badge;

  return (
    <div
      className={`flex min-h-20 flex-col rounded border p-2.5 transition-colors ${
        interactive
          ? 'border-[#3FD17C]/40 bg-[#3FD17C]/5 hover:border-[#34D67E]/70 hover:bg-[#3FD17C]/10'
          : 'border-[rgba(232,236,240,0.09)] bg-[#10141C]/70 hover:border-[rgba(232,236,240,0.18)]'
      }`}
    >
      {/* Top row: Icon, Label & Grade Badge */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="stamp flex min-w-0 items-center gap-1 text-[0.65rem] text-[#8f9dac]">
          {icon}
          <span className="min-w-0 truncate">{label}</span>
          {interactive && <Info className="h-3 w-3 shrink-0 text-[#3FD17C]" aria-hidden />}
        </span>
        {(displayBadge || grade) && (
          <span className="flex min-w-0 max-w-[50%] shrink-0 flex-col items-end gap-0.5">
            {displayBadge && (
              <span
                className={`mono w-full min-w-0 shrink-0 truncate rounded border px-1.5 py-0.5 text-[0.62rem] font-semibold ${getBadgeClass()}`}
              >
                {displayBadge}
              </span>
            )}
            {grade && (
              <span
                className="mono w-full min-w-0 truncate text-right text-[0.56rem] font-medium leading-none text-[#5c6773]"
                title="Approximate percentile among this game's city pool"
              >
                {percentileNote(grade)}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Value with color dot if graded */}
      <div className="flex items-baseline gap-1.5">
        {grade && (
          <span
            className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: grade.dotColor }}
          />
        )}
        <span
          className={`font-semibold text-sm sm:text-base mono ${
            interactive ? 'underline decoration-dotted underline-offset-2' : ''
          } ${grade?.badgeText || 'text-[#F4F6F8]'}`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className="mono text-xs text-[#9aa7b3]">{unit}</span>
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <span className="mt-1 text-xs leading-snug text-[#9aa7b3]">
          {subtext}
        </span>
      )}

    </div>
  );
};
