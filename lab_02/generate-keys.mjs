import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import webpush from 'web-push';

const keysFile = new URL('./vapid-keys.json', import.meta.url);
if (!existsSync(keysFile)) {
  writeFileSync(keysFile, JSON.stringify(webpush.generateVAPIDKeys(), null, 2) + '\n', { mode: 0o600, flag: 'wx' });
}
const keys = JSON.parse(readFileSync(keysFile, 'utf8').replace(/^\uFEFF/, ''));
// Do plików publikowanych trafia wyłącznie klucz publiczny.
writeFileSync(new URL('./public/vapid-public-key.js', import.meta.url),
  `// Generowane przez npm run keys. Klucz publiczny nie jest tajny.\nwindow.VAPID_PUBLIC_KEY = ${JSON.stringify(keys.publicKey)};\n`);
console.log('Klucz publiczny VAPID:', keys.publicKey);
console.log('Zapisano public/vapid-public-key.js. Istniejące klucze prywatne pozostają bez zmian.');
