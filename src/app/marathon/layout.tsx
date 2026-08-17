import type { Metadata } from 'next';

// marathon/page.tsx is a Client Component ('use client'), and the `metadata`
// export is only supported in Server Components (see
// node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
// and .../04-functions/generate-metadata.md). This sibling layout.tsx is a
// plain Server Component (no 'use client') that owns the route's real
// metadata and simply renders {children}.
export const metadata: Metadata = {
  title: "Marathon — Today's 5-City Sequence | Cityle",
  description:
    "Marathon of the Day: five curated cities in the same guess sequence for every player today. Solve as many as you can — your score is directly comparable to anyone else who runs it.",
};

export default function MarathonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
