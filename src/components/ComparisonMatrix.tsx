'use client';

import { ArrowDown, ArrowUp, CheckCircle2, Compass, Flame } from 'lucide-react';
import { getCountryFlag } from '../lib/geo';
import { Translations } from '../lib/i18n';
import { GuessResult } from '../lib/types';

interface ComparisonMatrixProps {
  guesses: GuessResult[];
  maxGuesses?: number;
  t: Translations;
}

// A non-winning guess this close is a genuine near-miss worth flagging — 80%
// is comfortably above the closeness a guess needs to read as "off by a
// little" rather than "in the right ballpark," and below 100% (which would
// already be a win).
const SO_CLOSE_THRESHOLD = 80;

function comparisonArrow(status: string, t: Translations) {
  if (status === 'exact') return <span className="text-[#34D67E]">{t.matchLabel}</span>;
  if (status === 'lower') return <span className="inline-flex items-center text-[#FFB238]"><ArrowUp className="h-3 w-3" /> {t.higherLabel}</span>;
  return <span className="inline-flex items-center text-[#FFB238]"><ArrowDown className="h-3 w-3" /> {t.lowerLabel}</span>;
}

// koppenComp.status is 4-tier: 'exact' | 'same-subtype' | 'same-group' | 'different'.
// Widened to `string` here (rather than importing the literal union) so this
// stays forward-compatible without re-touching types.ts, which this
// workstream doesn't own.
function koppenLabel(status: string, t: Translations) {
  if (status === 'exact') return <span className="text-[#34D67E]">{t.matchLabel}</span>;
  if (status === 'same-subtype') return <span className="text-[#38BDF8]">{t.sameSubtype}</span>;
  if (status === 'same-group') return <span className="text-[#FFB238]">{t.sameGroup}</span>;
  return <span className="text-[#6B7684]">{t.different}</span>;
}

function ProximityMeter({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value}% proximity to the target`}>
      {[20, 40, 60, 80, 100].map((threshold) => (
        <span
          key={threshold}
          className={`h-2.5 w-2 rounded-[2px] ${
            value >= threshold
              ? 'bg-[#3FD17C]'
              : value > threshold - 20
                ? 'bg-[#FFB238]'
                : 'bg-[#2a3340]'
          }`}
        />
      ))}
    </span>
  );
}

export const ComparisonMatrix = ({ guesses, maxGuesses = 6, t }: ComparisonMatrixProps) => (
  <section className="flex flex-col gap-2" aria-live="polite">
    <div className="flex items-center justify-between px-1">
      <h2 className="stamp text-[0.68rem] text-[#8f9dac]">{t.guessHistory}</h2>
      <span className="text-xs text-[#8f9dac]">{guesses.length}/{maxGuesses}</span>
    </div>

    {guesses.length === 0 ? (
      <div className="rounded-md border border-dashed border-white/10 bg-[#10141C]/55 px-4 py-6 text-center text-sm text-[#8f9dac]">
        {t.comparisonEmptyState}
      </div>
    ) : (
      <ol className="flex flex-col gap-2">
        {[...guesses].reverse().map((guess) => {
          const isSoClose = !guess.isCorrect && guess.closenessPct >= SO_CLOSE_THRESHOLD;
          return (
            <li
              key={`${guess.city.id}-${guess.guessNumber}`}
              className={`editorial-card p-3 ${guess.isCorrect ? 'border-[#3FD17C] bg-[#3FD17C]/10' : ''} ${isSoClose ? 'animate-close-pulse' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-xs text-[#8f9dac]">#{guess.guessNumber}</span>
                  <span aria-hidden>{getCountryFlag(guess.city.countryCode)}</span>
                  <strong className="truncate text-sm text-[#eef1f3]">{guess.city.name}</strong>
                  <span className="hidden truncate text-xs text-[#8f9dac] sm:inline">{guess.city.country}</span>
                  {isSoClose && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-[#FFB238]/50 bg-[#FFB238]/15 px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-[#FFB238]">
                      <Flame className="h-3 w-3" /> {t.soCloseFlag}
                    </span>
                  )}
                </div>
                {guess.isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3FD17C]"><CheckCircle2 className="h-4 w-4" /> {t.targetFound}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d7dde2]">
                    <Compass className="h-3.5 w-3.5 text-[#3FD17C]" />
                    {guess.distanceKm.toLocaleString()} km · {guess.bearingArrow} {guess.bearingCompass}
                    <ProximityMeter value={guess.closenessPct} />
                  </span>
                )}
              </div>

              {!guess.isCorrect && (
                <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-white/6 pt-2 text-[0.68rem]">
                  <span className="rounded bg-[#0A0C10] px-2 py-1.5 text-center text-[#aab6c2]">
                    {guess.countryMatch ? t.sameCountry : guess.continentMatch ? t.region : t.otherRegion}
                  </span>
                  <span className="rounded bg-[#0A0C10] px-2 py-1.5 text-center text-[#aab6c2]">
                    {t.populationLabel} {comparisonArrow(guess.populationComp.status, t)}
                  </span>
                  <span className="rounded bg-[#0A0C10] px-2 py-1.5 text-center text-[#aab6c2]">
                    {t.statClimate} {koppenLabel(guess.koppenComp.status, t)}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    )}
  </section>
);
