import { ImageResponse } from 'next/og';
import { buildOgLayout } from '../../../ogImageContent';
import { buildMultiRoundLayout, resolveMultiRoundResult } from '../../../multiRoundImageContent';

export const alt = 'Cityle — personalized Marathon result';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ encoded: string }> }) {
  const { encoded } = await params;
  const resolved = resolveMultiRoundResult(encoded);
  // Falls back to the same generic brand card the root route already builds
  // whenever `encoded` is malformed, of the wrong kind, or references an id
  // that no longer resolves to a real city — never a broken/blank image.
  return new ImageResponse(
    resolved && resolved.kind === 'marathon' ? buildMultiRoundLayout(resolved) : buildOgLayout(),
    { ...size }
  );
}
