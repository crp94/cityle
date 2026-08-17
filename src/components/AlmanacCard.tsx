'use client';

import Link from 'next/link';
import { GitCompare } from 'lucide-react';
import { getCountryFlag } from '../lib/geo';
import { Translations } from '../lib/i18n';
import { City } from '../lib/types';

interface AlmanacCardProps {
  city: City;
  t: Translations;
}

/**
 * A single card in the /almanac grid. Deliberately shows EXACTLY four things:
 * photo, name, country (+ flag), and the current Köppen code — nothing else.
 * This is a hard product requirement, not a style choice: the Almanac is a
 * light, spoiler-safe preview, so no population/temperature/PM2.5/other stat
 * ever renders here, in any state (including hover), and the only click-through
 * is the "Compare" link into Atlas mode — never a detail view.
 *
 * Every city in the curated pool has a real image_url as of Phase 3, so this
 * always renders the photo with no placeholder/fallback path. Uses a plain
 * <img> (not next/image) to match the established pattern in CityPhoto.tsx —
 * all photos are served from a single external host (upload.wikimedia.org)
 * that isn't configured in next.config.ts's images.remotePatterns, and adding
 * that config is out of scope for this workstream.
 */
export function AlmanacCard({ city, t }: AlmanacCardProps) {
  return (
    <div className="nothing-widget flex flex-col overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={city.image_url}
        alt={city.image_caption || city.name}
        loading="lazy"
        className="h-32 w-full object-cover sm:h-36"
      />
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#F4F6F8]">{city.name}</div>
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-[#8f9dac]">
              <span className="shrink-0 text-sm leading-none">{getCountryFlag(city.countryCode)}</span>
              <span className="truncate">{city.country}</span>
            </div>
          </div>
          <span className="chip shrink-0">{city.koppen_current.code}</span>
        </div>
        <Link
          href={`/atlas?cityA=${city.id}`}
          className="chip mt-auto items-center justify-center gap-1.5 text-center text-[#3FD17C] transition-colors hover:border-[#3FD17C]/60 hover:bg-[#3FD17C]/10 hover:text-[#34D67E]"
        >
          <GitCompare className="h-3 w-3" />
          {t.almanacCompareCta}
        </Link>
      </div>
    </div>
  );
}
