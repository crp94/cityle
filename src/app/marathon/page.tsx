'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { Check, ImageIcon, RotateCw, Share2, Trophy, X } from 'lucide-react';
import citiesData from '../../data/curated-cities.json';
import { MarathonRound } from '../../components/MarathonRound';
import { createDefaultAchievementsState, evaluateAchievements } from '../../lib/achievements';
import { getCountryFlag } from '../../lib/geo';
import { getTranslation, Locale, Translations } from '../../lib/i18n';
import {
  computeMarathonScore,
  generateMarathonShareText,
  getMarathonCities,
  getMarathonNumber,
  MARATHON_MAX_GUESSES_PER_ROUND,
  MARATHON_UNSOLVED_PENALTY,
} from '../../lib/marathonLogic';
import { encodeMultiRoundResult } from '../../lib/multiRoundResultEncoding';
import {
  createDefaultStats,
  getAchievementsState,
  getPlayerStats,
  getSavedMarathonState,
  getSettings,
  saveAchievementsState,
  saveMarathonState,
} from '../../lib/storage';
import { City, Difficulty, GameStats, GuessResult, MarathonState } from '../../lib/types';

const cities = citiesData as City[];
const MARATHON_ROUND_COUNT = 5;

type ShareStatus = 'idle' | 'copied' | 'shared' | 'error';

/**
 * Deterministic per marathonNumber (see getMarathonCities) — safe to call on
 * both the server render and the client hydration pass, mirroring how
 * GameApp.tsx lazily resolves dailyNumber/targetCity with no placeholder
 * frame. A saved in-progress/complete marathon (if any) overrides this in
 * the mount effect below, same "flash then correct" tradeoff GameApp
 * already accepts for resumed guesses/status.
 */
function buildFreshMarathonState(): MarathonState {
  const marathonNumber = getMarathonNumber();
  const targetCityIds = getMarathonCities(marathonNumber, cities, MARATHON_ROUND_COUNT).map((city) => city.id);
  return { marathonNumber, targetCityIds, currentIndex: 0, roundResults: [], status: 'playing' };
}

function useMarathonLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    // Deferred via requestAnimationFrame, matching the app's other new
    // standalone pages (e.g. AtlasPickerPage's useAtlasLocale) — calling
    // setState synchronously in the effect body trips the
    // react-hooks/set-state-in-effect lint rule.
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

// Accessibility (Phase 6, Workstream GG): won/lost/current/pending used to be
// color-only (green/red/gold/gray dots) — confirmed indistinguishable under
// deuteranopia/protanopia emulation, since red and gold collapse to nearly
// the same yellow-green hue for those users. Shape now carries the signal
// too: won gets a check glyph, lost an x glyph, current a ring around a
// filled dot, pending a hollow outline — readable in grayscale, not just hue.
function RoundDots({ marathon }: { marathon: MarathonState }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {marathon.targetCityIds.map((cityId, index) => {
        const result = marathon.roundResults[index];
        const isCurrent = marathon.status === 'playing' && index === marathon.currentIndex;
        if (result) {
          return result.won ? (
            <span key={cityId} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3FD17C]">
              <Check className="h-2.5 w-2.5 text-[#0A0C10]" strokeWidth={3.5} />
            </span>
          ) : (
            <span key={cityId} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF4D4D]">
              <X className="h-2.5 w-2.5 text-[#0A0C10]" strokeWidth={3.5} />
            </span>
          );
        }
        return isCurrent ? (
          <span key={cityId} className="h-2.5 w-2.5 rounded-full bg-[#FFB238] ring-2 ring-offset-1 ring-offset-[#0A0C10] ring-[#FFB238]/50" />
        ) : (
          <span key={cityId} className="h-2 w-2 rounded-full border border-[#57626d] bg-transparent" />
        );
      })}
    </span>
  );
}

function MarathonSummary({
  marathon,
  t,
  shareStatus,
  shareText,
  onShare,
  resultShareStatus,
  onShareResult,
}: {
  marathon: MarathonState;
  t: Translations;
  shareStatus: ShareStatus;
  shareText: string;
  onShare: () => void;
  resultShareStatus: ShareStatus;
  onShareResult: () => void;
}) {
  const score = computeMarathonScore(marathon.roundResults);
  // Worst-case per round is MARATHON_UNSOLVED_PENALTY (7), not
  // MARATHON_MAX_GUESSES_PER_ROUND (6) — using the latter here let an
  // all-losses run display a score higher than its own stated maximum.
  const maxScore = marathon.roundResults.length * MARATHON_UNSOLVED_PENALTY;

  return (
    <div className="flex flex-col gap-4">
      <div className="nothing-widget flex flex-col items-center gap-1.5 p-6 text-center sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3FD17C]/15 text-[#3FD17C]">
          <Trophy className="h-5 w-5" />
        </span>
        <p className="stamp text-[#3FD17C]">{t.marathonSummaryEyebrow}</p>
        <h2 className="text-3xl font-bold text-[#F4F6F8] sm:text-4xl">{t.marathonSummaryTitle}</h2>
        <p className="max-w-md text-sm leading-relaxed text-[#8f9dac]">{t.marathonSummarySubtitle}</p>
        <p className="mt-2 text-4xl font-bold text-[#FFB238]">
          {score}
          <span className="text-lg text-[#8f9dac]">/{maxScore}</span>
        </p>
        <p className="stamp text-[#8f9dac]">{t.marathonTotalScoreLabel}</p>
      </div>

      <div className="nothing-widget overflow-x-auto p-3 sm:p-4">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-[#8f9dac]">
              <th className="py-2 pr-2 font-semibold">{t.marathonTableCity}</th>
              <th className="py-2 pr-2 font-semibold">{t.marathonTableGuesses}</th>
              <th className="py-2 pr-2 font-semibold">{t.marathonTableResult}</th>
            </tr>
          </thead>
          <tbody>
            {marathon.roundResults.map((round, index) => {
              const city = cities.find((candidate) => candidate.id === round.targetCityId);
              return (
                <tr key={`${round.targetCityId}-${index}`} className="border-b border-white/6 last:border-0">
                  <td className="py-2 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      {city && <span aria-hidden>{getCountryFlag(city.countryCode)}</span>}
                      <span className="font-semibold text-[#F4F6F8]">{city?.name ?? round.targetCityId}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-[#c5ced7]">
                    {round.won ? round.guessesUsed : `${MARATHON_MAX_GUESSES_PER_ROUND}+`}
                  </td>
                  <td className="py-2 pr-2">
                    {round.won ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3FD17C]">
                        <Check className="h-3.5 w-3.5" /> {t.marathonResultWon}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4D4D]">
                        <X className="h-3.5 w-3.5" /> {t.marathonResultLost}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#3FD17C] px-5 py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#3FD17C]/85"
          >
            {shareStatus === 'copied' || shareStatus === 'shared' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {shareStatus === 'copied' ? t.copied : t.marathonShareCta}
          </button>

          {/* Workstream DD: personalized /marathon/result/[encoded] share
              card link, built from this already-completed run's real
              marathonNumber/roundResults (both already available via
              `marathon` above) — additive alongside the plain-text share
              button, not a replacement for it. */}
          <button
            type="button"
            onClick={onShareResult}
            className="inline-flex items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#F4F6F8] transition-colors hover:bg-white/10"
          >
            {resultShareStatus === 'copied' || resultShareStatus === 'shared' ? (
              <Check className="h-4 w-4" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {resultShareStatus === 'copied'
              ? t.copied
              : resultShareStatus === 'error'
                ? t.shareErrorTitle
                : t.shareResultCard}
          </button>
        </div>
        <p className="text-xs text-[#8f9dac]">{t.marathonComeBackTomorrow}</p>
      </div>

      {shareStatus === 'error' && (
        <div className="rounded-md border border-[#FF4D4D]/35 bg-[#FF4D4D]/8 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB3B3]">{t.shareErrorTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#d6dce1]">{t.shareErrorHint}</p>
          <textarea
            readOnly
            value={shareText}
            onFocus={(event) => event.currentTarget.select()}
            rows={marathon.roundResults.length + 3}
            className="mt-2 w-full resize-none rounded border border-white/15 bg-[#0A0C10] p-2 font-mono text-xs text-[#F4F6F8] focus:border-[#3FD17C] focus:outline-none"
          />
          <button
            type="button"
            onClick={onShare}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#F4F6F8] hover:bg-white/10"
          >
            <RotateCw className="h-3.5 w-3.5" /> {t.retry}
          </button>
        </div>
      )}

      {/* Quiet cross-promotion to sibling modes — deliberately not styled as
          a button so it never competes with the share CTAs above. Shares
          its label/color treatment with the same strip on
          quickfire/playlists/notes (see t.relatedModesLabel). */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="text-xs text-[#5c6773]">{t.relatedModesLabel}</span>
        <Link href="/playlists" className="text-xs font-semibold text-[#8f9dac] hover:text-[#F4F6F8]">
          {t.playlistsPageTitle}
        </Link>
        <Link href="/quickfire" className="text-xs font-semibold text-[#8f9dac] hover:text-[#F4F6F8]">
          {t.quickfireTitle}
        </Link>
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
          {t.marathonBackToCityle}
        </Link>
      </div>
    </div>
  );
}

export default function MarathonPage() {
  const locale = useMarathonLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);

  const [marathon, setMarathon] = useState<MarathonState>(() => buildFreshMarathonState());
  // Read once at mount (mirrors GameApp's own lazy `getSettings().difficulty`
  // read) — Marathon has no per-round Hard Mode toggle of its own, it just
  // plays out whatever the player's current global difficulty setting is,
  // consistently across all 5 rounds of a single run.
  const [difficulty] = useState<Difficulty>(() => getSettings().difficulty);
  const [stats, setStats] = useState<GameStats>(() => createDefaultStats());
  const [achievements, setAchievements] = useState(() => createDefaultAchievementsState());
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  // Workstream DD: separate status for the new personalized-result-card
  // share button, so a copy/share success or failure on it never flips the
  // icon/label on the plain-text share button above.
  const [resultShareStatus, setResultShareStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = getSavedMarathonState();
      if (saved) {
        setMarathon(saved);
      } else {
        // Persist the freshly generated sequence immediately so a reload
        // before round 1 even completes still resumes the same 5-city
        // sequence (getMarathonCities is deterministic per marathonNumber,
        // but pinning the actual saved object is what getSavedMarathonState
        // resumes from on the next load). `marathon` here is still the
        // lazily-created initial state — this effect has an intentionally
        // empty dependency array and only ever runs once, before any round
        // can complete.
        saveMarathonState(marathon);
      }
      setStats(getPlayerStats());
      setAchievements(getAchievementsState());
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const targetCities = useMemo(
    () =>
      marathon.targetCityIds
        .map((id) => cities.find((city) => city.id === id))
        .filter((city): city is City => !!city),
    [marathon.targetCityIds]
  );
  const currentCity = targetCities[marathon.currentIndex];

  const shareText = useMemo(
    () => generateMarathonShareText(marathon.marathonNumber, marathon.roundResults),
    [marathon.marathonNumber, marathon.roundResults]
  );

  // Workstream DD: personalized /marathon/result/[encoded] share card link,
  // built from this already-completed run's real marathonNumber and
  // roundResults (each round's targetCityId plus the ordered guess city ids
  // — resultEncoding.ts-style stable ids, never array indices).
  const resultEncoded = useMemo(
    () =>
      encodeMultiRoundResult({
        kind: 'marathon',
        collectionId: String(marathon.marathonNumber),
        rounds: marathon.roundResults.map((round) => ({
          targetId: round.targetCityId,
          guessIds: round.guesses.map((g) => g.city.id),
        })),
      }),
    [marathon.marathonNumber, marathon.roundResults]
  );

  function handleRoundComplete(result: { guesses: GuessResult[]; guessesUsed: number; won: boolean }) {
    if (!currentCity) return;

    const roundResult = {
      targetCityId: currentCity.id,
      guesses: result.guesses,
      guessesUsed: result.guessesUsed,
      won: result.won,
    };
    const updatedResults = [...marathon.roundResults, roundResult];
    const isLastRound = marathon.currentIndex + 1 >= marathon.targetCityIds.length;
    const nextMarathon: MarathonState = {
      ...marathon,
      roundResults: updatedResults,
      currentIndex: isLastRound ? marathon.currentIndex : marathon.currentIndex + 1,
      status: isLastRound ? 'complete' : 'playing',
    };

    setMarathon(nextMarathon);
    saveMarathonState(nextMarathon);

    // Marathon rounds never call recordDailyResult/recordUnlimitedResult —
    // this mirrors Archive/Challenge's existing exclusion from Daily/
    // Unlimited stats (see GameApp.tsx's `if (mode === 'daily') {...} else if
    // (mode === 'unlimited') {...}` branch, which Marathon has no branch in
    // at all). `stats` therefore never changes across a Marathon run, same
    // as GameApp's own `latestStats = stats` default for archive/challenge.

    track('game_completed', {
      mode: 'marathon',
      difficulty,
      livesMode: getSettings().livesMode,
      won: result.won,
      guessCount: result.guessesUsed,
    });

    // Achievements DO flow from every completed round, unconditionally (win
    // or loss) — the same "counts every mode" rule GameApp.tsx applies
    // whenever nextStatus !== 'playing', regardless of mode.
    const { next: nextAchievements } = evaluateAchievements(achievements, {
      won: result.won,
      guessCount: result.guessesUsed,
      targetCity: currentCity,
      difficulty,
      stats,
    });
    setAchievements(nextAchievements);
    saveAchievementsState(nextAchievements);
  }

  async function handleShare() {
    // Mirrors VictoryModal.tsx's handleShare exactly: try the Web Share API
    // first, fall back to clipboard, and surface a real error state (with a
    // select-and-copy textarea + retry) if both fail — the app's one
    // established share UX pattern, not a new one invented for Marathon.
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cityle Marathon', text: shareText });
        setShareStatus('shared');
        window.setTimeout(() => setShareStatus((s) => (s === 'shared' ? 'idle' : s)), 2200);
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus((s) => (s === 'copied' ? 'idle' : s)), 2200);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('copied');
        window.setTimeout(() => setShareStatus((s) => (s === 'copied' ? 'idle' : s)), 2200);
      } catch {
        setShareStatus('error');
      }
    }
  }

  async function handleShareResult() {
    // Mirrors VictoryModal.tsx's shareOrCopyLink exactly: try the Web Share
    // API first, fall back to clipboard, and revert the button label after a
    // timeout on failure — this is an additive convenience alongside the
    // primary text-share button above, not a replacement for it.
    const url = `${window.location.origin}/marathon/result/${resultEncoded}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cityle Marathon', text: shareText, url });
        setResultShareStatus('shared');
        window.setTimeout(() => setResultShareStatus((s) => (s === 'shared' ? 'idle' : s)), 2200);
        return;
      }
      await navigator.clipboard.writeText(url);
      setResultShareStatus('copied');
      window.setTimeout(() => setResultShareStatus((s) => (s === 'copied' ? 'idle' : s)), 2200);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setResultShareStatus('copied');
        window.setTimeout(() => setResultShareStatus((s) => (s === 'copied' ? 'idle' : s)), 2200);
      } catch {
        setResultShareStatus('error');
        window.setTimeout(() => setResultShareStatus((s) => (s === 'error' ? 'idle' : s)), 2600);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <header className="border-b border-white/10 bg-[#0A0C10]/96 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="stamp text-[#FFB238]">{t.marathonEyebrow.replace('{n}', String(marathon.marathonNumber))}</p>
              <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">{t.marathonPageTitle}</h1>
            </div>
            <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
              {t.marathonBackToCityle}
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-[#8f9dac]">{t.marathonIntro}</p>
          {marathon.status === 'playing' && currentCity && (
            <div className="mt-1 flex items-center gap-3">
              <span className="stamp text-[#3FD17C]">
                {t.marathonRoundProgress
                  .replace('{current}', String(marathon.currentIndex + 1))
                  .replace('{total}', String(marathon.targetCityIds.length))}
              </span>
              <RoundDots marathon={marathon} />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        {marathon.status === 'complete' ? (
          <MarathonSummary
            marathon={marathon}
            t={t}
            shareStatus={shareStatus}
            shareText={shareText}
            onShare={handleShare}
            resultShareStatus={resultShareStatus}
            onShareResult={handleShareResult}
          />
        ) : currentCity ? (
          <MarathonRound
            key={currentCity.id}
            city={currentCity}
            cities={cities}
            difficulty={difficulty}
            maxGuesses={MARATHON_MAX_GUESSES_PER_ROUND}
            onRoundComplete={handleRoundComplete}
            t={t}
            locale={locale}
          />
        ) : (
          <p className="text-sm text-[#8f9dac]">Loading today&apos;s marathon…</p>
        )}
      </main>
    </div>
  );
}
