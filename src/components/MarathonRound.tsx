'use client';

import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { ComparisonMatrix } from './ComparisonMatrix';
import { Dossier } from './Dossier';
import { SearchInput } from './SearchInput';
import { evaluateGuess, getUnlockedClues } from '../lib/gameLogic';
import { Locale, Translations } from '../lib/i18n';
import { City, Difficulty, GuessResult } from '../lib/types';

export interface MarathonRoundResult {
  guesses: GuessResult[];
  guessesUsed: number;
  won: boolean;
}

interface MarathonRoundProps {
  /** This round's target city. Rendered by the caller with `key={city.id}` so
   * a new round gets fully fresh internal state via remount, mirroring how
   * Dossier.tsx resets its own token-economy state per city. */
  city: City;
  cities: City[];
  difficulty: Difficulty;
  maxGuesses: number;
  onRoundComplete: (result: MarathonRoundResult) => void;
  t: Translations;
  locale: Locale;
}

/**
 * One Marathon round: a single-target guessing session built from the same
 * pieces GameApp.tsx wires together for a normal game (SearchInput,
 * evaluateGuess, ComparisonMatrix, Dossier) — not a wrapper around GameApp
 * itself. All round-to-round orchestration (accumulating roundResults,
 * saving MarathonState, advancing currentIndex, achievements, analytics)
 * lives in the caller (src/app/marathon/page.tsx); this component only owns
 * the guesses/status for the round currently on screen and reports the
 * outcome once via onRoundComplete.
 */
export function MarathonRound({
  city,
  cities,
  difficulty,
  maxGuesses,
  onRoundComplete,
  t,
  locale,
}: MarathonRoundProps) {
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const guessedIds = useMemo(() => guesses.map((guess) => guess.city.id), [guesses]);
  const unlockedClueCount = useMemo(
    () => Object.values(getUnlockedClues(guesses.length, difficulty)).filter(Boolean).length,
    [guesses.length, difficulty]
  );

  function handleSelectCity(guessCity: City) {
    if (status !== 'playing' || guesses.length >= maxGuesses) return;

    const result = evaluateGuess(guessCity, city, guesses.length + 1);
    const updatedGuesses = [...guesses, result];
    const nextStatus: 'playing' | 'won' | 'lost' = result.isCorrect
      ? 'won'
      : updatedGuesses.length === maxGuesses
        ? 'lost'
        : 'playing';

    setGuesses(updatedGuesses);
    setStatus(nextStatus);

    if (nextStatus !== 'playing') {
      onRoundComplete({
        guesses: updatedGuesses,
        guessesUsed: updatedGuesses.length,
        won: nextStatus === 'won',
      });
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-5">
      <aside className="order-1 flex flex-col gap-3 md:order-2 md:col-span-5 md:sticky md:top-20">
        <section aria-labelledby="marathon-guess-heading" className="nothing-widget p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 id="marathon-guess-heading" className="stamp text-[0.7rem] text-[#FFB238]">
              {t.submitGuess} · {t.guessesLeft.replace('{n}', String(maxGuesses - guesses.length))}
            </h2>
            {status !== 'playing' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3FD17C]">
                <Trophy className="h-3.5 w-3.5" /> {status === 'won' ? t.targetFound : t.mysteryRevealed}
              </span>
            )}
          </div>
          <SearchInput
            cities={cities}
            onSelectCity={handleSelectCity}
            disabled={status !== 'playing'}
            alreadyGuessedIds={guessedIds}
            t={t}
          />
        </section>

        <ComparisonMatrix guesses={guesses} maxGuesses={maxGuesses} t={t} />
      </aside>

      <section className="order-2 flex flex-col gap-2 md:order-1 md:col-span-7" aria-labelledby="marathon-dossier-heading">
        <div className="flex items-center justify-between px-1">
          <h2 id="marathon-dossier-heading" className="stamp text-[0.7rem] font-bold text-[#3FD17C]">
            {t.urbanDossier}
          </h2>
          <span className="text-xs text-[#8f9dac]">{t.cluesFraction} {unlockedClueCount}/6</span>
        </div>
        <Dossier city={city} guessCount={guesses.length} difficulty={difficulty} t={t} locale={locale} />
      </section>
    </div>
  );
}
