import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const directory = fileURLToPath(new URL('../public/', import.meta.url));
const files = ['index.html', 'index.js', 'styles.css', 'manifest.json', 'offline.html', 'android.png'];
for (const name of await readdir(resolve(directory, 'icons'))) files.push(`icons/${name}`);
const entries = [];
for (const name of files.sort()) {
  const revision = createHash('sha256').update(await readFile(resolve(directory, name))).digest('hex').slice(0, 20);
  entries.push({ url: name, revision });
  if (name === 'index.html') entries.push({ url: './', revision });
}
const text = `// Plik wygenerowany: npm run precache. Revision = hash zawartości pliku.\nself.__PRECACHE_MANIFEST = ${JSON.stringify(entries, null, 2)};\n`;
await writeFile(resolve(directory, 'precache-manifest.js'), text);
// Zmiana importowanego manifestu jest również wykrywana w cyklu aktualizacji SW.
console.log(`Zapisano ${entries.length} zasobów precache z automatycznymi revision.`);
