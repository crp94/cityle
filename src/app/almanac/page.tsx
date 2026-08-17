'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, X } from 'lucide-react';
import citiesData from '../../data/curated-cities.json';
import { AlmanacCard } from '../../components/AlmanacCard';
import { getTranslation, Locale, Translations } from '../../lib/i18n';
import { City, Continent } from '../../lib/types';

const cities = citiesData as City[];

const CONTINENTS: Continent[] = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];
const KOPPEN_GROUPS = ['A', 'B', 'C', 'D', 'E'] as const;
type KoppenGroup = (typeof KOPPEN_GROUPS)[number];

// Population tier boundaries (Workstream U) — bucket population_metro into
// four bands. These aren't defined anywhere reusable elsewhere in the
// codebase, so they're named constants here, the single source of truth for
// this page's population filter.
const MEGACITY_MIN = 10_000_000;
const LARGE_MIN = 3_000_000;
const MID_MIN = 1_000_000;
const SMALL_MID_MIN = 250_000;

type PopulationTier = 'megacity' | 'large' | 'mid' | 'small-mid';
const POPULATION_TIERS: PopulationTier[] = ['megacity', 'large', 'mid', 'small-mid'];

// Batch size for the grid below. All 255 curated cities have a real photo
// hotlinked from upload.wikimedia.org (no local hosting/CDN — see
// AlmanacCard.tsx's comment), and Wikimedia rate-limits bursts of hotlinked
// image requests from a single origin. Mounting all 255 <img> tags at once
// relied solely on native `loading="lazy"` to avoid a burst, which isn't
// enough protection against a fast scroll or repeated filter changes in one
// session. Capping how many cards are ever mounted at once — growing the
// visible batch on scroll or via the "load more" control, and resetting back
// to one batch whenever the filtered set changes — keeps concurrent image
// requests bounded regardless of how the grid is used.
const PAGE_SIZE = 48;

function getPopulationTier(populationMetro: number): PopulationTier | null {
  if (populationMetro >= MEGACITY_MIN) return 'megacity';
  if (populationMetro >= LARGE_MIN) return 'large';
  if (populationMetro >= MID_MIN) return 'mid';
  if (populationMetro >= SMALL_MID_MIN) return 'small-mid';
  return null;
}

function tierLabel(tier: PopulationTier, t: Translations): string {
  switch (tier) {
    case 'megacity':
      return t.almanacTierMegacity;
    case 'large':
      return t.almanacTierLarge;
    case 'mid':
      return t.almanacTierMid;
    case 'small-mid':
      return t.almanacTierSmallMid;
  }
}

// Mirrors the locale-restore pattern already used independently by
// GameApp.tsx and src/app/atlas/page.tsx — deferred via requestAnimationFrame
// so the state update doesn't happen synchronously inside the effect body
// (trips the react-hooks/set-state-in-effect lint rule).
function useAlmanacLocale(): Locale {
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

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`mono rounded-md border px-2.5 py-1.5 text-[0.68rem] font-semibold transition-colors ${
        active
          ? 'border-[#3FD17C] bg-[#3FD17C]/15 text-[#eef1f3]'
          : 'border-[#2a3340] bg-[#131922]/50 text-[#8f9dac] hover:border-[#3FD17C]/40 hover:text-[#c5ced7]'
      }`}
    >
      {label}
    </button>
  );
}

export default function AlmanacPage() {
  const locale = useAlmanacLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);

  const [query, setQuery] = useState('');
  const [selectedContinents, setSelectedContinents] = useState<Set<Continent>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<KoppenGroup>>(new Set());
  const [selectedTiers, setSelectedTiers] = useState<Set<PopulationTier>>(new Set());

  const filteredCities = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return cities.filter((city) => {
      if (selectedContinents.size > 0 && !selectedContinents.has(city.continent)) return false;

      const group = city.koppen_current.code.charAt(0) as KoppenGroup;
      if (selectedGroups.size > 0 && !selectedGroups.has(group)) return false;

      if (selectedTiers.size > 0) {
        const tier = getPopulationTier(city.population_metro);
        if (!tier || !selectedTiers.has(tier)) return false;
      }

      if (cleanQuery.length > 0) {
        const matches =
          city.name.toLowerCase().includes(cleanQuery) || city.country.toLowerCase().includes(cleanQuery);
        if (!matches) return false;
      }

      return true;
    });
  }, [query, selectedContinents, selectedGroups, selectedTiers]);

  const hasActiveFilters =
    query.trim().length > 0 || selectedContinents.size > 0 || selectedGroups.size > 0 || selectedTiers.size > 0;

  const clearFilters = () => {
    setQuery('');
    setSelectedContinents(new Set());
    setSelectedGroups(new Set());
    setSelectedTiers(new Set());
  };

  // Only the first `visibleCount` filtered cities are ever mounted — see the
  // PAGE_SIZE comment above. Resets to a fresh first page whenever the
  // filtered set itself changes (filteredCities is a new array reference
  // only when query/selectedContinents/selectedGroups/selectedTiers change),
  // so switching filters doesn't compound the count from the previous view.
  // Adjusts state during render rather than in an effect — the recommended
  // React pattern for "reset state when a prop/computed value changes" —
  // since a setState-in-effect here would trigger an extra, avoidable
  // cascading render (and trips this repo's react-hooks/set-state-in-effect
  // lint rule).
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pageResetKey, setPageResetKey] = useState(filteredCities);
  if (pageResetKey !== filteredCities) {
    setPageResetKey(filteredCities);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleCities = useMemo(() => filteredCities.slice(0, visibleCount), [filteredCities, visibleCount]);
  const hasMore = visibleCount < filteredCities.length;
  const loadMore = () => setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredCities.length));

  // Auto-grow the batch as the user scrolls near the bottom of the grid, in
  // addition to the explicit "load more" button below — either interaction
  // pulls in the next PAGE_SIZE cities rather than mounting everything.
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredCities.length));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredCities.length]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:py-14">
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3FD17C]/40 bg-[#3FD17C]/10 text-[#3FD17C]">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="stamp text-[#3FD17C]">{t.appName}</span>
          <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">{t.almanacTitle}</h1>
          <p className="max-w-lg text-sm leading-relaxed text-[#8f9dac]">{t.almanacSubtitle}</p>
        </header>

        <div className="nothing-widget flex flex-col gap-4 p-3.5 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6773]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.almanacSearchPlaceholder}
              aria-label={t.almanacSearchPlaceholder}
              className="w-full rounded-md border border-[#2a3340] bg-[#0e1319] py-2.5 pl-9 pr-3 text-sm text-[#eef1f3] placeholder:text-[#5c6773] focus:border-[#3FD17C]/60 focus:outline-none"
            />
          </div>

          <div role="group" aria-label={t.almanacFilterContinentLabel} className="flex flex-col gap-1.5">
            <span className="stamp text-[#8f9dac]">{t.almanacFilterContinentLabel}</span>
            <div className="flex flex-wrap gap-1.5">
              {CONTINENTS.map((continent) => (
                <FilterChip
                  key={continent}
                  label={continent}
                  active={selectedContinents.has(continent)}
                  onClick={() => setSelectedContinents((prev) => toggleInSet(prev, continent))}
                />
              ))}
            </div>
          </div>

          <div role="group" aria-label={t.almanacFilterKoppenLabel} className="flex flex-col gap-1.5">
            <span className="stamp text-[#8f9dac]">{t.almanacFilterKoppenLabel}</span>
            <div className="flex flex-wrap gap-1.5">
              {KOPPEN_GROUPS.map((group) => (
                <FilterChip
                  key={group}
                  label={group}
                  active={selectedGroups.has(group)}
                  onClick={() => setSelectedGroups((prev) => toggleInSet(prev, group))}
                />
              ))}
            </div>
          </div>

          <div role="group" aria-label={t.almanacFilterPopulationLabel} className="flex flex-col gap-1.5">
            <span className="stamp text-[#8f9dac]">{t.almanacFilterPopulationLabel}</span>
            <div className="flex flex-wrap gap-1.5">
              {POPULATION_TIERS.map((tier) => (
                <FilterChip
                  key={tier}
                  label={tierLabel(tier, t)}
                  active={selectedTiers.has(tier)}
                  onClick={() => setSelectedTiers((prev) => toggleInSet(prev, tier))}
                />
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-3">
              <span className="mono text-[0.68rem] text-[#8f9dac]">
                {t.almanacResultsCount.replace('{n}', String(filteredCities.length)).replace('{total}', String(cities.length))}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="mono inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[#8f9dac] hover:text-[#eef1f3]"
              >
                <X className="h-3 w-3" />
                {t.almanacClearFilters}
              </button>
            </div>
          )}
        </div>

        {filteredCities.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visibleCities.map((city) => (
                <AlmanacCard key={city.id} city={city} t={t} />
              ))}
            </div>
            {hasMore && (
              <div ref={loadMoreSentinelRef} className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={loadMore}
                  className="mono rounded-md border border-[#2a3340] bg-[#131922]/50 px-4 py-2 text-[0.7rem] font-semibold text-[#8f9dac] transition-colors hover:border-[#3FD17C]/40 hover:text-[#c5ced7]"
                >
                  {t.almanacLoadMore}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="nothing-widget flex flex-col items-center gap-2 p-8 text-center">
            <p className="text-sm text-[#8f9dac]">{t.almanacEmptyState}</p>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]">
            {t.marathonBackToCityle}
          </Link>
        </div>
      </div>
    </div>
  );
}
