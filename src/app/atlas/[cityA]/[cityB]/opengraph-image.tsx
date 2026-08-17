import { ImageResponse } from 'next/og';
import citiesData from '../../../../data/curated-cities.json';
import { buildOgLayout } from '../../../ogImageContent';
import { City } from '../../../../lib/types';
import { buildAtlasLayout } from './atlasImageContent';

const cities = citiesData as City[];

export const alt = 'Cityle Atlas — City Comparison';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// This is a server-rendered Route Handler-style file convention (not the
// client-component page), so `params` is awaited directly per this
// installed Next.js version's docs — unlike the sibling page.tsx, which is
// a Client Component and must use React's `use()` instead.
export default async function Image({
  params,
}: {
  params: Promise<{ cityA: string; cityB: string }>;
}) {
  const { cityA: cityAId, cityB: cityBId } = await params;
  const cityA = cities.find((c) => c.id === cityAId);
  const cityB = cities.find((c) => c.id === cityBId);

  // Either id failing to resolve to a real city falls back to the same
  // generic branded card the root route uses, rather than a broken or
  // half-populated comparison card.
  if (!cityA || !cityB) {
    return new ImageResponse(buildOgLayout(), { ...size });
  }

  return new ImageResponse(buildAtlasLayout(cityA, cityB), { ...size });
}
