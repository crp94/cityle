import type { Metadata } from 'next';

// almanac/page.tsx is a Client Component ('use client'), and the `metadata`
// export is only supported in Server Components (see
// node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
// and .../04-functions/generate-metadata.md: "The metadata object and
// generateMetadata function exports are only supported in Server
// Components"). This sibling layout.tsx is a plain Server Component (no
// 'use client') that owns the route's real metadata and simply renders
// {children} — the documented pattern for giving a Client Component page
// real per-route metadata without restructuring the page itself.
export const metadata: Metadata = {
  title: 'City Almanac — Browse All 255 Cities | Cityle',
  description:
    'Browse the full curated pool of 255 Cityle cities — photo, flag, and Köppen climate class for every one, filterable by continent, climate group, and population tier. No spoilers, no stats.',
};

export default function AlmanacLayout({ children }: { children: React.ReactNode }) {
  return children;
}
