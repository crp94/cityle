'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { track } from '@vercel/analytics';
import {
  Building2,
  CloudRain,
  Compass,
  Droplets,
  Flame,
  Footprints,
  Gauge,
  Globe,
  Globe2,
  Landmark,
  Leaf,
  Lightbulb,
  Lock,
  Sparkles,
  Thermometer,
  TrendingUp,
  Users,
  Waves,
  Wind,
} from 'lucide-react';
import { Locale, Translations } from '../lib/i18n';
import { City, Difficulty } from '../lib/types';
import { METRIC_GRADES } from '../lib/colorGrading';
import { CityPhoto } from './CityPhoto';
import { KoppenModal } from './KoppenModal';
import { MetricChip } from './MetricChip';
import { Sparkline } from './Sparkline';
import { UrbanSprawlMap } from './UrbanSprawlMap';
import { EverydayAccess } from './EverydayAccess';

interface DossierProps {
  city: City;
  guessCount: number;
  difficulty: Difficulty;
  // Photo mode (Workstream V): optional, defaults to false so every other
  // caller (including Marathon's reuse of this component) is unaffected.
  // When true, the pinned baseline becomes the city photo instead of the
  // Köppen/temp/PM2.5 chips, and Climate & Air becomes a normal lockable
  // category requiring a token — reusing the exact same gating condition
  // Hard Mode already uses (see initialUnlocked/getSpendableTargets below).
  isPhotoMode?: boolean;
  t: Translations;
  locale: Locale;

  // --- Token-economy resume seeds (GameState.unlockedClueCategories /
  // .bankedTokenCount in types.ts) -------------------------------------
  //
  // Both undefined for a genuinely fresh game (or any caller, like
  // MarathonRound, that never wires this up at all) — DossierGame's own
  // initialUnlocked(difficulty, isPhotoMode)/empty-bank defaults apply
  // exactly as before. When defined, they seed DossierGame's local state
  // instead, letting a resumed game reopen with whatever categories/tokens
  // the player already paid for. Only read at mount time (see the
  // useState initializers below) — GameApp.tsx is responsible for forcing a
  // remount via `resumeGeneration` whenever it resolves a new seed for the
  // city already on screen (see that prop's own comment).
  initialUnlockedCategories?: Set<ClueCategory>;
  initialBankedTokenCount?: number;
  // Bumped by GameApp.tsx exactly once per resume-state resolution (its
  // mount effect, and every other place it restores/resets a game). Purely
  // a remount trigger for the Dossier wrapper's `key` below — never read
  // inside DossierGame itself. It exists because `city.id` +
  // `difficulty`/`isPhotoMode` (the rest of the key) don't always change
  // across a resume: a Standard-difficulty daily/challenge resume keeps
  // `difficulty` at 'standard' before AND after the mount effect corrects
  // it (there's nothing to correct), so without this, DossierGame would
  // already be mounted — using the pre-resume default seed — by the time
  // initialUnlockedCategories/initialBankedTokenCount arrive as updated
  // props, and a plain useState initializer never re-runs on a props change
  // without a remount. Hard Mode doesn't strictly need this (its difficulty
  // correction already forces a remount on its own), but every resume path
  // bumps it regardless, for one consistent mechanism instead of two.
  resumeGeneration?: number;
  // Fired whenever unlockedCategories or the banked-token count changes
  // (spending a token via handleTabClick, or a new token being minted as
  // guessCount advances) so GameApp.tsx can mirror it into GameState and
  // persist it. Optional — MarathonRound's practice rounds don't wire this
  // up (see the scope comment in MarathonRound.tsx) and simply don't
  // persist their token economy, same as before this change.
  onTokenStateChange?: (state: { unlockedCategories: Set<ClueCategory>; bankedTokenCount: number }) => void;
}

// --- "Choose Your Clue" token economy ---------------------------------------
//
// Six categories total. Climate & Air is free in Standard difficulty (always
// unlocked, no token cost) but is gated behind the player's first token in
// Hard Mode, exactly like the other five. Bonus Insight is reachable only
// once guessCount hits 6 (the final guess) or later, giving the 5 dead
// colorGrading functions (gdp/coastalRisk/aridity/carbonFootprint/warmingRate)
// their first real home in the app.
// Exported so GameApp.tsx (and anything else persisting/restoring the token
// economy) can type its own mirror of this state and validate persisted
// strings against CATEGORY_ORDER below without duplicating the category list.
export type ClueCategory =
  | 'climateAir'
  | 'peopleEconomy'
  | 'mobilityForm'
  | '2050Outlook'
  | 'placeMap'
  | 'bonusInsight';

export const CATEGORY_ORDER: ClueCategory[] = [
  'climateAir',
  'peopleEconomy',
  'mobilityForm',
  '2050Outlook',
  'placeMap',
  'bonusInsight',
];

// The four categories a Standard-difficulty player can freely spend tokens on
// (in any order) before guess 6. Climate & Air isn't here because it's free
// in Standard; Bonus Insight isn't here because it's genuinely unreachable
// before guess 6 regardless of tokens available (see getSpendableTargets).
const STANDARD_FREE_CHOICE_CATEGORIES: ClueCategory[] = [
  'peopleEconomy',
  'mobilityForm',
  '2050Outlook',
  'placeMap',
];

// isPhotoMode is checked alongside difficulty === 'hard' everywhere below —
// Photo mode (Workstream V) reuses Hard Mode's existing "no free baseline"
// wiring as-is rather than introducing a parallel gating path: in Photo
// mode, Climate & Air is never pre-unlocked, regardless of the actual
// difficulty setting, because the pinned baseline is the city photo instead.
function initialUnlocked(difficulty: Difficulty, isPhotoMode: boolean): Set<ClueCategory> {
  return new Set(
    difficulty === 'standard' && !isPhotoMode ? (['climateAir'] as ClueCategory[]) : []
  );
}

/**
 * Which categories a token can be spent on right now, given what's already
 * unlocked, the difficulty, how many guesses have been made, and whether
 * this is Photo mode.
 *
 * Hard Mode (or Photo mode): "no free choice" — tokens must be spent in the
 * fixed original order (Climate & Air is now part of that order too, since
 * nothing is free), so there is always at most one valid target.
 *
 * Standard (non-Photo): free choice among the four non-bonus categories,
 * until guess 6 — at that point (guess 6's token, or any leftover banked
 * token) the ONLY valid target becomes Bonus Insight. Bonus Insight is never
 * reachable before guess 6, no matter how many tokens are banked.
 */
function getSpendableTargets(
  unlocked: Set<ClueCategory>,
  difficulty: Difficulty,
  guessCount: number,
  isPhotoMode: boolean
): ClueCategory[] {
  if (difficulty === 'hard' || isPhotoMode) {
    const next = CATEGORY_ORDER.find((category) => !unlocked.has(category));
    return next ? [next] : [];
  }
  if (guessCount >= 6) {
    return unlocked.has('bonusInsight') ? [] : ['bonusInsight'];
  }
  return STANDARD_FREE_CHOICE_CATEGORIES.filter((category) => !unlocked.has(category));
}

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="nothing-widget flex flex-col gap-3 p-3.5 sm:p-4">
      <div className="flex items-center gap-2 border-b border-white/8 pb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#3FD17C]/50 bg-[#3FD17C]/10 text-[0.68rem] font-bold text-[#b5c69b]">
          {String(index).padStart(2, '0')}
        </span>
        <h3 className="text-sm font-semibold text-[#eef1f3]">{title.replace(/^[0-9.]+\s*/, '')}</h3>
      </div>
      {children}
    </section>
  );
}

function LockedTabPlaceholder({ spendable, t }: { spendable: boolean; t: Translations }) {
  return (
    <section className="nothing-widget flex flex-col items-center gap-2 p-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFB238]/40 bg-[#FFB238]/10 text-[#FFB238]">
        <Lock className="h-5 w-5" />
      </span>
      <p className="max-w-xs text-[0.72rem] text-[#8a97a5]">
        {spendable ? t.lockedTabTooltipSpendNow : t.lockedTabTooltipNextToken}
      </p>
    </section>
  );
}

const TAB_ICON: Record<ClueCategory, ReactNode> = {
  climateAir: <Thermometer className="h-3.5 w-3.5" />,
  peopleEconomy: <Users className="h-3.5 w-3.5" />,
  mobilityForm: <Footprints className="h-3.5 w-3.5" />,
  '2050Outlook': <CloudRain className="h-3.5 w-3.5" />,
  placeMap: <Compass className="h-3.5 w-3.5" />,
  bonusInsight: <Sparkles className="h-3.5 w-3.5" />,
};

function TabBar({
  unlockedCategories,
  activeCategory,
  spendableTargets,
  bankedTokens,
  onSelect,
  t,
}: {
  unlockedCategories: Set<ClueCategory>;
  activeCategory: ClueCategory;
  spendableTargets: ClueCategory[];
  bankedTokens: number;
  onSelect: (category: ClueCategory) => void;
  t: Translations;
}) {
  const TAB_LABEL: Record<ClueCategory, string> = {
    climateAir: t.clueTabClimateAir,
    peopleEconomy: t.clueTabPeopleEconomy,
    mobilityForm: t.clueTabMobilityForm,
    '2050Outlook': t.clueTabOutlook2050,
    placeMap: t.clueTabPlaceMap,
    bonusInsight: t.clueTabBonusInsight,
  };

  return (
    <div role="tablist" aria-label={t.clueTabsAriaLabel} className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
      {CATEGORY_ORDER.map((category) => {
        const isUnlocked = unlockedCategories.has(category);
        const isActive = category === activeCategory;
        // A category can be next in line (spendableTargets) with zero tokens
        // actually available yet (e.g. before guess 1) — only treat it as
        // spendable-now once there's a real token to spend, otherwise the
        // tab would look clickable while silently no-oping on click.
        const isSpendableNow = !isUnlocked && bankedTokens > 0 && spendableTargets.includes(category);
        const tooltip =
          category === 'bonusInsight' && !isUnlocked && !isSpendableNow
            ? t.bonusInsightLockedTooltip
            : isSpendableNow
              ? t.lockedTabTooltipSpendNow
              : t.lockedTabTooltipNextToken;

        return (
          <button
            key={category}
            id={`clue-tab-${category}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="clue-tabpanel"
            title={!isUnlocked ? tooltip : undefined}
            onClick={() => onSelect(category)}
            disabled={!isUnlocked && !isSpendableNow}
            className={`flex flex-col items-center gap-1 rounded-md border px-1.5 py-2 text-center transition-colors ${
              isActive
                ? 'border-[#3FD17C] bg-[#3FD17C]/15 text-[#eef1f3]'
                : isUnlocked
                  ? 'border-[#3FD17C]/30 bg-[#3FD17C]/5 text-[#c5ced7] hover:border-[#3FD17C]/60'
                  : isSpendableNow
                    ? 'cursor-pointer border-[#FFB238]/50 bg-[#FFB238]/10 text-[#FFB238] hover:border-[#FFB238]'
                    : 'cursor-not-allowed border-[#2a3340] bg-[#131922]/50 text-[#5c6773]'
            }`}
          >
            <span className="flex items-center gap-1">
              {isUnlocked ? TAB_ICON[category] : <Lock className="h-3 w-3" />}
            </span>
            <span className="mono text-[0.6rem] font-semibold leading-tight">{TAB_LABEL[category]}</span>
            {isSpendableNow && (
              <span
                className="mono text-[0.58rem] font-semibold text-[#FFB238]"
                aria-label={t.bankedTokensStatus.replace('{n}', String(bankedTokens))}
              >
                {t.spendTokenCta}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PinnedHeader({
  city,
  t,
  onOpenKoppen,
  isPhotoMode,
}: {
  city: City;
  t: Translations;
  onOpenKoppen: () => void;
  isPhotoMode: boolean;
}) {
  // Photo mode's pinned baseline is the city photo itself, prominent and
  // un-gated, INSTEAD OF the Köppen/temp/PM2.5 chip trio below — those three
  // stats move behind the (now token-gated) Climate & Air category like
  // everything else in this mode.
  if (isPhotoMode) {
    return (
      <div className="flex flex-col gap-1.5">
        <CityPhoto city={city} spoilerSafe />
        <p className="text-center text-[0.68rem] text-[#8a97a5]">{t.photoModePinnedHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <button type="button" onClick={onOpenKoppen} aria-haspopup="dialog" className="text-left">
        <MetricChip
          label={t.currentKoppenLabel}
          value={city.koppen_current.code}
          subtext={city.koppen_current.name}
          icon={<Compass className="h-3.5 w-3.5" />}
          interactive
        />
      </button>
      <MetricChip
        label={t.meanTempLabel}
        value={city.temp_mean_annual_c.toFixed(1)}
        unit="°C"
        icon={<Thermometer className="h-3.5 w-3.5" />}
      />
      <MetricChip
        label={t.pm25Label}
        value={city.pm25_annual_ugm3}
        unit="µg/m³"
        subtext={city.aqi_tier}
        icon={<Wind className="h-3.5 w-3.5" />}
        grade={METRIC_GRADES.pm25(city.pm25_annual_ugm3)}
      />
    </div>
  );
}

// The token economy (unlockedCategories/activeCategory/availableTokens) is
// local component state, kept in sync with (and now resumable from)
// GameState.unlockedClueCategories/.bankedTokenCount via the
// initialUnlockedCategories/initialBankedTokenCount/onTokenStateChange props
// above — see their comments on DossierProps and GameApp.tsx's handling of
// them. It's still not literally GameState itself: DossierGame derives its
// own richer local shape (a live Set, activeCategory, the full
// availableTokens array) from those seeds, and reports back only the
// minimal slice types.ts actually persists. Wrapping it in its own
// component keyed on city.id + difficulty + isPhotoMode + resumeGeneration
// lets a new target city, a difficulty/mode change, or GameApp resolving a
// new resume seed reset (or reseed) every bit of that state for free, by
// letting React unmount-and-remount fresh state rather than hand-rolling a
// setState-in-effect reset (which both defeats React's "derive during
// render" idiom and trips the react-hooks/set-state-in-effect lint rule).
//
// difficulty/isPhotoMode are in the key for a real reason, not defensiveness:
// initialUnlocked(difficulty, isPhotoMode) only runs once, on mount. Without
// them in the key, toggling Hard Mode on AFTER this component already
// mounted under Standard (a real, easy-to-hit sequence: load the page, then
// flip the header toggle before guessing) left Climate & Air permanently
// unlocked for free for the rest of that game, since nothing ever re-ran the
// lazy initializer under the new difficulty. Including them here means any
// such change gets a clean remount instead, which is also what makes it safe
// for GameApp.tsx's `difficulty` state to use the standard deferred/
// SSR-safe-default pattern instead of reading localStorage synchronously
// during render (a real hydration-mismatch source) — see GameApp.tsx.
// resumeGeneration exists for the same underlying reason, for the case that
// mechanism doesn't already cover: see its comment on DossierProps.
export const Dossier = (props: DossierProps) => (
  <DossierGame
    key={`${props.city.id}:${props.difficulty}:${props.isPhotoMode ?? false}:${props.resumeGeneration ?? 0}`}
    {...props}
  />
);

const DossierGame = ({
  city,
  guessCount,
  difficulty,
  isPhotoMode = false,
  t,
  locale,
  initialUnlockedCategories,
  initialBankedTokenCount,
  onTokenStateChange,
}: DossierProps) => {
  const [selectedKoppen, setSelectedKoppen] = useState<{ code: string; is2050: boolean } | null>(null);
  // initialUnlockedCategories, when provided, is a resume seed from
  // GameState (see DossierProps) — it's used verbatim (not merged with
  // initialUnlocked's fresh-game default) since the persisted set already
  // reflects whatever initialUnlocked produced back when this game started,
  // plus everything unlocked since. Undefined (a genuinely fresh game, or a
  // caller like MarathonRound that doesn't wire resume seeds up at all)
  // falls back to exactly the pre-existing default.
  const [unlockedCategories, setUnlockedCategories] = useState<Set<ClueCategory>>(() =>
    initialUnlockedCategories ?? initialUnlocked(difficulty, isPhotoMode)
  );
  // Deliberately not persisted (see GameState.bankedTokenCount's comment in
  // types.ts) — on resume, default to whichever already-unlocked category
  // sorts first in CATEGORY_ORDER (matching what a player would see if they
  // unlocked categories in that order), or the baseline 'climateAir' tab
  // when nothing's unlocked yet.
  const [activeCategory, setActiveCategory] = useState<ClueCategory>(() => {
    if (!initialUnlockedCategories || initialUnlockedCategories.size === 0) return 'climateAir';
    return CATEGORY_ORDER.find((category) => initialUnlockedCategories.has(category)) ?? 'climateAir';
  });
  // Unspent Intel Tokens, one entry per token, storing the guess number that
  // minted it (oldest first). The array length IS "bankedTokens" — there's no
  // separate counter to keep in sync, so a token can never be double-counted
  // or spent twice by construction: spending always splices exactly one
  // entry out of this array at the moment a category is unlocked.
  //
  // On resume, only the COUNT survives (GameState.bankedTokenCount) — not
  // which guess minted each banked token, since that provenance is only
  // ever used for the clue_category_selected analytics event's `wasBanked`
  // field (see handleTabClick below), not for any gameplay decision. `0` is
  // used as a sentinel mint-guess for resumed tokens rather than the real
  // (unknown) guess number: since guess numbers start at 1, `spentToken !==
  // guessCount` in handleTabClick is then always true for a resumed token,
  // i.e. it's always reported as "banked" rather than "just minted" — a
  // reasonable default, since a token that survived a reload was, from this
  // fresh mount's perspective, definitely already sitting in the bank.
  const [availableTokens, setAvailableTokens] = useState<number[]>(() =>
    initialUnlockedCategories ? Array.from({ length: initialBankedTokenCount ?? 0 }, () => 0) : []
  );
  // How many guesses' worth of tokens have already been minted into
  // availableTokens. Comparing this plain render-time state to the current
  // guessCount prop — and calling setState conditionally, during render,
  // rather than in a useEffect — is React's documented pattern for
  // "adjusting state when a prop changes"; it avoids the extra
  // effect-triggered render pass a useEffect version would need.
  //
  // On resume, this seeds to the CURRENT guessCount (capped at 6) rather
  // than 0: every guess up through guessCount has already had its token
  // accounted for, either spent (folded into unlockedCategories) or still
  // banked (bankedTokenCount, seeded into availableTokens above) — re-
  // minting them here on top of that would double-count.
  const [mintedThroughGuess, setMintedThroughGuess] = useState(() =>
    initialUnlockedCategories ? Math.min(guessCount, 6) : 0
  );

  // Notify GameApp.tsx of the current token-economy snapshot whenever it
  // changes — both from a real user action (handleTabClick spending a
  // token) and from the render-time auto-mint logic just below (a new
  // guess minting a token). An effect, rather than calling
  // onTokenStateChange directly from either of those call sites, is
  // deliberate: handleTabClick runs from a click handler so a direct call
  // would be safe there, but the auto-mint logic runs during THIS
  // component's render — calling a prop function that turns around and
  // calls setState on the PARENT (GameApp) synchronously during a child's
  // render is exactly the "Cannot update a component while rendering a
  // different component" hazard React's rules disallow. Routing both
  // sources through one post-render effect sidesteps that entirely, at the
  // cost of one extra (harmless, idempotent) notification on mount.
  useEffect(() => {
    onTokenStateChange?.({ unlockedCategories, bankedTokenCount: availableTokens.length });
    // onTokenStateChange is passed fresh on every GameApp render; only the
    // actual state values below should re-trigger the notification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedCategories, availableTokens.length]);

  // Every guess from 1 to 6 mints exactly one Intel Token. Guess 6's token
  // (and any token still sitting in the bank once guess 6 happens) can only
  // ever be spent on Bonus Insight — see getSpendableTargets — so no more
  // than 6 tokens are ever minted for a single game.
  if (guessCount > mintedThroughGuess) {
    const minted: number[] = [];
    for (let g = mintedThroughGuess + 1; g <= Math.min(guessCount, 6); g += 1) {
      minted.push(g);
    }
    setMintedThroughGuess(guessCount);
    if (minted.length > 0) {
      setAvailableTokens((prev) => [...prev, ...minted]);
    }
  }

  const spendableTargets = getSpendableTargets(unlockedCategories, difficulty, guessCount, isPhotoMode);
  const bankedTokens = availableTokens.length;

  function handleTabClick(category: ClueCategory) {
    if (unlockedCategories.has(category)) {
      // Already unlocked — switching focus is always free and never
      // re-locks anything else that's already been unlocked.
      setActiveCategory(category);
      return;
    }
    if (bankedTokens === 0 || !spendableTargets.includes(category)) return;

    // Spend the oldest unspent token (FIFO). Comparing its minting guess to
    // the current guess number is what lets the clue_category_selected event
    // distinguish "spent the moment it was minted" from "spent out of the
    // bank after sitting unused for at least one guess" — a fungible token
    // pool has no other way to tell those apart honestly.
    const [spentToken, ...rest] = availableTokens;
    const wasBanked = spentToken !== guessCount;

    setAvailableTokens(rest);
    setUnlockedCategories((prev) => {
      const next = new Set(prev);
      next.add(category);
      return next;
    });
    setActiveCategory(category);

    // Climate & Air isn't part of the analytics category enum (it's the
    // baseline, not one of the 5 explorable categories), so it's the one
    // unlock that doesn't fire this event.
    if (category !== 'climateAir') {
      track('clue_category_selected', {
        category,
        guessNumber: guessCount,
        wasBanked,
      });
    }
  }

  const climateAirContent = (
    <Section index={1} title={t.panel1Title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MetricChip label={t.annualRainLabel} value={city.precip_annual_mm} unit="mm/yr" icon={<CloudRain className="h-3.5 w-3.5" />} />
        <MetricChip
          label={t.elevationLabel}
          value={city.elevation_m}
          unit="m"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.elevation(city.elevation_m)}
        />
        <MetricChip label={t.smogSeasonLabel} value={city.peak_smog_season} />
      </div>
      <Sparkline
        monthlyTemps={city.monthly_temps_c}
        monthlyPrecip={city.monthly_precip_mm}
        monthlyTemps2050={city.monthly_temps_2050_c}
        monthlyPrecip2050={city.monthly_precip_2050_mm}
        showFuture={unlockedCategories.has('2050Outlook')}
        t={t}
      />
    </Section>
  );

  const peopleEconomyContent = (
    <Section index={2} title={t.panel2Title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricChip label={t.metroPop} value={(city.population_metro / 1_000_000).toFixed(1)} unit="M" icon={<Users className="h-3.5 w-3.5" />} />
        <MetricChip label={t.densityLabel} value={city.density_urban_pop_km2} unit="/km²" grade={METRIC_GRADES.density(city.density_urban_pop_km2)} />
        <MetricChip label={t.giniLabel} value={city.gini_tier} subtext={t.directionalInequality} icon={<Building2 className="h-3.5 w-3.5" />} />
        <MetricChip label={t.medianAgeLabel} value={city.median_age} unit="yr" />
      </div>
    </Section>
  );

  const mobilityFormContent = (
    <Section index={3} title={t.panel3Title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricChip label={t.modalShareLabel} value={city.transit_active_share_pct} unit="%" grade={METRIC_GRADES.modalShare(city.transit_active_share_pct)} />
        <MetricChip label={t.canopyLabel} value={city.tree_canopy_pct} unit="%" icon={<Leaf className="h-3.5 w-3.5" />} grade={METRIC_GRADES.treeCanopy(city.tree_canopy_pct)} />
        <MetricChip label={t.uhiLabel} value={city.uhi_index_c.toFixed(1)} unit="°C" grade={METRIC_GRADES.uhi(city.uhi_index_c)} />
        <MetricChip label={t.waterStressLabel} value={city.water_stress_2050} grade={METRIC_GRADES.waterStress(city.water_stress_2050)} />
      </div>
      {/* EverydayAccess deliberately refuses to score walkability and must
          always render completely when this tab is active — never truncated
          or summarized. */}
      <EverydayAccess city={city} t={t} />
    </Section>
  );

  const outlook2050Content = (
    <Section index={4} title={t.panel4Title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setSelectedKoppen({ code: city.koppen_2050.code, is2050: true })}
          aria-haspopup="dialog"
          className="text-left"
        >
          <MetricChip
            label={t.koppen2050Label}
            value={city.koppen_2050.code}
            subtext={city.koppen_2050.name}
            interactive
            grade={METRIC_GRADES.koppenShift(city.koppen_current.code, city.koppen_2050.code)}
          />
        </button>
        <MetricChip
          label={t.tempAnomalyLabel}
          value={`${city.temp_2050_anomaly_c >= 0 ? '+' : ''}${city.temp_2050_anomaly_c.toFixed(1)}`}
          unit="°C"
          grade={METRIC_GRADES.tempAnomaly(city.temp_2050_anomaly_c)}
        />
        <MetricChip label={t.rainShiftLabel} value={`${city.precip_2050_shift_pct > 0 ? '+' : ''}${city.precip_2050_shift_pct}`} unit="%" />
        <MetricChip
          label={t.heatwaveLabel}
          value={city.heatwave_days_above_35c_2050 ?? '—'}
          unit="d"
          grade={city.heatwave_days_above_35c_2050 != null ? METRIC_GRADES.heatwaveDays(city.heatwave_days_above_35c_2050) : undefined}
        />
      </div>
      <p className="text-xs leading-relaxed text-[#8f9dac]">{t.futureEstimatesDisclaimer}</p>
    </Section>
  );

  const placeMapContent = (
    <div className="flex flex-col gap-3">
      <UrbanSprawlMap key={city.id} city={city} isUnlocked guessCount={guessCount} t={t} />
      <Section index={5} title={t.panel6Title}>
        <div className="flex gap-3 rounded-md border border-[#FFB238]/30 bg-[#FFB238]/8 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB238]" />
          <p className="text-sm leading-relaxed text-[#d4dbe1]">{city.urban_fact}</p>
        </div>
        {/* In Photo mode the photo is already the pinned baseline above —
            never render it a second time here. */}
        {!isPhotoMode && <CityPhoto city={city} spoilerSafe />}
      </Section>
    </div>
  );

  const bonusInsightContent = (
    <Section index={6} title={t.clueTabBonusInsight}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MetricChip
          label={t.gdpLabel}
          value={(city.gdp_per_capita_ppp / 1000).toFixed(0)}
          unit="k USD"
          icon={<Landmark className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.gdp(city.gdp_per_capita_ppp)}
        />
        <MetricChip
          label={t.coastalRiskLabel}
          value={city.coastal_flood_risk}
          icon={<Waves className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.coastalRisk(city.coastal_flood_risk)}
        />
        {city.aridity_index != null && (
          <MetricChip
            label={t.aridityLabel}
            value={city.aridity_index}
            icon={<Droplets className="h-3.5 w-3.5" />}
            grade={METRIC_GRADES.aridity(city.aridity_index)}
          />
        )}
        {city.carbon_footprint_tco2e_capita != null && (
          <MetricChip
            label={t.carbonLabel}
            value={city.carbon_footprint_tco2e_capita.toFixed(1)}
            unit="t CO2e"
            icon={<Flame className="h-3.5 w-3.5" />}
            grade={METRIC_GRADES.carbonFootprint(city.carbon_footprint_tco2e_capita)}
          />
        )}
        {city.warming_rate_c_per_decade != null && (
          <MetricChip
            label={t.warmingRateLabel}
            value={city.warming_rate_c_per_decade.toFixed(2)}
            unit="°C/dec"
            icon={<Gauge className="h-3.5 w-3.5" />}
            grade={METRIC_GRADES.warmingRate(city.warming_rate_c_per_decade)}
          />
        )}
      </div>
      {/* Climate analogues (Bastin et al. 2019, PLOS ONE): fully authored,
          per-city data that had no home anywhere in the app until now. Both
          fields are optional — a handful of cities lack one or both — so
          each chip (and the whole block) is omitted rather than showing a
          placeholder when its analogue is missing. */}
      {(city.analogue_current || city.analogue_2050) && (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {city.analogue_current && (
              <MetricChip
                label={t.currentClimateTwin}
                value={city.analogue_current.cityName}
                subtext={`${city.analogue_current.country} · ${city.analogue_current.similarityPct}% match`}
                icon={<Globe className="h-3.5 w-3.5" />}
              />
            )}
            {city.analogue_2050 && (
              <MetricChip
                label={t.futureClimateAnalogue}
                value={city.analogue_2050.cityName}
                subtext={`${city.analogue_2050.country} · ${city.analogue_2050.similarityPct}% match`}
                icon={<Globe2 className="h-3.5 w-3.5" />}
              />
            )}
          </div>
          <p className="text-[0.62rem] leading-relaxed text-[#6b7684]">{t.sourceAnalogues}</p>
        </div>
      )}
      <p className="text-xs leading-relaxed text-[#8f9dac]">{t.bonusInsightDisclaimer}</p>
    </Section>
  );

  const CATEGORY_CONTENT: Record<ClueCategory, ReactNode> = {
    climateAir: climateAirContent,
    peopleEconomy: peopleEconomyContent,
    mobilityForm: mobilityFormContent,
    '2050Outlook': outlook2050Content,
    placeMap: placeMapContent,
    bonusInsight: bonusInsightContent,
  };

  const activeContent = unlockedCategories.has(activeCategory) ? (
    CATEGORY_CONTENT[activeCategory]
  ) : (
    <LockedTabPlaceholder spendable={bankedTokens > 0 && spendableTargets.includes(activeCategory)} t={t} />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-[#3FD17C]/25 bg-[#3FD17C]/8 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-[#b4bec8]">{t.chooseYourClueBanner}</p>
      </div>

      <PinnedHeader
        city={city}
        t={t}
        isPhotoMode={isPhotoMode}
        onOpenKoppen={() => setSelectedKoppen({ code: city.koppen_current.code, is2050: false })}
      />

      {/* Phase 7, Workstream LL: free bonus flavor text, no token cost, no
          interaction with unlockedCategories/token-spending logic at all.
          city.cryptic_clue is optional (Workstream KK's riddle batches are
          still landing) — render nothing when absent, never a placeholder
          or an empty box. Kept visually quiet/subordinate to the tabs below:
          same muted border/bg treatment as the app's other secondary text,
          not the louder amber treatment used for the urban_fact callout. */}
      {city.cryptic_clue && (
        <div className="flex items-start gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2.5">
          <span className="mt-0.5 shrink-0 text-sm leading-none" aria-hidden="true">
            🔮
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="mono text-[0.62rem] font-semibold uppercase tracking-wide text-[#8a97a5]">
              {t.crypticClueLabel}
            </span>
            <p className="text-xs leading-relaxed text-[#c5ced7]">{city.cryptic_clue}</p>
          </div>
        </div>
      )}

      <TabBar
        unlockedCategories={unlockedCategories}
        activeCategory={activeCategory}
        spendableTargets={spendableTargets}
        bankedTokens={bankedTokens}
        onSelect={handleTabClick}
        t={t}
      />

      <div id="clue-tabpanel" role="tabpanel" aria-labelledby={`clue-tab-${activeCategory}`}>
        {activeContent}
      </div>

      {selectedKoppen && (
        <KoppenModal
          code={selectedKoppen.code}
          isOpen
          onClose={() => setSelectedKoppen(null)}
          locale={locale}
          is2050={selectedKoppen.is2050}
          t={t}
        />
      )}
    </div>
  );
};
