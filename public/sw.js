/**
 * Cityle service worker — hand-rolled, no third-party library/dependency.
 *
 * Strategy summary:
 *  - Precache a small set of stable, un-hashed app-shell URLs on install
 *    (the root document, the manifest, and the icon set). Next's actual
 *    JS/CSS bundles under /_next/static/ are content-hashed per build, so
 *    their filenames aren't known ahead of time here — they're picked up
 *    opportunistically at runtime instead (see "cache-first" below), which
 *    still leaves them cached after the first real page load.
 *  - Cache-first for content-hashed assets (Next's /_next/static/ JS & CSS
 *    chunks) — the filename itself changes whenever the content does, so
 *    a cached response is safe to trust forever and never needs
 *    revalidation.
 *  - Stale-while-revalidate for same-path static assets that AREN'T
 *    content-hashed (/icons/*, /_next/image responses, and anything else
 *    served straight out of /public — scripts, styles, images, fonts not
 *    under /_next/static/): serve the cached response immediately if
 *    present, but also kick off a background fetch that refreshes the
 *    cache for next time. A pure cache-first strategy here would let a
 *    future deploy that replaces e.g. /cityle-logo.png or a PWA icon at
 *    the same path get served stale forever, since CACHE_VERSION below is
 *    a hand-edited string with no automated bump tied to real deploys —
 *    stale-while-revalidate self-heals within one extra visit instead of
 *    relying on someone remembering to bump it.
 *  - Network-first, falling back to cache, for navigation requests (i.e.
 *    HTML document loads): always prefer the freshest page when online,
 *    but if the network fails (offline), fall back to whatever was last
 *    cached for that URL so the app still opens offline after a first
 *    visit, showing the last successfully-loaded state.
 *  - Third-party CARTO map tiles (*.basemaps.cartocdn.com) are explicitly
 *    NOT intercepted or cached — they're left to fail/fetch normally, so
 *    the map background simply won't render offline. That's an accepted,
 *    documented limitation, not a bug.
 *
 * `curated-cities.json` is intentionally NOT precached as a standalone
 * asset: it's imported directly into application code (see
 * `src/scripts/buildCuratedCities.ts`'s output and every `import
 * citiesData from '.../data/curated-cities.json'` call site), so the
 * bundler inlines it into the JS chunks rather than the browser ever
 * issuing a network request for a `curated-cities.json` URL at runtime
 * (confirmed by building the app and inspecting both the production
 * webpack bundle and the dev server's chunks — the city data shows up
 * inside ordinary hashed JS chunk files, never as its own request).
 * Caching those JS chunks under the cache-first strategy below already
 * covers it.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `cityle-${CACHE_VERSION}`;

// Small, stable (non-content-hashed) app-shell URLs safe to precache by
// literal path. Deliberately does not list /_next/static/* chunk files —
// those are content-hashed per build and unknown to this hand-written file.
const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/cityle-logo.png',
  '/favicon.ico',
];

const THIRD_PARTY_HOSTS_TO_SKIP = ['basemaps.cartocdn.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Precache best-effort: a single missing/erroring URL (e.g. a route
      // that 404s in some environment) shouldn't abort installation of the
      // whole service worker.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((error) => {
            console.warn(`[sw] failed to precache ${url}`, error);
          })
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('cityle-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

function isThirdPartyTileRequest(url) {
  return THIRD_PARTY_HOSTS_TO_SKIP.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function isStaticAssetRequest(request, url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/_next/image')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  const destination = request.destination;
  return destination === 'script' || destination === 'style' || destination === 'image' || destination === 'font';
}

// Filename changes whenever the content does — a cached response never
// goes stale, so a network round-trip on every request would be pure
// waste. Everything else matched by isStaticAssetRequest() is same-path
// (the URL doesn't change when the file's content does), so it goes
// through staleWhileRevalidate() instead.
function isContentHashedRequest(url) {
  return url.pathname.startsWith('/_next/static/');
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkUpdate = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    // Don't block on the network — let the update land in the background
    // so the NEXT request for this same path gets the fresh version.
    return cached;
  }

  const fresh = await networkUpdate;
  if (fresh) return fresh;
  throw new Error('[sw] no cached response and network fetch failed');
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // No network and nothing cached for this exact URL yet (e.g. first-ever
    // visit was offline) — fall back to the cached root shell if we have
    // it, otherwise let the failure propagate.
    const shell = await cache.match('/');
    if (shell) return shell;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only ever intercept same-effect, cacheable GET requests.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Explicitly leave third-party CARTO map tiles alone — no caching, no
  // offline fallback, they just fail gracefully like any other uncached
  // cross-origin request would.
  if (isThirdPartyTileRequest(url)) return;

  // Only handle same-origin requests beyond this point.
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate' || request.destination === 'document';

  if (isNavigation) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(isContentHashedRequest(url) ? cacheFirst(request) : staleWhileRevalidate(request));
    return;
  }

  // Everything else (same-origin API-ish/dynamic requests) passes through
  // untouched — no caching, default browser network behavior.
});
