import { ImageResponse } from 'next/og';
import { buildOgLayout } from '../../ogImageContent';
import { buildResultLayout, resolveResult } from './resultImageContent';

export const alt = 'Cityle — personalized result';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ encoded: string }> }) {
  const { encoded } = await params;
  const resolved = resolveResult(encoded);
  // Falls back to the same generic brand card the root route already builds
  // whenever `encoded` is malformed or references an id that no longer
  // resolves to a real city — never a broken/blank image.
  return new ImageResponse(resolved ? buildResultLayout(resolved) : buildOgLayout(), { ...size });
}
