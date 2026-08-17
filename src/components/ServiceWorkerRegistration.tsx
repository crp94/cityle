'use client';

import { useEffect } from 'react';

/**
 * Registers the hand-rolled `/sw.js` service worker (see that file for the
 * caching strategy) so the app becomes installable and gets basic offline
 * support. Renders nothing — this is a mount-only side-effect component,
 * same shape as `<Analytics />` in layout.tsx.
 *
 * Production only. `sw.js`'s cache-first strategy for `/_next/static/*`
 * assumes those filenames are content-hashed and therefore safe to cache
 * forever — true for a real `next build`, but NOT true for `next dev`
 * (confirmed by live-testing: Turbopack's dev server can keep serving
 * updated content at the exact same chunk URL across a recompile). Running
 * the service worker in dev means an already-cached chunk silently goes
 * stale on every subsequent edit, with no way to tell short of manually
 * unregistering and clearing caches — exactly the "server recompiled but
 * the browser still shows the old bug" symptom this was tracked down from.
 * So: register only in production, and proactively self-heal dev browsers
 * that got a service worker + stale caches installed before this guard
 * existed (e.g. from an earlier `next start` or `next build` run against
 * the same origin/port).
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
      return;
    }

    // Development: undo any service worker + caches left over from a
    // previous production-mode visit to this same origin, so dev never
    // silently serves stale bundles.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.filter((name) => name.startsWith('cityle-')).forEach((name) => caches.delete(name));
      });
    }
  }, []);

  return null;
}
