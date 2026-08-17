'use client';

import { useEffect } from 'react';

/**
 * Registers the hand-rolled `/sw.js` service worker (see that file for the
 * caching strategy) so the app becomes installable and gets basic offline
 * support. Renders nothing — this is a mount-only side-effect component,
 * same shape as `<Analytics />` in layout.tsx.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  return null;
}
