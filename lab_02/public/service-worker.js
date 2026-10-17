// Ten lab nie zapisuje plików w cache.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    // Wszystkie powiadomienia wracają do aplikacji, także w podkatalogu.
    const appUrl = new URL('./', self.registration.scope);
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => {
      const url = new URL(client.url);
      return url.origin === appUrl.origin && url.pathname.startsWith(appUrl.pathname);
    });
    if (existing) return existing.focus();
    return self.clients.openWindow(appUrl.href);
  })());
});

self.addEventListener('push', (event) => {
  let message = { title: 'Web Push', body: event.data ? event.data.text() : '' };
  try {
    const data = event.data?.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      message = {
        title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Web Push',
        body: typeof data.body === 'string' ? data.body : '',
      };
    }
  } catch { /* Zwykły tekst, np. z DevTools. */ }
  event.waitUntil(self.registration.showNotification(message.title, {
    body: message.body,
    icon: new URL('android.png', self.registration.scope).href,
    data: { url: self.registration.scope },
  }));
});
