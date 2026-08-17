'use client';

import { useState, type ReactNode } from 'react';
import { track } from '@vercel/analytics';
import {
  Building2,
  CloudRain,
  Compass,
  Droplets,
  Flame,
  Footprints,
  Gauge,
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
  t: Translations;
  locale: Locale;
}

// --- "Choose Your Clue" token economy ---------------------------------------
//
// Six categories total. Climate & Air is free in Standard difficulty (always
// unlocked, no token cost) but is gated behind the player's first token in
// Hard Mode, exactly like the other five. Bonus Insight is reachable only
// once guessCount hits 6 (the final guess) or later, giving the 5 dead
// colorGrading functions (gdp/coastalRisk/aridity/carbonFootprint/warmingRate)
// their first real home in the app.
type ClueCategory =
  | 'climateAir'
  | 'peopleEconomy'
  | 'mobilityForm'
  | '2050Outlook'
  | 'placeMap'
  | 'bonusInsight';

const CATEGORY_ORDER: ClueCategory[] = [
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

function initialUnlocked(difficulty: Difficulty): Set<ClueCategory> {
  return new Set(difficulty === 'standard' ? (['climateAir'] as ClueCategory[]) : []);
}

/**
 * Which categories a token can be spent on right now, given what's already
 * unlocked, the difficulty, and how many guesses have been made.
 *
 * Hard Mode: "no free choice" — tokens must be spent in the fixed original
 * order (Climate & Air is now part of that order too, since nothing is free
 * in Hard Mode), so there is always at most one valid target.
 *
 * Standard: free choice among the four non-bonus categories, until guess 6 —
 * at that point (guess 6's token, or any leftover banked token) the ONLY
 * valid target becomes Bonus Insight. Bonus Insight is never reachable
 * before guess 6, no matter how many tokens are banked.
 */
function getSpendableTargets(
  unlocked: Set<ClueCategory>,
  difficulty: Difficulty,
  guessCount: number
): ClueCategory[] {
  if (difficulty === 'hard') {
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
}: {
  city: City;
  t: Translations;
  onOpenKoppen: () => void;
}) {
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
// intentionally local, ephemeral state — not part of GameState/localStorage
// (see module comment). Wrapping it in its own component keyed on city.id
// lets a new target city reset every bit of that state for free, by letting
// React unmount-and-remount fresh state rather than hand-rolling a
// setState-in-effect reset (which both defeats React's "derive during
// render" idiom and trips the react-hooks/set-state-in-effect lint rule).
export const Dossier = (props: DossierProps) => <DossierGame key={props.city.id} {...props} />;

const DossierGame = ({ city, guessCount, difficulty, t, locale }: DossierProps) => {
  const [selectedKoppen, setSelectedKoppen] = useState<{ code: string; is2050: boolean } | null>(null);
  const [unlockedCategories, setUnlockedCategories] = useState<Set<ClueCategory>>(() =>
    initialUnlocked(difficulty)
  );
  const [activeCategory, setActiveCategory] = useState<ClueCategory>('climateAir');
  // Unspent Intel Tokens, one entry per token, storing the guess number that
  // minted it (oldest first). The array length IS "bankedTokens" — there's no
  // separate counter to keep in sync, so a token can never be double-counted
  // or spent twice by construction: spending always splices exactly one
  // entry out of this array at the moment a category is unlocked.
  const [availableTokens, setAvailableTokens] = useState<number[]>([]);
  // How many guesses' worth of tokens have already been minted into
  // availableTokens. Comparing this plain render-time state to the current
  // guessCount prop — and calling setState conditionally, during render,
  // rather than in a useEffect — is React's documented pattern for
  // "adjusting state when a prop changes"; it avoids the extra
  // effect-triggered render pass a useEffect version would need.
  const [mintedThroughGuess, setMintedThroughGuess] = useState(0);

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

  const spendableTargets = getSpendableTargets(unlockedCategories, difficulty, guessCount);
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
        <CityPhoto city={city} />
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

      <PinnedHeader city={city} t={t} onOpenKoppen={() => setSelectedKoppen({ code: city.koppen_current.code, is2050: false })} />

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
