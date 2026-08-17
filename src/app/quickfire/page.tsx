'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, RotateCw, Timer, Trophy, X, Zap } from 'lucide-react';
import citiesData from '../../data/curated-cities.json';
import { getCountryFlag } from '../../lib/geo';
import { getTranslation, Locale, Translations } from '../../lib/i18n';
import { generateQuestion, QuickfireFieldKey, QuickfireQuestion } from '../../lib/quickfireLogic';
import { getQuickfireBestScore, saveQuickfireBestScore } from '../../lib/storage';
import { City } from '../../lib/types';

const cities = citiesData as City[];

const SESSION_SECONDS = 60;
// How long the correct/incorrect flash stays on screen before the next
// question loads — long enough to register, short enough that a 60-second
// session still fits a meaningful number of rounds.
const FEEDBACK_DELAY_MS = 900;

type SessionStatus = 'idle' | 'playing' | 'finished';

// Mirrors the locale-restore pattern already used independently across the
// app's other standalone pages (GameApp.tsx, atlas/almanac/marathon/
// playlists pages) — deferred via requestAnimationFrame so the state update
// doesn't happen synchronously inside the effect body (trips the
// react-hooks/set-state-in-effect lint rule).
function useQuickfireLocale(): Locale {
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

/** Maps each whitelisted field's key to its translated display label. quickfireLogic.ts
 * itself stays i18n-agnostic (plain-English defaults only), same separation
 * gameLogic.ts keeps from i18n.ts everywhere else in this app. */
function getFieldLabels(t: Translations): Record<QuickfireFieldKey, string> {
  return {
    population_metro: t.quickfireFieldPopulation,
    pm25_annual_ugm3: t.quickfireFieldPm25,
    elevation_m: t.quickfireFieldElevation,
    temp_mean_annual_c: t.quickfireFieldTemp,
    tree_canopy_pct: t.quickfireFieldTreeCanopy,
    transit_active_share_pct: t.quickfireFieldTransit,
    equator_distance: t.quickfireFieldEquatorDistance,
  };
}

interface AnswerFeedback {
  selectedCityId: string;
}

/**
 * One round: the question sentence plus 4 tappable city options. Shows
 * name, flag, country, and continent only — never the answer field's own
 * value, so the player has to actually recall/reason about the stat rather
 * than read it off the card. Feedback follows this app's established
 * "never color alone" rule (see marathon/page.tsx's RoundDots): the correct
 * city always gets a check glyph once answered, and a wrong tap gets an X
 * glyph on the option the player actually chose.
 */
function QuestionCard({
  question,
  fieldLabel,
  feedback,
  onAnswer,
  t,
}: {
  question: QuickfireQuestion;
  fieldLabel: string;
  feedback: AnswerFeedback | null;
  onAnswer: (cityId: string) => void;
  t: Translations;
}) {
  const questionText = (question.higherIsAnswer ? t.quickfireQuestionHighest : t.quickfireQuestionLowest).replace(
    '{field}',
    fieldLabel
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg font-semibold text-[#F4F6F8] sm:text-xl">{questionText}</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {question.cities.map((city) => {
          const isCorrectCity = city.id === question.correctCityId;
          const isSelected = feedback?.selectedCityId === city.id;
          const showCorrectMark = !!feedback && isCorrectCity;
          const showIncorrectMark = !!feedback && isSelected && !isCorrectCity;

          return (
            <button
              key={city.id}
              type="button"
              disabled={!!feedback}
              onClick={() => onAnswer(city.id)}
              className={`nothing-widget flex items-center gap-3 p-3 text-left transition-colors disabled:cursor-default ${
                showCorrectMark
                  ? 'border-[#3FD17C]/60 bg-[#3FD17C]/10'
                  : showIncorrectMark
                    ? 'border-[#FF4D4D]/60 bg-[#FF4D4D]/10'
                    : feedback
                      ? 'opacity-50'
                      : 'hover:border-[#3FD17C]/40'
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {getCountryFlag(city.countryCode)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#F4F6F8]">{city.name}</span>
                <span className="block truncate text-xs text-[#8f9dac]">
                  {city.country} · {city.continent}
                </span>
              </span>
              {showCorrectMark && (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3FD17C]"
                  aria-hidden
                >
                  <Check className="h-4 w-4 text-[#0A0C10]" strokeWidth={3} />
                </span>
              )}
              {showIncorrectMark && (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF4D4D]"
                  aria-hidden
                >
                  <X className="h-4 w-4 text-[#0A0C10]" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function QuickfirePage() {
  const locale = useQuickfireLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);
  const fieldLabels = useMemo(() => getFieldLabels(t), [t]);

  const [status, setStatus] = useState<SessionStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<QuickfireQuestion | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Refs let the timer-expiry and session-end effects read the latest
  // score/best without needing them in a dependency array (which would
  // otherwise re-fire the save-on-finish effect on every point scored).
  const scoreRef = useRef(0);
  const previousBestRef = useRef(0);
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load the persisted best score once on mount, same deferred-via-rAF
  // pattern every other localStorage-restore effect in this app uses.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = getQuickfireBestScore();
      setBestScore(saved);
      previousBestRef.current = saved;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Clear any pending feedback -> next-question timeout on unmount so it
  // can never fire a state update after the component is gone.
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Countdown, ticking once a second while a session is in progress. Stops
  // itself (via the cleanup) the instant status leaves 'playing'. The
  // zero-check and 'finished' transition live inside this same interval
  // callback (not a separate effect keyed on `timeLeft`) so the setState
  // call happens from the timer's own async callback, not synchronously in
  // an effect body.
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          // Discard any in-flight feedback auto-advance timeout so it can't
          // load a stray next question after the summary screen is showing.
          if (feedbackTimeoutRef.current !== null) {
            window.clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = null;
          }
          setStatus('finished');
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  // Persist the best score exactly once per completed session. Reads the
  // final score and the best as it stood *before* this session (both via
  // refs) rather than depending on `score`/`bestScore` directly, so this
  // only ever runs on the 'playing' -> 'finished' transition itself.
  useEffect(() => {
    if (status !== 'finished') return;
    const finalScore = scoreRef.current;
    setIsNewBest(finalScore > previousBestRef.current);
    saveQuickfireBestScore(finalScore);
    const updatedBest = getQuickfireBestScore();
    setBestScore(updatedBest);
    previousBestRef.current = updatedBest;
  }, [status]);

  const startSession = useCallback(() => {
    setScore(0);
    setTimeLeft(SESSION_SECONDS);
    setFeedback(null);
    setAnnouncement('');
    setIsNewBest(false);
    setQuestion(generateQuestion(cities));
    setStatus('playing');
  }, []);

  const handleAnswer = useCallback(
    (cityId: string) => {
      if (!question || feedback) return; // Ignore taps once an answer's already locked in.

      const correct = cityId === question.correctCityId;
      setFeedback({ selectedCityId: cityId });

      if (correct) {
        setScore((prev) => prev + 1);
        setAnnouncement(t.quickfireCorrectAnnounce);
      } else {
        const correctCity = question.cities.find((city) => city.id === question.correctCityId);
        setAnnouncement(t.quickfireIncorrectAnnounce.replace('{city}', correctCity?.name ?? ''));
      }

      feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback(null);
        setQuestion(generateQuestion(cities));
        feedbackTimeoutRef.current = null;
      }, FEEDBACK_DELAY_MS);
    },
    [question, feedback, t]
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <header className="border-b border-white/10 bg-[#0A0C10]/96 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-3 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="stamp text-[#FFB238]">{t.quickfireEyebrow}</p>
              <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">{t.quickfireTitle}</h1>
            </div>
            <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
              {t.marathonBackToCityle}
            </Link>
          </div>

          {status === 'idle' && (
            <p className="max-w-2xl text-sm leading-relaxed text-[#8f9dac]">{t.quickfireIntro}</p>
          )}

          {status === 'playing' && (
            <div className="mt-1 flex items-center gap-4">
              <span className="stamp inline-flex items-center gap-1.5 text-[#3FD17C]">
                <Timer className="h-3.5 w-3.5" aria-hidden />
                {t.quickfireTimeLeftLabel}: <span className="mono text-sm text-[#F4F6F8]">{timeLeft}s</span>
              </span>
              <span className="stamp text-[#8f9dac]">
                {t.quickfireScoreLabel}: <span className="mono text-sm text-[#F4F6F8]">{score}</span>
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-5 sm:py-8">
        {/* Screen-reader-only correct/incorrect announcement — the visual
            feedback above is icon+color, this covers non-visual users. */}
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {status === 'idle' && (
          <div className="nothing-widget flex flex-col items-center gap-3 p-6 text-center sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3FD17C]/15 text-[#3FD17C]">
              <Zap className="h-5 w-5" />
            </span>
            <p className="stamp text-[#8f9dac]">
              {t.quickfireBestScoreLabel}: <span className="text-[#FFB238]">{bestScore}</span>
            </p>
            <button
              type="button"
              onClick={startSession}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded bg-[#3FD17C] px-6 py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#3FD17C]/85"
            >
              {t.quickfireStartCta}
            </button>
          </div>
        )}

        {status === 'playing' && question && (
          <QuestionCard
            key={question.cities.map((c) => c.id).join('-')}
            question={question}
            fieldLabel={fieldLabels[question.field.key]}
            feedback={feedback}
            onAnswer={handleAnswer}
            t={t}
          />
        )}

        {status === 'finished' && (
          <div className="nothing-widget flex flex-col items-center gap-2 p-6 text-center sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFB238]/15 text-[#FFB238]">
              <Trophy className="h-5 w-5" />
            </span>
            <p className="stamp text-[#FFB238]">{t.quickfireFinishedEyebrow}</p>
            <h2 className="text-3xl font-bold text-[#F4F6F8] sm:text-4xl">{t.quickfireFinishedTitle}</h2>
            <p className="mt-2 text-4xl font-bold text-[#3FD17C]">{score}</p>
            <p className="stamp text-[#8f9dac]">{t.quickfireFinalScoreLabel}</p>
            {isNewBest && <span className="chip mt-1 text-[#FFB238]">{t.quickfireNewBestBadge}</span>}
            <p className="stamp mt-3 text-[#8f9dac]">
              {t.quickfireBestScoreLabel}: <span className="text-[#F4F6F8]">{bestScore}</span>
            </p>
            <button
              type="button"
              onClick={startSession}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#3FD17C] px-6 py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#3FD17C]/85"
            >
              <RotateCw className="h-4 w-4" />
              {t.quickfirePlayAgainCta}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
