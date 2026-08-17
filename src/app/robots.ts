import type { MetadataRoute } from 'next';

// Robots file convention (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md):
// a robots.ts under app/ that default-exports a function returning
// MetadataRoute.Robots is served by Next as /robots.txt automatically.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /result/* and /challenge/* are personalized, per-player pages (a
      // specific completed game's guess trail / a specific challenge
      // invite) — no canonical SEO value, and no reason for a search
      // engine to index someone's specific completed game result.
      disallow: ['/result/*', '/challenge/*'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
