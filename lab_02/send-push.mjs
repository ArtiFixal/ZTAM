import { readFileSync } from 'node:fs';
import webpush from 'web-push';

const readJson = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
try {
  const keys = readJson('./vapid-keys.json');
  const subscription = readJson('./subscription.json');
  // Można ustawić własny kontakt: VAPID_SUBJECT=mailto:adres@domena.pl npm run push -- ...
  const subject = process.env.VAPID_SUBJECT || 'https://ztam-lab02.web.app/';
  webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
  const [title = 'Web Push', body = 'Wiadomość wysłana z serwera'] = process.argv.slice(2);
  if (!title.trim()) throw new Error('Tytuł powiadomienia nie może być pusty.');
  const result = await webpush.sendNotification(subscription, JSON.stringify({ title: title.trim(), body }), { TTL: 3600, timeout: 15000 });
  console.log('Wysłano, status:', result.statusCode);
} catch (error) {
  console.error('Błąd wysyłania:', error.statusCode || '', error.body || error.message);
  if (error.code === 'ENOENT') console.error('Uruchom npm run keys, a następnie zapisz subskrypcję z przeglądarki jako lab_02/subscription.json.');
  if ([404, 410].includes(error.statusCode)) console.error('Subskrypcja wygasła. Utwórz i zapisz nową subskrypcję.');
  if (error.statusCode === 403) console.error('Sprawdź zgodność klucza publicznego z vapid-keys.json i ponów subskrypcję.');
  process.exitCode = 1;
}
