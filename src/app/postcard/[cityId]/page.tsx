import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trophy } from 'lucide-react';
import citiesData from '../../../data/curated-cities.json';
import { buildPostcardLayout } from '../../../lib/postcardArt';
import { getCountryFlag } from '../../../lib/geo';
import { City } from '../../../lib/types';

const cities = citiesData as City[];

function findCity(cityId: string): City | undefined {
  return cities.find((c) => c.id === cityId);
}

interface PostcardPageProps {
  params: Promise<{ cityId: string }>;
}

export async function generateMetadata({ params }: PostcardPageProps): Promise<Metadata> {
  const { cityId } = await params;
  const city = findCity(cityId);

  if (!city) {
    return {
      title: 'Postcard not found — Cityle',
      description: 'This Cityle postcard link references a city that no longer exists.',
    };
  }

  const title = `${city.name} — a Cityle Postcard`;
  const description = `A generative skyline poster for ${city.name}, ${city.country} — built from the city's own real urban-form data. Play Cityle, the daily city-guessing game built on real climate and urban data.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  };
}

// Read-only, purely a lookup + a deterministic render of buildPostcardLayout
// (Workstream JJ) — no game state, no client interactivity needed, so this
// stays a Server Component (unlike VictoryModal.tsx's own 'use client' game
// UI, or atlas/page.tsx's locale-reading client page).
export default async function PostcardPage({ params }: PostcardPageProps) {
  const { cityId } = await params;
  const city = findCity(cityId);

  if (!city) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#aab6c2] dot-matrix-bg">
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-3 py-8 sm:px-5">
        <span className="stamp text-[0.68rem] text-[#3FD17C]">Cityle Postcard</span>

        <div
          className="relative w-full overflow-hidden rounded-lg border border-white/12 shadow-2xl"
          style={{ aspectRatio: '1200 / 630' }}
        >
          {buildPostcardLayout(city)}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl font-bold text-[#F4F6F8] sm:text-3xl">
            {getCountryFlag(city.countryCode)} {city.name}
          </p>
          <p className="text-sm text-[#9aa7b3]">
            {city.country} · {city.continent} · {city.koppen_current.code}
          </p>
        </div>

        <p className="max-w-md text-center text-xs leading-relaxed text-[#6d7a86]">
          Generative art, deterministic per city — the same seed always draws the same postcard.
        </p>

        <Link
          href="/"
          className="nothing-button flex items-center justify-center gap-2 bg-[#3FD17C] text-[#0A0C10] hover:bg-[#3FD17C]/85"
        >
          <Trophy className="h-4 w-4" /> Play Cityle
        </Link>
      </main>
    </div>
  );
}
