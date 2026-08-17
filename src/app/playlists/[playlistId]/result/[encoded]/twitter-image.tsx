import { ImageResponse } from 'next/og';
import { buildOgLayout } from '../../../../ogImageContent';
import { buildMultiRoundLayout, resolveMultiRoundResult } from '../../../../multiRoundImageContent';

export const alt = 'Cityle — personalized Playlist result';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ playlistId: string; encoded: string }>;
}) {
  const { playlistId, encoded } = await params;
  const resolved = resolveMultiRoundResult(encoded);
  const matches = resolved && resolved.kind === 'playlist' && resolved.collectionId === playlistId;
  // Falls back to the same generic brand card the root route already builds
  // whenever `encoded` is malformed, of the wrong kind, references a
  // different playlist than this URL's [playlistId], or references an id
  // that no longer resolves to a real city — never a broken/blank image.
  return new ImageResponse(matches ? buildMultiRoundLayout(resolved) : buildOgLayout(), { ...size });
}
