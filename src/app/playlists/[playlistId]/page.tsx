'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { Check, ImageIcon, RotateCw, Share2, Trophy, X } from 'lucide-react';
import citiesData from '../../../data/curated-cities.json';
import { MarathonRound } from '../../../components/MarathonRound';
import { createDefaultAchievementsState, evaluateAchievements } from '../../../lib/achievements';
import { getCountryFlag } from '../../../lib/geo';
import { getTranslation, Locale, Translations } from '../../../lib/i18n';
import {
  computeMarathonScore,
  MARATHON_MAX_GUESSES_PER_ROUND,
  MARATHON_UNSOLVED_PENALTY,
} from '../../../lib/marathonLogic';
import { encodeMultiRoundResult } from '../../../lib/multiRoundResultEncoding';
import { generatePlaylistShareText, getPlaylistById, getPlaylistCities, Playlist } from '../../../lib/playlists';
import {
  createDefaultStats,
  getAchievementsState,
  getPlayerStats,
  getSavedPlaylistState,
  getSettings,
  saveAchievementsState,
  savePlaylistState,
} from '../../../lib/storage';
import { City, Difficulty, GameStats, GuessResult, PlaylistState } from '../../../lib/types';

const cities = citiesData as City[];

type ShareStatus = 'idle' | 'copied' | 'shared' | 'error';

/**
 * A fresh run through `playlist`, starting at round 0. Deterministic per
 * playlist (its `cityIds` are fixed at module load in playlists.ts) — safe
 * to call on both the server render and the client hydration pass, mirroring
 * how marathon/page.tsx's buildFreshMarathonState and GameApp.tsx's lazy
 * dailyNumber/targetCity resolution avoid a placeholder-then-correct flash.
 * A saved in-progress/complete run for this exact playlist (if any) overrides
 * this in the mount effect below, same "flash then correct" tradeoff those
 * already accept for resumed guesses/status.
 */
function buildFreshPlaylistState(playlist: Playlist): PlaylistState {
  return {
    playlistId: playlist.id,
    targetCityIds: playlist.cityIds,
    currentIndex: 0,
    roundResults: [],
    status: 'playing',
  };
}

// Mirrors the locale-restore pattern already used independently by
// GameApp.tsx and every other standalone page added since (Atlas, Almanac,
// Marathon) — deferred via requestAnimationFrame so the state update
// doesn't happen synchronously inside the effect body (trips the
// react-hooks/set-state-in-effect lint rule).
function usePlaylistLocale(): Locale {
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

// Accessibility (Phase 6, Workstream GG): won/lost/current/pending used to be
// color-only (green/red/gold/gray dots) — confirmed indistinguishable under
// deuteranopia/protanopia emulation, since red and gold collapse to nearly
// the same yellow-green hue for those users. Shape now carries the signal
// too: won gets a check glyph, lost an x glyph, current a ring around a
// filled dot, pending a hollow outline — readable in grayscale, not just hue.
// Mirrors marathon/page.tsx's RoundDots exactly (kept as a duplicate rather
// than a shared component, matching this file's existing pattern of mirroring
// Marathon's page-level helpers).
function RoundDots({ playlistState }: { playlistState: PlaylistState }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {playlistState.targetCityIds.map((cityId, index) => {
        const result = playlistState.roundResults[index];
        const isCurrent = playlistState.status === 'playing' && index === playlistState.currentIndex;
        if (result) {
          return result.won ? (
            <span key={`${cityId}-${index}`} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3FD17C]">
              <Check className="h-2.5 w-2.5 text-[#0A0C10]" strokeWidth={3.5} />
            </span>
          ) : (
            <span key={`${cityId}-${index}`} className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF4D4D]">
              <X className="h-2.5 w-2.5 text-[#0A0C10]" strokeWidth={3.5} />
            </span>
          );
        }
        return isCurrent ? (
          <span key={`${cityId}-${index}`} className="h-2.5 w-2.5 rounded-full bg-[#FFB238] ring-2 ring-offset-1 ring-offset-[#0A0C10] ring-[#FFB238]/50" />
        ) : (
          <span key={`${cityId}-${index}`} className="h-2 w-2 rounded-full border border-[#57626d] bg-transparent" />
        );
      })}
    </span>
  );
}

function PlaylistSummary({
  playlist,
  playlistState,
  t,
  shareStatus,
  shareText,
  onShare,
  resultShareStatus,
  onShareResult,
}: {
  playlist: Playlist;
  playlistState: PlaylistState;
  t: Translations;
  shareStatus: ShareStatus;
  shareText: string;
  onShare: () => void;
  resultShareStatus: ShareStatus;
  onShareResult: () => void;
}) {
  const score = computeMarathonScore(playlistState.roundResults);
  // Worst-case per round is MARATHON_UNSOLVED_PENALTY (7), not
  // MARATHON_MAX_GUESSES_PER_ROUND (6) — using the latter here let an
  // all-losses run display a score higher than its own stated maximum.
  const maxScore = playlistState.roundResults.length * MARATHON_UNSOLVED_PENALTY;

  return (
    <div className="flex flex-col gap-4">
      <div className="nothing-widget flex flex-col items-center gap-1.5 p-6 text-center sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3FD17C]/15 text-[#3FD17C]">
          <Trophy className="h-5 w-5" />
        </span>
        <p className="stamp text-[#3FD17C]">{t.playlistSummaryEyebrow}</p>
        <h2 className="text-3xl font-bold text-[#F4F6F8] sm:text-4xl">{t.marathonSummaryTitle}</h2>
        <p className="max-w-md text-sm leading-relaxed text-[#8f9dac]">
          {t.playlistSummarySubtitle.replace('{name}', playlist.name)}
        </p>
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
            {playlistState.roundResults.map((round, index) => {
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
            {shareStatus === 'copied' ? t.copied : t.playlistShareCta}
          </button>

          {/* Workstream DD: personalized /playlists/[playlistId]/result/[encoded]
              share card link, built from this already-completed run's real
              playlist.id/playlistState.roundResults (both already available
              above) — additive alongside the plain-text share button, not a
              replacement for it. */}
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
        <p className="text-xs text-[#8f9dac]">{t.playlistComeBackAnytime}</p>
      </div>

      {shareStatus === 'error' && (
        <div className="rounded-md border border-[#FF4D4D]/35 bg-[#FF4D4D]/8 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB3B3]">{t.shareErrorTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#d6dce1]">{t.shareErrorHint}</p>
          <textarea
            readOnly
            value={shareText}
            onFocus={(event) => event.currentTarget.select()}
            rows={playlistState.roundResults.length + 3}
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
          quickfire/marathon/notes (see t.relatedModesLabel). */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="text-xs text-[#5c6773]">{t.relatedModesLabel}</span>
        <Link href="/marathon" className="text-xs font-semibold text-[#8f9dac] hover:text-[#F4F6F8]">
          {t.marathonPageTitle}
        </Link>
        <Link href="/atlas" className="text-xs font-semibold text-[#8f9dac] hover:text-[#F4F6F8]">
          {t.atlasModeName}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
        <Link href="/playlists" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
          ← {t.playlistsPageTitle}
        </Link>
        <Link href="/" className="text-xs font-semibold text-[#8f9dac] hover:text-[#F4F6F8]">
          {t.marathonBackToCityle}
        </Link>
      </div>
    </div>
  );
}

export default function PlaylistPlayPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const locale = usePlaylistLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);

  // params is a Promise in this Next.js version, and this is a Client
  // Component page, so it's unwrapped with React's `use()` rather than
  // `await` — matches src/app/atlas/[cityA]/[cityB]/page.tsx's exact
  // pattern. All hooks below are called unconditionally on every render, so
  // hook order never depends on whether `playlistId` resolves to a real
  // playlist — the not-found branch is a plain JSX guard at the very end.
  const { playlistId } = use(params);
  const playlist = useMemo(() => getPlaylistById(playlistId), [playlistId]);

  const [playlistState, setPlaylistState] = useState<PlaylistState | null>(() =>
    playlist ? buildFreshPlaylistState(playlist) : null
  );
  // Starts at the safe SSR-matching default and is corrected post-mount in
  // the effect below (same deferred pattern as playlistState/stats/
  // achievements below, and the same fix already applied to marathon/
  // page.tsx and GameApp.tsx's own `difficulty` state) — reading
  // getSettings().difficulty synchronously in the lazy initializer is a real
  // hydration-mismatch bug: SSR has no localStorage and always renders
  // 'standard', but the client's first hydration pass already has
  // localStorage access, so a previously-saved 'hard' rendered immediately
  // and diverged from the server-rendered HTML (confirmed live: a fresh
  // /playlists/[playlistId] load with difficulty: 'hard' saved threw React's
  // "Hydration failed because the server rendered text..." Recoverable
  // Error, in MarathonRound.tsx's clue-count span — same component Marathon
  // renders). A playlist run has no per-round Hard Mode toggle of its own,
  // it just plays out whatever the player's current global difficulty
  // setting is, consistently across every round of a single run.
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [stats, setStats] = useState<GameStats>(() => createDefaultStats());
  const [achievements, setAchievements] = useState(() => createDefaultAchievementsState());
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  // Workstream DD: separate status for the new personalized-result-card
  // share button, so a copy/share success or failure on it never flips the
  // icon/label on the plain-text share button above.
  const [resultShareStatus, setResultShareStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    if (!playlist) return;
    const frame = requestAnimationFrame(() => {
      // getSavedPlaylistState already checks the saved slot's own
      // `playlistId` against the one requested here — a saved run for a
      // *different* playlist (single-slot storage, see storage.ts) is
      // treated as not-present, so switching playlists always starts clean
      // rather than resuming/corrupting a prior run.
      const saved = getSavedPlaylistState(playlist.id);
      if (saved) {
        setPlaylistState(saved);
      } else {
        const fresh = buildFreshPlaylistState(playlist);
        setPlaylistState(fresh);
        savePlaylistState(playlist.id, fresh);
      }
      setStats(getPlayerStats());
      setAchievements(getAchievementsState());
      // `difficulty`'s initial state is a hardcoded SSR-safe default (see
      // its useState above), not the player's real saved preference — needs
      // the same post-mount correction every other localStorage-derived
      // value in this effect gets.
      setDifficulty(getSettings().difficulty);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist?.id]);

  // Resolved via the shared getPlaylistCities helper (playlists.ts) rather
  // than re-deriving city objects from playlistState.targetCityIds by hand
  // — the two are always the same ordered id list for a matching
  // playlistId (targetCityIds is seeded straight from playlist.cityIds and
  // never reordered), so resolving from `playlist` directly is equivalent
  // and keeps this page from duplicating the id->City lookup/defensive-
  // filter logic that already lives in that helper.
  const targetCities = useMemo(() => {
    if (!playlist) return [];
    return getPlaylistCities(playlist, cities);
  }, [playlist]);
  const currentCity = playlistState ? targetCities[playlistState.currentIndex] : undefined;

  const shareText = useMemo(() => {
    if (!playlist || !playlistState) return '';
    return generatePlaylistShareText(playlist, playlistState.roundResults);
  }, [playlist, playlistState]);

  // Workstream DD: personalized /playlists/[playlistId]/result/[encoded]
  // share card link, built from this already-completed run's real
  // playlist.id and playlistState.roundResults (each round's targetCityId
  // plus the ordered guess city ids — resultEncoding.ts-style stable ids,
  // never array indices).
  const resultEncoded = useMemo(() => {
    if (!playlist || !playlistState) return '';
    return encodeMultiRoundResult({
      kind: 'playlist',
      collectionId: playlist.id,
      rounds: playlistState.roundResults.map((round) => ({
        targetId: round.targetCityId,
        guessIds: round.guesses.map((g) => g.city.id),
      })),
    });
  }, [playlist, playlistState]);

  function handleRoundComplete(result: { guesses: GuessResult[]; guessesUsed: number; won: boolean }) {
    if (!playlist || !playlistState || !currentCity) return;

    const roundResult = {
      targetCityId: currentCity.id,
      guesses: result.guesses,
      guessesUsed: result.guessesUsed,
      won: result.won,
    };
    const updatedResults = [...playlistState.roundResults, roundResult];
    const isLastRound = playlistState.currentIndex + 1 >= playlistState.targetCityIds.length;
    const nextState: PlaylistState = {
      ...playlistState,
      roundResults: updatedResults,
      currentIndex: isLastRound ? playlistState.currentIndex : playlistState.currentIndex + 1,
      status: isLastRound ? 'complete' : 'playing',
    };

    setPlaylistState(nextState);
    savePlaylistState(playlist.id, nextState);

    // Playlist rounds never call recordDailyResult/recordUnlimitedResult —
    // mirrors Marathon/Archive/Challenge's existing exclusion from Daily/
    // Unlimited stats.

    track('game_completed', {
      mode: 'playlist',
      playlistId: playlist.id,
      difficulty,
      livesMode: getSettings().livesMode,
      won: result.won,
      guessCount: result.guessesUsed,
    });

    // Achievements DO flow from every completed round, unconditionally (win
    // or loss) — the same "counts every mode" rule the rest of the app
    // applies whenever a round/game ends, regardless of mode.
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
    // Mirrors marathon/page.tsx's handleShare and VictoryModal.tsx's
    // handleShare exactly: try the Web Share API first, fall back to
    // clipboard, and surface a real error state (select-and-copy textarea +
    // retry) if both fail.
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cityle', text: shareText });
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
    // Mirrors marathon/page.tsx's handleShareResult and VictoryModal.tsx's
    // shareOrCopyLink exactly: try the Web Share API first, fall back to
    // clipboard, and revert the button label after a timeout on failure —
    // an additive convenience alongside the primary text-share button above,
    // not a replacement for it.
    if (!playlist) return;
    const url = `${window.location.origin}/playlists/${playlist.id}/result/${resultEncoded}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Cityle', text: shareText, url });
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

  if (!playlist) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0C10] px-4 py-16 text-[#aab6c2] dot-matrix-bg">
        <div className="nothing-widget flex w-full max-w-md flex-col items-center gap-4 p-6 text-center sm:p-8">
          <span className="stamp stamp-gold text-[0.65rem]">{t.playlistPageEyebrow}</span>
          <h1 className="text-xl font-bold text-[#F4F6F8] sm:text-2xl">{t.playlistNotFoundTitle}</h1>
          <p className="text-sm leading-relaxed text-[#8f9dac]">{t.playlistNotFoundMessage}</p>
          <Link
            href="/playlists"
            className="mt-2 inline-flex items-center gap-2 rounded bg-[#3FD17C] px-5 py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#34D67E]"
          >
            {t.playlistsPageTitle}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <header className="border-b border-white/10 bg-[#0A0C10]/96 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="stamp text-[#FFB238]">{t.playlistPageEyebrow}</p>
              <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">{playlist.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/playlists" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
                {t.playlistsPageTitle}
              </Link>
              <Link href="/" className="text-xs font-semibold text-[#8f9dac] hover:text-[#F4F6F8]">
                {t.marathonBackToCityle}
              </Link>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-[#8f9dac]">{playlist.blurb}</p>
          {playlistState && playlistState.status === 'playing' && currentCity && (
            <div className="mt-1 flex items-center gap-3">
              <span className="stamp text-[#3FD17C]">
                {t.marathonRoundProgress
                  .replace('{current}', String(playlistState.currentIndex + 1))
                  .replace('{total}', String(playlistState.targetCityIds.length))}
              </span>
              <RoundDots playlistState={playlistState} />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        {playlistState && playlistState.status === 'complete' ? (
          <PlaylistSummary
            playlist={playlist}
            playlistState={playlistState}
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
          <p className="text-sm text-[#8f9dac]">{t.playlistsPageIntro}</p>
        )}
      </main>
    </div>
  );
}
