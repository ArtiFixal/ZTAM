'use strict';

const installButton = document.querySelector('.install-button');
const installMessage = document.querySelector('.install-message');
const offlineStatus = document.querySelector('#offline-status');
let deferredPrompt = null;

function updateConnection() {
  document.body.classList.toggle('is-offline', !navigator.onLine);
  document.querySelector('#connection-status').textContent = navigator.onLine
    ? 'Online — jesteś w sieci' : 'Offline — korzystasz bez sieci';
}
updateConnection();
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);

// Przycisk pozostaje ukryty, dopóki przeglądarka sama nie zgłosi możliwości instalacji.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
  deferredPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  installButton.hidden = true;
  try {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    installMessage.textContent = outcome === 'accepted'
      ? 'Zaakceptowano instalację aplikacji.'
      : 'Instalacja anulowana. Nadal możesz korzystać z aplikacji w przeglądarce.';
  } catch (error) {
    installMessage.textContent = 'Nie udało się otworzyć okna instalacji. Spróbuj opcji w menu przeglądarki.';
    console.error('Błąd instalacji:', error);
  }
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  installButton.hidden = true;
  installMessage.textContent = 'Aplikacja została zainstalowana.';
});

if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(async (registration) => {
      console.info('Service worker zarejestrowany, zakres:', registration.scope);
      await navigator.serviceWorker.ready;
      offlineStatus.textContent = 'Aplikacja jest gotowa do pracy offline.';
    })
    .catch((error) => {
      offlineStatus.textContent = 'Nie udało się przygotować pracy offline. Sprawdź połączenie i odśwież stronę.';
      console.error('Błąd rejestracji service workera:', error);
    });
} else {
  offlineStatus.textContent = 'Tryb offline wymaga obsługi service workera oraz HTTPS lub localhost.';
}
