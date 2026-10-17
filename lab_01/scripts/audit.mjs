import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createServer } from './server.mjs';

const reports = fileURLToPath(new URL('../reports/', import.meta.url));
await mkdir(reports, { recursive: true });
const server = createServer();
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const url = process.env.AUDIT_URL || `http://localhost:${server.address().port}/`;
const results = [];
let failed = false;
try {
  for (const mode of ['mobile', 'desktop']) {
    const chrome = await launch({ chromePath: chromium.executablePath(),
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] });
    try {
      const result = await lighthouse(url, {
        port: chrome.port, output: ['html', 'json'], logLevel: 'error',
        onlyCategories: ['accessibility', 'best-practices'],
      }, mode === 'desktop' ? { extends: 'lighthouse:default', settings: {
        formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      } } : undefined);
      if (result.lhr.runtimeError) throw new Error(result.lhr.runtimeError.message);
      await writeFile(resolve(reports, `lighthouse-${mode}.html`), result.report[0]);
      await writeFile(resolve(reports, `lighthouse-${mode}.json`), result.report[1]);
      const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([name, value]) => [name, Math.round(value.score * 100)]));
      results.push({ mode, scores, lighthouseVersion: result.lhr.lighthouseVersion, url: result.lhr.finalDisplayedUrl });
      console.log(`${mode}: ${JSON.stringify(scores)}`);
      if (scores.accessibility !== 100 || scores['best-practices'] !== 100) {
        failed = true;
        for (const audit of Object.values(result.lhr.audits)) {
          if (audit.score !== null && audit.score < 1) console.log(`  ${audit.id}: ${audit.title}`);
        }
      }
    } finally { await chrome.kill(); }
  }
  await writeFile(resolve(reports, 'lighthouse-wyniki.json'), JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2) + '\n');
} finally {
  server.closeAllConnections();
  await new Promise((done) => server.close(done));
}
if (failed) process.exitCode = 1;
