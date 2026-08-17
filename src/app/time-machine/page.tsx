'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock4, CloudRain, MapPin, RotateCw, Thermometer, Trophy } from 'lucide-react';
import citiesData from '../../data/curated-cities.json';
import { ComparisonMatrix } from '../../components/ComparisonMatrix';
import { MetricChip } from '../../components/MetricChip';
import { SearchInput } from '../../components/SearchInput';
import { evaluateGuess } from '../../lib/gameLogic';
import { getCountryFlag } from '../../lib/geo';
import { getTranslation, Locale, Translations } from '../../lib/i18n';
import { buildSyntheticFutureTarget, getRandomTimeMachineTarget } from '../../lib/timeMachineLogic';
import { City, GuessResult } from '../../lib/types';

const cities = citiesData as City[];
const MAX_GUESSES = 6;

// Mirrors VictoryModal.tsx's WIN_LADDER exactly (duplicated locally rather
// than imported/shared, matching how marathon/page.tsx and
// playlists/[playlistId]/page.tsx already each keep their own local copy of
// small page-level helpers like RoundDots instead of factoring out a shared
// module for a handful of lines). Index 0 unused so guesses.length can index
// directly without an off-by-one.
const WIN_LADDER: Array<{ headline: keyof Translations; subline: keyof Translations }> = [
  { headline: 'winHeadline1', subline: 'winSubline1' },
  { headline: 'winHeadline2', subline: 'winSubline2' },
  { headline: 'winHeadline3', subline: 'winSubline3' },
  { headline: 'winHeadline4', subline: 'winSubline4' },
  { headline: 'winHeadline5', subline: 'winSubline5' },
  { headline: 'winHeadline6', subline: 'winSubline6' },
];

// Mirrors marathon/page.tsx's useMarathonLocale / playlists' usePlaylistLocale
// exactly — deferred via requestAnimationFrame so the state update doesn't
// happen synchronously inside the effect body (trips the
// react-hooks/set-state-in-effect lint rule).
function useTimeMachineLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('cityle_locale') as Locale | null;
        if (saved && ['en', 'es', 'it'].includes(saved)) {
          setLocale(saved);
        }
      } catch {
        // Storage may be unavailable in strict privacy modes — fall back to 'en'.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return locale;
}

function TimeMachineReveal({
  status,
  realTarget,
  guesses,
  t,
  onPlayAgain,
}: {
  status: 'won' | 'lost';
  realTarget: City;
  guesses: GuessResult[];
  t: Translations;
  onPlayAgain: () => void;
}) {
  const won = status === 'won';
  // Guesses can't exceed MAX_GUESSES (6, matching WIN_LADDER's length), and a
  // reveal never renders with zero guesses (status only leaves 'playing'
  // after at least one guess) — clamped defensively anyway.
  const ladderIndex = Math.min(Math.max(guesses.length, 1), WIN_LADDER.length) - 1;
  const ladderHeadline = won ? t[WIN_LADDER[ladderIndex].headline] : t.lossHeadline;
  const ladderSubline = won ? t[WIN_LADDER[ladderIndex].subline] : t.lossSubline;
  const color = won ? '#3FD17C' : '#FF4D4D';

  return (
    <div className={`nothing-widget p-4 sm:p-5 ${won ? 'border-[#3FD17C]/40' : 'border-[#FF4D4D]/40'}`}>
      <div
        className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}26`, color }}
      >
        {won ? <Trophy className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
      </div>
      <p className="stamp text-[0.68rem]" style={{ color }}>
        {won ? t.cityIdentified : t.mysteryRevealed}
      </p>
      <h2 className="mt-1 text-3xl font-bold leading-[0.95] tracking-tight sm:text-4xl" style={{ color }}>
        {ladderHeadline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#c8d0d8]">{ladderSubline}</p>

      <p className="mt-4 stamp text-[0.62rem] text-[#8f9dac]">{t.timeMachineRevealIntro}</p>
      <p className="mt-1 text-lg font-semibold text-[#F4F6F8]">
        {getCountryFlag(realTarget.countryCode)} {realTarget.name}
      </p>
      <p className="mt-1 text-sm text-[#9aa7b3]">
        {realTarget.country} · {realTarget.continent} ·{' '}
        {won ? t.solvedInGuesses.replace('{n}', String(guesses.length)) : t.completedAttempts}
      </p>

      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#3FD17C] px-5 py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#3FD17C]/85"
      >
        <RotateCw className="h-4 w-4" /> {t.timeMachinePlayAgain}
      </button>

      {/* Quiet, secondary — small text links, not buttons, so this never
          competes with "Play Again" above for attention. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8f9dac]">
        <span>{t.timeMachineRelatedLabel}</span>
        <Link href="/quickfire" className="underline decoration-white/20 underline-offset-2 hover:text-[#F4F6F8]">
          {t.timeMachineRelatedQuickfire}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/notes" className="underline decoration-white/20 underline-offset-2 hover:text-[#F4F6F8]">
          {t.timeMachineRelatedNotes}
        </Link>
      </div>
    </div>
  );
}

export default function TimeMachinePage() {
  const locale = useTimeMachineLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);

  // Climate Time Machine is a freely-repeatable practice mode (see
  // timeMachineLogic.ts) — not day-locked, no saved GameState/localStorage
  // slot, a fresh random target every visit or "Play Again". Genuinely
  // random (Math.random(), via getRandomTimeMachineTarget) rather than
  // GameApp's deterministic dailyNumber-seeded pick, so it's deliberately
  // resolved here inside the mount effect (client-only) instead of a lazy
  // useState initializer: a server-rendered random pick and the client's own
  // hydration-pass random pick would very likely disagree and trip a
  // hydration mismatch. `null` is a genuine "haven't picked yet" loading
  // state, not a placeholder-then-flash — nothing about the synthetic
  // profile below is rendered until a real target has actually been picked.
  const [realTarget, setRealTarget] = useState<City | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  // Derived from guesses rather than tracked as its own state: won iff the
  // most recent guess matched the target, lost iff MAX_GUESSES have been
  // used up without a match, playing otherwise. Keeping this derived (instead
  // of a separately-set 'playing' | 'won' | 'lost' state) rules out the two
  // ever disagreeing.
  const status: 'playing' | 'won' | 'lost' = useMemo(() => {
    if (guesses[guesses.length - 1]?.isCorrect) return 'won';
    if (guesses.length >= MAX_GUESSES) return 'lost';
    return 'playing';
  }, [guesses]);
  // Bumped on every "Play Again" so <SearchInput>'s internal query/dropdown
  // state remounts fresh for the new round, the same remount-via-key trick
  // MarathonRound relies on (`key={city.id}`) between rounds elsewhere.
  const [roundKey, setRoundKey] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRealTarget(getRandomTimeMachineTarget(cities));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // The ONLY new logic this whole mode adds — a synthetic "2050" City built
  // from the real target's own required 2050-projection fields. Everything
  // downstream (evaluateGuess, ComparisonMatrix) is the same, unmodified
  // machinery every other mode in the app already uses.
  const syntheticTarget = useMemo(
    () => (realTarget ? buildSyntheticFutureTarget(realTarget) : null),
    [realTarget]
  );

  const guessedIds = useMemo(() => guesses.map((guess) => guess.city.id), [guesses]);

  function handleSelectCity(guessCity: City) {
    if (!syntheticTarget || status !== 'playing' || guesses.length >= MAX_GUESSES) return;

    const result = evaluateGuess(guessCity, syntheticTarget, guesses.length + 1);
    setGuesses([...guesses, result]);
  }

  function handlePlayAgain() {
    setGuesses([]);
    setRealTarget(getRandomTimeMachineTarget(cities));
    setRoundKey((key) => key + 1);
  }

  const rainShiftValue = realTarget
    ? `${realTarget.precip_2050_shift_pct > 0 ? '+' : ''}${realTarget.precip_2050_shift_pct}`
    : '';

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <header className="border-b border-white/10 bg-[#0A0C10]/96 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-3 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38BDF8]/12 text-[#38BDF8]">
                <Clock4 className="h-4 w-4" />
              </span>
              <div>
                <p className="stamp text-[#38BDF8]">{t.timeMachineEyebrow}</p>
                <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">{t.timeMachinePageTitle}</h1>
              </div>
            </div>
            <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
              {t.marathonBackToCityle}
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-[#8f9dac]">{t.timeMachineIntro}</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
        {!realTarget || !syntheticTarget ? (
          <p className="text-sm text-[#8f9dac]">{t.timeMachineLoading}</p>
        ) : (
          <>
            {/* The hook: the synthetic 2050 profile, shown prominently up
                front — this display IS the mode's premise, not a recap of
                it. Only the three fields that actually differ from today
                (Köppen class, mean temp, rainfall) are shown; everything
                else about the target stays exactly as hidden as in a normal
                game. */}
            <div className="nothing-widget border-[#38BDF8]/35 bg-[#10141C]/92 p-4 sm:p-6">
              <h2 className="text-2xl font-bold leading-snug text-[#F4F6F8] sm:text-3xl">
                {t.timeMachineHookTitle}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#8f9dac] sm:text-base">
                {t.timeMachineHookSubtitle}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <MetricChip
                  label={t.koppen2050Label}
                  value={syntheticTarget.koppen_current.code}
                  subtext={syntheticTarget.koppen_current.name}
                  icon={<Clock4 className="h-3.5 w-3.5" />}
                />
                <MetricChip
                  label={t.timeMachineProjectedTempLabel}
                  value={syntheticTarget.temp_mean_annual_c.toFixed(1)}
                  unit="°C"
                  icon={<Thermometer className="h-3.5 w-3.5" />}
                />
                <MetricChip
                  label={t.rainShiftLabel}
                  value={rainShiftValue}
                  unit="%"
                  icon={<CloudRain className="h-3.5 w-3.5" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
              <aside className="flex flex-col gap-3 md:col-span-5">
                {status === 'playing' ? (
                  <section aria-labelledby="time-machine-guess-heading" className="nothing-widget p-3 sm:p-4">
                    <h2 id="time-machine-guess-heading" className="mb-2 stamp text-[0.7rem] text-[#FFB238]">
                      {t.submitGuess} · {t.guessesLeft.replace('{n}', String(MAX_GUESSES - guesses.length))}
                    </h2>
                    <SearchInput
                      key={roundKey}
                      cities={cities}
                      onSelectCity={handleSelectCity}
                      disabled={status !== 'playing'}
                      alreadyGuessedIds={guessedIds}
                      t={t}
                    />
                  </section>
                ) : (
                  <TimeMachineReveal
                    status={status}
                    realTarget={realTarget}
                    guesses={guesses}
                    t={t}
                    onPlayAgain={handlePlayAgain}
                  />
                )}
              </aside>

              <section className="md:col-span-7">
                <ComparisonMatrix guesses={guesses} maxGuesses={MAX_GUESSES} t={t} />
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
