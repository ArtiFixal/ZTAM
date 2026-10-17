/* Workbox jak w instrukcji; lokalne moduły pozwalają uruchamiać SW bez CDN. */
importScripts('./vendor/workbox/workbox-sw.js');
workbox.setConfig({ modulePathPrefix: './vendor/workbox/', debug: false });
importScripts('./precache-manifest.js');

const { core, precaching, routing, strategies } = workbox;
// Zakres w nazwach cache zapobiega konfliktom aplikacji w podkatalogach jednej domeny.
core.setCacheNameDetails({ prefix: 'moja-pwa', suffix: self.registration.scope });
precaching.cleanupOutdatedCaches();
precaching.precacheAndRoute(self.__PRECACHE_MANIFEST);

// Znane pliki szkieletu obsługuje precache; pozostałe strony: NetworkFirst.
routing.registerRoute(
  ({ request, url }) => request.mode === 'navigate' && url.href.startsWith(self.registration.scope),
  new strategies.NetworkFirst({ cacheName: `strony-${self.registration.scope}`, networkTimeoutSeconds: 3 })
);
routing.registerRoute(
  ({ request, url }) => request.destination === 'image' && url.origin === self.location.origin,
  new strategies.CacheFirst({ cacheName: `obrazy-${self.registration.scope}` })
);
routing.setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    const fallback = await precaching.matchPrecache('offline.html');
    if (fallback) {
      // Odpowiedź bez flagi redirected, również przy hostingu z przekierowaniami.
      return new Response(fallback.body, { status: 200, headers: fallback.headers });
    }
  }
  return Response.error();
});

// Pierwsza wizyta zostaje objęta kontrolą po zakończeniu precache.
// Aktualizacja czeka na zamknięcie starych kart (bez automatycznego skipWaiting).
core.clientsClaim();
