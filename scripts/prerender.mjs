import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

const ROUTES = [
  '/',
  '/kereses',
  '/termekek',
  '/akciok',
  '/kuponok',
  '/aruhazak',
  '/kedvencek',
  '/blog',
  '/gyik',
  '/adatvedelem',
  '/suti-szabalyzat',
  '/felhasznalasi-feltetelek',
  '/partneri-tajekoztato',
];

// Simple static file server for dist/
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  const server = createServer((req, res) => {
    let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);

    // SPA fallback: if file doesn't exist, serve index.html
    if (!existsSync(filePath)) {
      filePath = join(DIST, 'index.html');
    }

    try {
      const content = readFileSync(filePath);
      const ext = '.' + filePath.split('.').pop();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function prerender() {
  console.log('Pre-rendering pages...');

  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let rendered = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();

    // Block external requests (fonts, analytics, etc.)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith(baseUrl) || url.startsWith('data:')) {
        req.continue();
      } else {
        req.abort();
      }
    });

    try {
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });

      // Wait a bit for React to finish rendering
      await page.waitForFunction(() => {
        return document.getElementById('root')?.children.length > 0;
      }, { timeout: 10000 });

      // Get the full rendered HTML
      const html = await page.content();

      // Write to appropriate file
      const dir = route === '/' ? DIST : join(DIST, route);
      const file = route === '/' ? join(DIST, 'index.html') : join(dir, 'index.html');

      if (route !== '/') {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(file, html);
      rendered++;
      console.log(`  ✅ ${route}`);
    } catch (err) {
      console.log(`  ❌ ${route}: ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
  server.close();

  console.log(`\nPre-rendered ${rendered}/${ROUTES.length} pages.`);
}

prerender().catch(console.error);
