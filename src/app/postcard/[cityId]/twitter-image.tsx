import { ImageResponse } from 'next/og';
import citiesData from '../../../data/curated-cities.json';
import { buildOgLayout } from '../../ogImageContent';
import { buildPostcardLayout, POSTCARD_WIDTH, POSTCARD_HEIGHT } from '../../../lib/postcardArt';
import { City } from '../../../lib/types';

const cities = citiesData as City[];

export const alt = 'Cityle Postcard — generative city skyline art';
export const size = {
  width: POSTCARD_WIDTH,
  height: POSTCARD_HEIGHT,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ cityId: string }> }) {
  const { cityId } = await params;
  const city = cities.find((c) => c.id === cityId);

  // Unrecognized id falls back to the same generic branded card the root
  // route uses, rather than a broken or blank render — same fallback
  // opengraph-image.tsx uses in this folder.
  if (!city) {
    return new ImageResponse(buildOgLayout(), { ...size });
  }

  return new ImageResponse(buildPostcardLayout(city), { ...size });
}
