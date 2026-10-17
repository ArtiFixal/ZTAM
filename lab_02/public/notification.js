const $ = (selector) => document.querySelector(selector);
const subscriptionField = $('#subscription');
const form = $('#notification-form');
let registration;
let busy = false;

function status(message, error = false) {
  $('#status').textContent = message;
  $('#status').dataset.error = String(error);
}

function updatePermissionInfo() {
  const supported = 'Notification' in window && window.isSecureContext;
  const permission = supported ? Notification.permission : 'brak obsługi';
  $('#permission').textContent = permission;
  $('#permission').dataset.state = permission;
  $('#enable').disabled = !supported || permission !== 'default';
  $('#permission-help').textContent = !supported
    ? 'Wymagane jest HTTPS (lub localhost) i przeglądarka obsługująca powiadomienia.'
    : permission === 'granted' ? 'Zgoda udzielona. Możesz wysyłać powiadomienia.'
    : permission === 'denied' ? 'Powiadomienia zablokowane. Zmień zgodę w ustawieniach tej witryny.'
    : 'O zgodę zapytamy dopiero po naciśnięciu przycisku.';
  $('#sw').disabled = !registration || busy;
  $('#subscribe').disabled = !supported || !registration || !('PushManager' in window) || busy || Boolean(subscriptionField.value);
  $('#unsubscribe').disabled = !registration || busy || !subscriptionField.value;
  $('#copy').disabled = !subscriptionField.value;
  $('#download').disabled = !subscriptionField.value;
}

function showSubscription(subscription) {
  subscriptionField.value = subscription ? JSON.stringify(subscription, null, 2) : '';
  $('#push-state').textContent = subscription ? 'aktywna' : 'nieaktywna';
  $('#push-state').dataset.state = subscription ? 'active' : 'inactive';
  updatePermissionInfo();
}

function requirePermission() {
  if (!('Notification' in window)) throw new Error('Ta przeglądarka nie obsługuje powiadomień.');
  if (Notification.permission !== 'granted') throw new Error('Najpierw włącz powiadomienia przyciskiem w sekcji Uprawnienia.');
}

async function run(action) {
  if (busy) return;
  busy = true;
  updatePermissionInfo();
  try { await action(); }
  catch (error) { status(error.message || String(error), true); }
  finally { busy = false; updatePermissionInfo(); }
}

$('#enable').addEventListener('click', () => run(async () => {
  // Jedyne miejsce, w którym prosimy o zgodę — bezpośrednio po kliknięciu.
  const permission = await Notification.requestPermission();
  status(permission === 'granted' ? 'Powiadomienia włączone.' : 'Nie udzielono zgody na powiadomienia.', permission !== 'granted');
}));

$('#title').addEventListener('input', () => $('#title').setCustomValidity(''));
$('#icon').addEventListener('change', () => { $('#icon-preview').src = $('#icon').value; });
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = $('#title').value.trim();
  $('#title').setCustomValidity(title ? '' : 'Wpisz tytuł powiadomienia.');
  if (!form.reportValidity()) return;
  run(async () => {
    requirePermission();
    if (!registration) throw new Error('Service worker nie jest jeszcze gotowy.');
    await registration.showNotification(title, {
      body: $('#body').value.trim(),
      icon: new URL($('#icon').value, document.baseURI).href,
      data: { url: registration.scope },
    });
    status('Powiadomienie wysłane do systemu. Kliknij je, aby wrócić do aplikacji.');
  });
});

$('#local').addEventListener('click', () => run(() => {
  requirePermission();
  try {
    const notification = new Notification($('#title').value.trim() || 'Powiadomienie ze strony', {
      body: $('#body').value.trim() || 'Test Notification API', icon: $('#icon').value,
    });
    notification.onclick = () => { window.focus(); notification.close(); };
    status('Powiadomienie ze strony wysłane do systemu.');
  } catch {
    throw new Error('Ta przeglądarka nie obsługuje new Notification() (np. Android). Użyj formularza powyżej — wysyła przez service workera.');
  }
}));

function urlBase64ToUint8Array(value) {
  const base64 = (value + '='.repeat((4 - value.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

$('#subscribe').addEventListener('click', () => run(async () => {
  requirePermission();
  if (!registration || !('PushManager' in window)) throw new Error('Brak obsługi Web Push. Na iPhonie otwórz PWA z ekranu początkowego.');
  if (!window.VAPID_PUBLIC_KEY) throw new Error('Brak klucza publicznego. Uruchom npm run keys i odśwież stronę.');
  const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
    userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(window.VAPID_PUBLIC_KEY),
  });
  showSubscription(subscription);
  status('Subskrypcja aktywna. Pobierz JSON i zapisz go w lab_02/subscription.json na komputerze.');
}));

$('#unsubscribe').addEventListener('click', () => run(async () => {
  const subscription = await registration.pushManager.getSubscription();
  if (subscription && !(await subscription.unsubscribe())) throw new Error('Nie udało się anulować subskrypcji. Spróbuj ponownie.');
  showSubscription(null);
  status('Subskrypcja anulowana. Usuń również stary plik subscription.json na komputerze.');
}));

$('#copy').addEventListener('click', () => run(async () => {
  try {
    await navigator.clipboard.writeText(subscriptionField.value);
    status('Skopiowano subskrypcję.');
  } catch {
    subscriptionField.focus();
    subscriptionField.select();
    status('Tekst zaznaczony. Skopiuj go ręcznie albo użyj Pobierz JSON.');
  }
}));

$('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([subscriptionField.value], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'subscription.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

async function initialize() {
  updatePermissionInfo();
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    $('#worker-status').textContent = 'niedostępny';
    status('Otwórz aplikację przez HTTPS lub localhost.', true);
    return;
  }
  try {
    await navigator.serviceWorker.register('./service-worker.js');
    const ready = navigator.serviceWorker.ready;
    let timeout;
    try {
      registration = await Promise.race([ready, new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Service worker nie uruchomił się. Odśwież stronę.')), 15000);
      })]);
    } finally { clearTimeout(timeout); }
    $('#worker-status').textContent = 'aktywny';
    if ('PushManager' in window) showSubscription(await registration.pushManager.getSubscription());
    else status('Web Push niedostępny. Na iPhonie uruchom aplikację z ekranu początkowego.', true);
    if ('Notification' in window && Notification.permission === 'granted' && 'PushManager' in window) {
      status('Gotowe. Wyślij powiadomienie lub włącz subskrypcję push.');
    }
  } catch (error) {
    $('#worker-status').textContent = 'błąd';
    status(error.message, true);
  }
  updatePermissionInfo();
}

window.addEventListener('focus', updatePermissionInfo);
navigator.permissions?.query({ name: 'notifications' }).then((permission) => {
  permission.addEventListener('change', updatePermissionInfo);
}).catch(() => {});
initialize();
