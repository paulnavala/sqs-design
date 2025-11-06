#!/usr/bin/env node
/**
 * Simple Dev Server with Live Reload (SSE)
 *
 * - Serves the repository as static files on http://localhost:8080
 * - Exposes /__livereload Server-Sent Events endpoint for live reload
 * - Watches for file changes and triggers full page reloads
 * - Auto-builds portfolio data when data/portfolio-projects.json changes
 *
 * Usage:
 *   node scripts/dev-server.js [--open]
 *
 * Then open: http://localhost:8080/test/live.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = Number(process.env.PORT || 8080);
const ROOT = path.resolve(__dirname, '..');

/** Track connected SSE clients */
const sseClients = new Set();

/** Debounce timer for change events */
let pendingReloadTimer = null;

/** Basic content-type mapping */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json'
};

function sendReload() {
  const payload = `data: reload\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {}
  }
}

function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('\n');
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

function forbidden(res) {
  res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Forbidden');
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/test/live.html';

  const requestedPath = path.normalize(path.join(ROOT, pathname));
  if (!requestedPath.startsWith(ROOT)) return forbidden(res);

  fs.stat(requestedPath, (err, stat) => {
    if (err) return notFound(res);
    if (stat.isDirectory()) {
      const indexPath = path.join(requestedPath, 'index.html');
      fs.stat(indexPath, (e2) => {
        if (e2) return forbidden(res);
        serveFile(indexPath, res);
      });
    } else {
      serveFile(requestedPath, res);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/__livereload')) return handleSSE(req, res);
  serveStatic(req, res);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/test/live.html`;
  console.log(`\nDev server running at ${url}`);
  if (process.argv.includes('--open')) {
    const cmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;
    exec(cmd);
  }
});

/** Determine if a path should be ignored by watcher */
function isIgnored(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return (
    rel.startsWith('node_modules/') ||
    rel.startsWith('.git/') ||
    rel.includes('/.vite/') ||
    rel.endsWith('.tmp') ||
    rel.endsWith('~')
  );
}

/** Build portfolio data if JSON changes */
let buildInProgress = false;
function maybeBuildOnDataChange(changedPath) {
  const norm = changedPath.replace(/\\/g, '/');
  if (!norm.endsWith('data/portfolio-projects.json')) return Promise.resolve();
  if (buildInProgress) return Promise.resolve();
  buildInProgress = true;
  console.log('Rebuilding portfolio data...');
  return new Promise((resolve) => {
    exec('node scripts/build-portfolio-data.js', { cwd: ROOT }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) console.warn('Build error (continuing):', err.message);
      buildInProgress = false;
      resolve();
    });
  });
}

/** Watch file changes and trigger reload */
try {
  fs.watch(ROOT, { recursive: true }, async (_event, file) => {
    if (!file) return;
    const abs = path.join(ROOT, file);
    if (isIgnored(abs)) return;

    // Debounce and optionally build
    if (pendingReloadTimer) clearTimeout(pendingReloadTimer);
    await maybeBuildOnDataChange(abs);
    pendingReloadTimer = setTimeout(() => {
      pendingReloadTimer = null;
      console.log('Reloading due to change:', file);
      sendReload();
    }, 120);
  });
} catch (e) {
  console.warn('Watcher failed to initialize:', e.message);
}

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  try { server.close(); } catch {}
  sseClients.forEach((res) => { try { res.end(); } catch {} });
  process.exit(0);
});


