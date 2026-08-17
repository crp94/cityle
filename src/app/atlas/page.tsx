'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GitCompare } from 'lucide-react';
import citiesData from '../../data/curated-cities.json';
import { SearchInput } from '../../components/SearchInput';
import { getCountryFlag } from '../../lib/geo';
import { getTranslation, Locale, Translations } from '../../lib/i18n';
import { City } from '../../lib/types';

const cities = citiesData as City[];

function useAtlasLocale(): Locale {
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
  return locale;
}

function CitySlot({
  slotLabel,
  city,
  onSelect,
  onClear,
  t,
  placeholder,
}: {
  slotLabel: string;
  city: City | null;
  onSelect: (city: City) => void;
  onClear: () => void;
  t: Translations;
  placeholder: string;
}) {
  // Reuses SearchInput's actual search-and-select UX (filtering, keyboard
  // nav, combobox a11y) as-is — no fork needed. Two pieces of copy are
  // guessing-game flavor that don't apply on a picker page, so they're
  // overridden via a derived `t` rather than by forking the component:
  // searchPlaceholder (per-slot) and the "⏎ GUESSES" hint label.
  const slotT = useMemo(
    () => ({ ...t, searchPlaceholder: placeholder, guesses: 'select' }),
    [t, placeholder]
  );

  return (
    <div className="nothing-widget flex flex-col gap-2.5 p-3.5 sm:p-4">
      <span className="stamp text-[#8f9dac]">{slotLabel}</span>
      {city ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="text-2xl leading-none">{getCountryFlag(city.countryCode)}</span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-[#F4F6F8]">{city.name}</div>
              <div className="truncate text-xs text-[#8f9dac]">{city.country}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-semibold text-[#3FD17C] hover:text-[#34D67E]"
          >
            Change
          </button>
        </div>
      ) : (
        <SearchInput cities={cities} onSelectCity={onSelect} alreadyGuessedIds={[]} t={slotT} />
      )}
    </div>
  );
}

// useSearchParams() requires a Suspense boundary above it (Next.js bails out
// of static prerendering otherwise — confirmed by a failing `npm run build`:
// "useSearchParams() should be wrapped in a suspense boundary at page
// '/atlas'"). Keeping the actual page content in this inner component and
// wrapping it in the default export below is the standard fix and doesn't
// change any behavior — cityB, the redirect effect, and CitySlot are all
// untouched.
function AtlasPickerPageContent() {
  const locale = useAtlasLocale();
  const t = useMemo(() => getTranslation(locale), [locale]);
  const router = useRouter();
  // Almanac "Compare" links land here as /atlas?cityA=<id> — resolve that
  // against the bundled city list once, on mount, via a lazy useState
  // initializer so there's no extra render/flash. Falls back to null (the
  // normal empty-slot state) when the id is missing or unrecognized. cityB
  // is untouched: it always starts unset and is picked via the existing
  // SearchInput/CitySlot flow below.
  const searchParams = useSearchParams();
  const [cityA, setCityA] = useState<City | null>(() => {
    const prefillId = searchParams.get('cityA');
    return prefillId ? cities.find((c) => c.id === prefillId) ?? null : null;
  });
  const [cityB, setCityB] = useState<City | null>(null);

  useEffect(() => {
    if (cityA && cityB) {
      router.push(`/atlas/${cityA.id}/${cityB.id}`);
    }
  }, [cityA, cityB, router]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:py-14">
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3FD17C]/40 bg-[#3FD17C]/10 text-[#3FD17C]">
            <GitCompare className="h-5 w-5" />
          </span>
          <span className="stamp text-[#3FD17C]">Cityle Atlas</span>
          <h1 className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">Compare any two cities</h1>
          <p className="max-w-md text-sm leading-relaxed text-[#8f9dac]">
            Pick two cities from the full pool to see them side by side — climate, population, mobility, and 2050
            outlook.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CitySlot
            slotLabel="City A"
            city={cityA}
            onSelect={setCityA}
            onClear={() => setCityA(null)}
            t={t}
            placeholder="Search for the first city..."
          />
          <CitySlot
            slotLabel="City B"
            city={cityB}
            onSelect={setCityB}
            onClear={() => setCityB(null)}
            t={t}
            placeholder="Search for the second city..."
          />
        </div>

        {cityA && cityB && (
          <p role="status" aria-live="polite" className="text-center text-xs text-[#8f9dac]">
            Comparing {cityA.name} and {cityB.name}…
          </p>
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

export default function AtlasPickerPage() {
  return (
    <Suspense fallback={null}>
      <AtlasPickerPageContent />
    </Suspense>
  );
}
