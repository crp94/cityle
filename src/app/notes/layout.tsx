import type { Metadata } from 'next';

// notes/page.tsx is a Client Component ('use client'), and the `metadata`
// export is only supported in Server Components (see
// node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
// and .../04-functions/generate-metadata.md). This sibling layout.tsx is a
// plain Server Component (no 'use client') that owns the route's real
// metadata and simply renders {children} — same split already used by
// src/app/playlists/layout.tsx, src/app/almanac/layout.tsx and
// src/app/marathon/layout.tsx.
export const metadata: Metadata = {
  title: "Curator's Notes | Cityle",
  description:
    "First-person essays from Cityle's curator — why specific cities earned a spot in the pool, honest limits of the data, and the equity angle behind the game's numbers.",
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
