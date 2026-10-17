import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';

const root = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json' };

export function createServer(mountPath = '/') {
  return createHttpServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    try {
      const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!path.startsWith(mountPath)) { response.writeHead(404); response.end(); return; }
      const relative = path.slice(mountPath.length) || 'index.html';
      const file = resolve(root, relative);
      if (!file.startsWith(root + sep) && file !== resolve(root, 'index.html')) {
        response.writeHead(403); response.end(); return;
      }
      let content;
      let status = 200;
      let type = types[extname(file)] || 'application/octet-stream';
      try { content = await readFile(file); }
      catch { content = await readFile(resolve(root, '404.html')); status = 404; type = types['.html']; }
      response.writeHead(status, { 'Content-Type': type, 'Content-Length': content.length,
        'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(400); response.end(); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  server.listen(port, '0.0.0.0', () => console.log(`Local: http://localhost:${port}`));
}
