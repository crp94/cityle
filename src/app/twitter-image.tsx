import { ImageResponse } from 'next/og';
import { buildOgLayout } from './ogImageContent';

export const alt = 'Cityle — Urban & Climate Deduction';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(buildOgLayout(), { ...size });
}
