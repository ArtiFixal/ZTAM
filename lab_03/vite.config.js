import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const API_ORIGIN = 'https://api.openweathermap.org';

// Funkcja proxy z /api/weather do OpenWeatherMap. Klucz jest przechowywany po 
// strone serwera, więc nie ma go w kodzie aplikacji, ani w adresach zapytań
// widocznych w przeglądarce gdyż dopisuje go serwer.
function weatherProxy(apiKey) {
  return {
    '/api/weather': {
      target: API_ORIGIN,
      changeOrigin: true,
      rewrite: (path) => {
        const url = new URL(path, API_ORIGIN);
        url.pathname = '/data/2.5/weather';
        url.searchParams.set('appid', apiKey);
        return url.pathname + url.search;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const { WEATHER_KEY = '' } = loadEnv(mode, process.cwd(), '');
  if (!WEATHER_KEY) console.warn('Brak WEATHER_KEY w pliku .env - zapytania o pogodę zwrócą błąd 401.');
  const proxy = weatherProxy(WEATHER_KEY);

  return {
    server: { proxy },
    preview: { proxy },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          id: '/',
          name: 'Pogoda',
          short_name: 'Pogoda',
          description: 'Aktualna pogoda dla wybranego miasta',
          lang: 'pl',
          display: 'standalone',
          background_color: '#1e3c72',
          theme_color: '#1e3c72',
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          screenshots: [
            { src: 'screenshot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: 'Pogoda dla wybranego miasta' },
            { src: 'screenshot-narrow.png', sizes: '390x844', type: 'image/png', label: 'Pogoda na telefonie' },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Ostatnia zapisana odpowiedź gdy offline
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname === '/api/weather',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'weather-api',
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://openweathermap.org' &&
                url.pathname.startsWith('/img/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'weather-icons',
                expiration: { maxEntries: 50 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  };
});
