import { mkdir, readFile, copyFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
// Oryginalna grafika z laboratorium jest źródłem ikon; nie nadpisujemy jej.
const android = await readFile(resolve(root, 'public/android.png'));
const background = '#f6f8f2';
await mkdir(resolve(root, 'public/icons'), { recursive: true });
await mkdir(resolve(root, 'public/vendor/workbox'), { recursive: true });
for (const [file, size] of [
  ['icon-192.png', 192], ['icon-512.png', 512],
  ['maskable-192.png', 192], ['maskable-512.png', 512],
  ['apple-touch-icon.png', 180], ['favicon-32.png', 32],
]) {
  // Kwadrat o boku 56% mieści się w bezpiecznym kole maskable (średnica 80%).
  const contentSize = Math.floor(size * (file.startsWith('maskable-') ? 0.56 : 0.88));
  const paddingBefore = Math.floor((size - contentSize) / 2);
  const paddingAfter = size - contentSize - paddingBefore;
  await sharp(android)
    .resize(contentSize, contentSize, { fit: 'contain', background })
    .flatten({ background })
    .extend({ top: paddingBefore, bottom: paddingAfter, left: paddingBefore, right: paddingAfter, background })
    .png()
    .toFile(resolve(root, 'public/icons', file));
}
const packages = ['workbox-sw', 'workbox-core', 'workbox-precaching', 'workbox-routing', 'workbox-strategies'];
for (const name of packages) {
  const directory = resolve(root, 'node_modules', name);
  const metadata = JSON.parse(await readFile(resolve(directory, 'package.json')));
  if (metadata.version !== '7.4.1') throw new Error(`Nieoczekiwana wersja ${name}: ${metadata.version}`);
  for (const file of await readdir(resolve(directory, 'build'))) {
    if (file.endsWith('.js') || file.endsWith('.map')) {
      await copyFile(resolve(directory, 'build', file), resolve(root, 'public/vendor/workbox', file));
    }
  }
  await copyFile(resolve(directory, 'LICENSE'), resolve(root, 'public/vendor/workbox', `${name}.LICENSE`));
}
await writeFile(resolve(root, 'public/vendor/workbox/README.txt'),
  'Workbox 7.4.1, Google LLC, licencja MIT. Lokalne pliki z oficjalnych pakietów npm.\nhttps://github.com/GoogleChrome/workbox\nOdtworzenie: npm ci && npm run prepare:public\n');
console.log('Wygenerowano grafiki, ikony i lokalne moduły Workbox 7.4.1.');
