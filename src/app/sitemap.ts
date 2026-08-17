import type { MetadataRoute } from 'next';

// Sitemap file convention (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md):
// a sitemap.ts under app/ that default-exports a function returning
// MetadataRoute.Sitemap is served by Next as /sitemap.xml automatically.
//
// Only the real, static entry points are listed here. Dynamic routes
// (Atlas's 255×254 city-pair combinations, per-playlist-run results,
// challenge codes) are deliberately not enumerated — there's no meaningful
// canonical set of those to index, and combinatorial enumeration would
// bloat the sitemap with URLs that have no independent SEO value.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/almanac`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/marathon`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/playlists`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/atlas`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
