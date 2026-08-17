import type { MetadataRoute } from 'next';

// PWA manifest file convention (see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.md):
// a manifest.ts under app/ that returns a MetadataRoute.Manifest is served by
// Next as /manifest.webmanifest automatically — no route file or metadata
// wiring needed elsewhere.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cityle — Urban Climate Deduction',
    short_name: 'Cityle',
    description:
      'Identify a curated global city in six guesses using progressive climate, population, urban-form, and map clues.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0C10',
    theme_color: '#0A0C10',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
