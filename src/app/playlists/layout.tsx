import type { Metadata } from 'next';

// playlists/page.tsx is a Client Component ('use client'), and the
// `metadata` export is only supported in Server Components (see
// node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
// and .../04-functions/generate-metadata.md). This sibling layout.tsx is a
// plain Server Component (no 'use client') that owns the route's real
// metadata and simply renders {children}.
export const metadata: Metadata = {
  title: 'Curated Playlists | Cityle',
  description:
    'Themed, curated runs through the Cityle city pool — built around one climate or urban angle at a time, using the same guess-and-clue mechanics as Marathon. Play any playlist, in any order.',
};

export default function PlaylistsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
