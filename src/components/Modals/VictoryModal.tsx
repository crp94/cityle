'use client';

import confetti from 'canvas-confetti';
import { ArrowRight, Award, Check, HeartHandshake, ImageIcon, MapPin, RotateCw, Share2, Swords, Trophy, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { encodeChallenge } from '../../lib/challengeCode';
import { generateShareText } from '../../lib/gameLogic';
import { getCountryFlag } from '../../lib/geo';
import { Translations } from '../../lib/i18n';
import { encodeResult } from '../../lib/resultEncoding';
import { City, GameMode, GuessResult } from '../../lib/types';
import { useDialogA11y } from '../../lib/useDialogA11y';
import { RobinsonMap } from '../RobinsonMap';

type ShareStatus = 'idle' | 'copied' | 'shared' | 'error';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCity: City;
  guesses: GuessResult[];
  won: boolean;
  mode: GameMode;
  dailyNumber: number;
  onPlayNextUnlimited?: () => void;
  /** Ids newly unlocked by this game's result (4.5); optional, shown only when non-empty. */
  newlyUnlockedBadges?: string[];
  /**
   * The Daily-mode streak count as it stood immediately BEFORE this loss
   * reset it to 0 (i.e. `stats.currentStreak` read just before
   * `recordDailyResult` runs) — only meaningful/passed for a daily loss with
   * an active streak going in. Powers the streak-aware loss subline; absent
   * (or 0) falls back to the plain loss subline.
   */
  streakBeforeLoss?: number;
  t: Translations;
}

// Guess-count-indexed win ladder (1-6). Index 0 unused so guesses.length can
// index directly without an off-by-one.
const WIN_LADDER: Array<{ headline: keyof Translations; subline: keyof Translations }> = [
  { headline: 'winHeadline1', subline: 'winSubline1' },
  { headline: 'winHeadline2', subline: 'winSubline2' },
  { headline: 'winHeadline3', subline: 'winSubline3' },
  { headline: 'winHeadline4', subline: 'winSubline4' },
  { headline: 'winHeadline5', subline: 'winSubline5' },
  { headline: 'winHeadline6', subline: 'winSubline6' },
];

export const VictoryModal = ({
  isOpen,
  onClose,
  targetCity,
  guesses,
  won,
  mode,
  dailyNumber,
  onPlayNextUnlimited,
  newlyUnlockedBadges,
  streakBeforeLoss,
  t,
}: VictoryModalProps) => {
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  // Separate status per new CTA (Workstream H) so a copy/share success or
  // failure on one button never flips the icon/label on the other two.
  const [resultShareStatus, setResultShareStatus] = useState<ShareStatus>('idle');
  const [challengeShareStatus, setChallengeShareStatus] = useState<ShareStatus>('idle');
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose);

  const shareText = useMemo(
    () => generateShareText(dailyNumber, guesses, won, mode),
    [dailyNumber, guesses, won, mode]
  );

  // `guesses[].city.id` and `targetCity.id` are already real, ordered city
  // ids straight from props — no additional data needed from GameApp to
  // build either link (see resultEncoding.ts / challengeCode.ts formats).
  const resultEncoded = useMemo(
    () => encodeResult(mode, dailyNumber, targetCity.id, guesses.map((g) => g.city.id)),
    [mode, dailyNumber, targetCity, guesses]
  );
  const challengeCode = useMemo(() => encodeChallenge(targetCity.id), [targetCity]);

  useEffect(() => {
    if (!isOpen || !won || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    void confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#3FD17C', '#FFB238', '#F4F6F8'],
    });
  }, [isOpen, won]);

  if (!isOpen) return null;

  // Win/loss reaction ladder: the guess-count-indexed word (won) or the loss
  // state (with a streak-aware variant when a real streak just broke).
  const ladderIndex = Math.min(Math.max(guesses.length, 1), 6) - 1;
  const ladderHeadline = won ? t[WIN_LADDER[ladderIndex].headline] : t.lossHeadline;
  const hasBrokenStreak = !won && mode === 'daily' && !!streakBeforeLoss && streakBeforeLoss > 0;
  const ladderSubline = won
    ? t[WIN_LADDER[ladderIndex].subline]
    : hasBrokenStreak
      ? t.lossStreakSubline.replace('{n}', String(streakBeforeLoss))
      : t.lossSubline;

  // Shared by handleShareResult/handleChallengeFriend below (Workstream H's
  // two new CTAs) — same share-then-clipboard-fallback shape as handleShare
  // just above, but generalized over which status setter to update since
  // there are now three independent share buttons in this modal. Unlike
  // handleShare's error case, a failure here just reverts the button label
  // after a timeout instead of opening a persistent retry textarea — these
  // two buttons are additive conveniences, not the primary share path.
  async function shareOrCopyLink(
    url: string,
    title: string,
    text: string,
    setStatus: Dispatch<SetStateAction<ShareStatus>>
  ) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setStatus('shared');
        window.setTimeout(() => setStatus((s) => (s === 'shared' ? 'idle' : s)), 2200);
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      window.setTimeout(() => setStatus((s) => (s === 'copied' ? 'idle' : s)), 2200);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setStatus('copied');
        window.setTimeout(() => setStatus((s) => (s === 'copied' ? 'idle' : s)), 2200);
      } catch {
        setStatus('error');
        window.setTimeout(() => setStatus((s) => (s === 'error' ? 'idle' : s)), 2600);
      }
    }
  }

  function handleShareResult() {
    const url = `${window.location.origin}/result/${resultEncoded}`;
    void shareOrCopyLink(url, 'Cityle', shareText, setResultShareStatus);
  }

  function handleChallengeFriend() {
    const url = `${window.location.origin}/challenge/${challengeCode}`;
    void shareOrCopyLink(
      url,
      'Cityle Challenge',
      `Think you can find this city faster than me? ${url}`,
      setChallengeShareStatus
    );
  }

  async function handleShare() {
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
        // Genuine failure — surface real feedback instead of a silent no-op.
        // Does NOT auto-clear: the fallback textarea/retry stays visible
        // until the user acts (retry) or closes the modal.
        setShareStatus('error');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="result-title" className="relative flex max-h-[92vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-lg border border-white/15 bg-[#10141C] p-4 text-[#F4F6F8] shadow-2xl sm:p-6">
        <button onClick={onClose} aria-label="Close results" className="icon-button absolute right-3 top-3"><X className="h-4 w-4" /></button>

        <div className="pr-10">
          <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${won ? 'bg-[#3FD17C]/15 text-[#3FD17C]' : 'bg-[#FF4D4D]/15 text-[#FF4D4D]'}`}>
            {won ? <Trophy className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
          </div>
          <p className="stamp text-[0.68rem]" style={{ color: won ? '#3FD17C' : '#FF4D4D' }}>
            {won ? t.cityIdentified : t.mysteryRevealed}
          </p>
          {/* The reaction-ladder word is now the loudest thing in the modal —
              the win/loss label above is a small eyebrow, and the city name
              below is demoted to a secondary line, per the redesign. */}
          <h2
            id="result-title"
            className="mt-1 text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl"
            style={{ color: won ? '#3FD17C' : '#FF4D4D' }}
          >
            {ladderHeadline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#c8d0d8] sm:text-base">{ladderSubline}</p>
          <p className="mt-3 text-lg font-semibold text-[#F4F6F8]">
            {getCountryFlag(targetCity.countryCode)} {targetCity.name}
          </p>
          <p className="mt-1 text-sm text-[#9aa7b3]">
            {targetCity.country} · {targetCity.continent} · {won ? t.solvedInGuesses.replace('{n}', String(guesses.length)) : t.completedAttempts}
          </p>
        </div>

        {targetCity.image_url && (
          <div className="rounded-md border border-white/10 bg-[#090d12] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa7b3]">{t.cityPhoto}</p>
            <div className="mt-2 overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={targetCity.image_url}
                alt={targetCity.image_caption || targetCity.name}
                loading="lazy"
                className="h-48 w-full object-cover sm:h-56"
              />
            </div>
            {(targetCity.image_caption || targetCity.image_author) && (
              <div className="mt-1.5 space-y-0.5 text-[0.68rem] leading-snug text-[#8f9dac]">
                {targetCity.image_caption && <p>{targetCity.image_caption}</p>}
                {targetCity.image_author && (
                  <p className="text-[#6d7a86]">
                    {t.photoCreditLabel} {[targetCity.image_author, targetCity.image_license].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="rounded-md border border-[#FFB238]/25 bg-[#FFB238]/7 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB238]">{t.planningFact}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#d6dce1]">{targetCity.urban_fact}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#FFB238]">{t.educationalDebrief}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#d6dce1]">{targetCity.educational_debrief}</p>
        </div>

        <div className="rounded-md border border-[#3FD17C]/25 bg-[#3FD17C]/7 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#3FD17C]">
            <HeartHandshake className="h-4 w-4" /> {t.theSharedCity}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#b8c2cb]">
            {t.sharedCityDesc}
          </p>
        </div>

        <RobinsonMap guesses={guesses} targetCity={targetCity} isGameOver t={t} />

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="result-stat"><span>{t.statClimate}</span><strong>{targetCity.koppen_current.code}</strong></div>
          <div className="result-stat"><span>{t.statMeanTemp}</span><strong>{targetCity.temp_mean_annual_c.toFixed(1)}°C</strong></div>
          <div className="result-stat"><span>{t.statMetro}</span><strong>{(targetCity.population_metro / 1_000_000).toFixed(1)}M</strong></div>
          <div className="result-stat"><span>{t.statElevation}</span><strong>{targetCity.elevation_m}m</strong></div>
        </div>

        <p className="text-xs leading-relaxed text-[#8f9dac]">
          {t.gameplayDisclaimer}
        </p>

        {won && newlyUnlockedBadges && newlyUnlockedBadges.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-[#FFB238]/30 bg-[#FFB238]/8 p-2.5 text-xs font-semibold text-[#FFB238]">
            <Award className="h-4 w-4 shrink-0" /> {t.newBadgeUnlocked}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-white/8 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button onClick={handleShare} className="nothing-button flex items-center justify-center gap-2 bg-[#3FD17C] text-[#0A0C10] hover:bg-[#3FD17C]/85">
              {shareStatus === 'copied' || shareStatus === 'shared' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {shareStatus === 'copied' ? t.copied : t.shareGrid}
            </button>

            {/* Workstream H: personalized /result/[encoded] share link, built
                from this already-completed game's real mode/dailyNumber/
                targetCity/guesses (all already available as props above) —
                additive alongside the plain-text share button, not a
                replacement for it. */}
            <button onClick={handleShareResult} className="nothing-button flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-[#F4F6F8] hover:bg-white/10">
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

            {/* Workstream H: challenge-a-friend-to-this-exact-city CTA, same
                encodeChallenge(targetId) construction the /result page uses. */}
            <button onClick={handleChallengeFriend} className="nothing-button flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-[#F4F6F8] hover:bg-white/10">
              {challengeShareStatus === 'copied' || challengeShareStatus === 'shared' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Swords className="h-4 w-4" />
              )}
              {challengeShareStatus === 'copied'
                ? t.copied
                : challengeShareStatus === 'error'
                  ? t.shareErrorTitle
                  : t.challengeAFriend}
            </button>
          </div>

          {(mode === 'unlimited' || mode === 'photo') && onPlayNextUnlimited && (
            <button onClick={onPlayNextUnlimited} className="nothing-button flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-[#F4F6F8] hover:bg-white/10">
              {t.playNextRandom} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {shareStatus === 'error' && (
          <div className="rounded-md border border-[#FF4D4D]/35 bg-[#FF4D4D]/8 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB3B3]">{t.shareErrorTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#d6dce1]">{t.shareErrorHint}</p>
            <textarea
              readOnly
              value={shareText}
              onFocus={(event) => event.currentTarget.select()}
              rows={4}
              className="mt-2 w-full resize-none rounded border border-white/15 bg-[#0A0C10] p-2 font-mono text-xs text-[#F4F6F8] focus:border-[#3FD17C] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleShare}
              className="nothing-button mt-2 flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-[#F4F6F8] hover:bg-white/10"
            >
              <RotateCw className="h-3.5 w-3.5" /> {t.retry}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
