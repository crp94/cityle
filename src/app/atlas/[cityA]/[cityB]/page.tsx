'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Compass, Footprints, Leaf, Thermometer, TrendingUp, Users, Wind } from 'lucide-react';
import citiesData from '../../../../data/curated-cities.json';
import { MetricChip } from '../../../../components/MetricChip';
import { RobinsonMap } from '../../../../components/RobinsonMap';
import { Sparkline } from '../../../../components/Sparkline';
import { METRIC_GRADES } from '../../../../lib/colorGrading';
import { evaluateGuess } from '../../../../lib/gameLogic';
import { getCountryFlag } from '../../../../lib/geo';
import { getTranslation, Locale, Translations } from '../../../../lib/i18n';
import { City } from '../../../../lib/types';

const cities = citiesData as City[];

function CityColumn({ city, t }: { city: City; t: Translations }) {
  const hasFuture = Boolean(city.monthly_temps_2050_c && city.monthly_precip_2050_mm);

  return (
    <div className="flex flex-col gap-3">
      <div className="nothing-widget flex items-center gap-3 p-3.5 sm:p-4">
        <span className="text-3xl leading-none" aria-hidden>
          {getCountryFlag(city.countryCode)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-[#F4F6F8] sm:text-xl">{city.name}</h2>
          <p className="truncate text-xs text-[#8f9dac]">
            {city.country} · {city.continent}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <MetricChip
          label={t.metroPop}
          value={(city.population_metro / 1_000_000).toFixed(1)}
          unit="M"
          icon={<Users className="h-3.5 w-3.5" />}
        />
        <MetricChip
          label={t.pm25Label}
          value={city.pm25_annual_ugm3}
          unit="µg/m³"
          subtext={city.aqi_tier}
          icon={<Wind className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.pm25(city.pm25_annual_ugm3)}
        />
        <MetricChip
          label={t.meanTempLabel}
          value={city.temp_mean_annual_c.toFixed(1)}
          unit="°C"
          icon={<Thermometer className="h-3.5 w-3.5" />}
        />
        <MetricChip
          label={t.elevationLabel}
          value={city.elevation_m}
          unit="m"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.elevation(city.elevation_m)}
        />
        <MetricChip
          label={t.currentKoppenLabel}
          value={city.koppen_current.code}
          subtext={city.koppen_current.name}
          icon={<Compass className="h-3.5 w-3.5" />}
        />
        <MetricChip
          label={t.modalShareLabel}
          value={city.transit_active_share_pct}
          unit="%"
          icon={<Footprints className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.modalShare(city.transit_active_share_pct)}
        />
        <MetricChip
          label={t.canopyLabel}
          value={city.tree_canopy_pct}
          unit="%"
          icon={<Leaf className="h-3.5 w-3.5" />}
          grade={METRIC_GRADES.treeCanopy(city.tree_canopy_pct)}
        />
      </div>

      <Sparkline
        monthlyTemps={city.monthly_temps_c}
        monthlyPrecip={city.monthly_precip_mm}
        monthlyTemps2050={city.monthly_temps_2050_c}
        monthlyPrecip2050={city.monthly_precip_2050_mm}
        showFuture={hasFuture}
        t={t}
      />
    </div>
  );
}

export default function AtlasComparePage({
  params,
}: {
  params: Promise<{ cityA: string; cityB: string }>;
}) {
  // All hooks are called unconditionally, before the notFound() guard below,
  // so hook order never depends on whether the two ids resolve to real
  // cities — see the comment on the guard for why.
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    // Deferred via requestAnimationFrame, matching GameApp.tsx's own
    // localStorage-restore effect — calling setState synchronously in the
    // effect body trips the react-hooks/set-state-in-effect lint rule.
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
  const t = useMemo(() => getTranslation(locale), [locale]);

  // This is a Client Component page, so `params` (a Promise, per this
  // installed Next.js version's docs) is unwrapped with React's `use()`
  // rather than `await` — `use()` is explicitly documented as safe to call
  // this way in Client Component pages, unlike a plain hook.
  const { cityA: cityAId, cityB: cityBId } = use(params);
  const cityA = cities.find((c) => c.id === cityAId);
  const cityB = cities.find((c) => c.id === cityBId);

  // Guard clause, not a branch containing hooks — everything below this line
  // is plain data derivation and JSX, so no hook is ever called
  // conditionally relative to this check.
  if (!cityA || !cityB) {
    notFound();
  }

  // Reuse RobinsonMap exactly as built for guess trajectories, without
  // modifying it: evaluateGuess is a pure (guessCity, targetCity, guessNumber)
  // function, so calling it both ways round produces two GuessResult entries
  // with a shared (symmetric) distanceKm/closenessPct — real GuessResults,
  // not guesses. RobinsonMap already draws a connecting line between
  // sequential entries (antimeridian-aware) and a pin for each, which is
  // exactly "two pins with a connecting line" with zero changes to that file.
  const guesses = [evaluateGuess(cityA, cityB, 1), evaluateGuess(cityB, cityA, 2)];

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="stamp text-[#3FD17C]">Cityle Atlas</span>
            <h1 className="text-xl font-bold text-[#F4F6F8] sm:text-2xl">
              {cityA.name} vs {cityB.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/atlas" className="text-[#3FD17C] hover:text-[#34D67E]">
              Compare different cities
            </Link>
            <Link href="/" className="text-[#8f9dac] hover:text-[#F4F6F8]">
              Play Cityle
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <CityColumn city={cityA} t={t} />
          <CityColumn city={cityB} t={t} />
        </div>

        <div className="flex flex-col gap-2">
          <RobinsonMap guesses={guesses} isGameOver t={t} />
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[0.68rem] text-[#8f9dac]">
            <span className="inline-flex items-center gap-1.5">
              <span className="mono font-bold text-[#F4F6F8]">#1</span> {cityA.name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="mono font-bold text-[#F4F6F8]">#2</span> {cityB.name}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
