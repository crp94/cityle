import type { Metadata } from 'next';

// atlas/page.tsx is a Client Component ('use client'), and the `metadata`
// export is only supported in Server Components (see
// node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
// and .../04-functions/generate-metadata.md). This sibling layout.tsx is a
// plain Server Component (no 'use client') that owns the route's real
// metadata and simply renders {children}.
export const metadata: Metadata = {
  title: 'Atlas — Compare Any Two Cities | Cityle',
  description:
    'Pick any two cities from the full Cityle pool and see them side by side — climate, population, mobility, and 2050 climate outlook compared at a glance.',
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
