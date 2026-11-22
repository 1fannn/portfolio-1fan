import http from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8788);
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.GUESTBOOK_DB || path.join(ROOT, '.data', 'guestbook.sqlite');
await mkdir(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`);
const insert = db.prepare('INSERT INTO comments (name, message, created_at) VALUES (?, ?, ?)');
const latest = db.prepare('SELECT id, name, message, created_at AS createdAt FROM comments WHERE id < ? ORDER BY id DESC LIMIT ?');
const total = db.prepare('SELECT COUNT(*) AS count FROM comments');
const MAX_POSTS = Number(process.env.GUESTBOOK_RATE_LIMIT || 3);
const WINDOW_MS = 5 * 60 * 1000;
const attempts = new Map();
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.wav': 'audio/wav' };

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8192) {
      const error = new Error('Your message is too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const error = new Error('Please send a valid message.'); error.status = 400; throw error; }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/comments') {
      if (req.method === 'GET') {
        const limit = Math.min(30, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '12', 10) || 12));
        const before = Number(url.searchParams.get('before') || Number.MAX_SAFE_INTEGER);
        if (!Number.isSafeInteger(before) || before < 1) return json(res, 400, { error: 'Invalid page.' });
        const rows = latest.all(before, limit + 1);
        const hasMore = rows.length > limit;
        const comments = rows.slice(0, limit);
        return json(res, 200, { comments, total: total.get().count, nextBefore: hasMore ? comments.at(-1).id : null });
      }
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        return json(res, 405, { error: 'Method not allowed.' });
      }
      const origin = req.headers.origin;
      const expected = process.env.PUBLIC_ORIGIN;
      if (origin) {
        let originHost;
        try { originHost = new URL(origin).host; } catch {}
        if (origin !== expected && originHost !== req.headers.host) return json(res, 403, { error: 'Open the form on this website to leave a note.' });
      }
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Please submit the note through the form.' });
      const body = await readJson(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { error: 'Invalid message.' });
      if (typeof body.message !== 'string' || typeof (body.name ?? '') !== 'string') return json(res, 400, { error: 'Invalid message.' });
      const message = body.message.trim();
      const name = (body.name || '').trim() || 'Anonymous';
      if (!message || message.length > 1200) return json(res, 400, { error: 'Please write a note between 1 and 1,200 characters.' });
      if (name.length > 50) return json(res, 400, { error: 'Please keep your name under 50 characters.' });
      const ip = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const recent = (attempts.get(ip) || []).filter(time => now - time < WINDOW_MS);
      if (recent.length >= MAX_POSTS) {
        const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000));
        res.setHeader('Retry-After', String(retryAfter));
        return json(res, 429, { error: 'A few notes are plenty for now. Please try again in a few minutes.' });
      }
      const createdAt = new Date().toISOString();
      const result = insert.run(name, message, createdAt);
      recent.push(now); attempts.set(ip, recent);
      return json(res, 201, { comment: { id: Number(result.lastInsertRowid), name, message, createdAt }, total: total.get().count });
    }

    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Method not allowed.' });
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return json(res, 400, { error: 'Invalid path.' }); }
    const segments = pathname.split('/');
    const blocked = segments.some(segment => segment.startsWith('.') || ['server', 'backups', 'verification', 'node_modules'].includes(segment));
    if (blocked || pathname.includes('\\')) return json(res, 404, { error: 'Not found.' });
    const filename = pathname === '/' ? '/index.html' : pathname;
    const file = path.resolve(ROOT, '.' + filename);
    if (!file.startsWith(ROOT + path.sep)) return json(res, 404, { error: 'Not found.' });
    const ext = path.extname(file).toLowerCase();
    if (!MIME[ext]) return json(res, 404, { error: 'Not found.' });
    let info;
    try { info = await stat(file); } catch { return json(res, 404, { error: 'Not found.' }); }
    if (!info.isFile()) return json(res, 404, { error: 'Not found.' });
    res.writeHead(200, { 'Content-Type': MIME[ext], 'Content-Length': info.size, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': ['.html', '.js', '.css'].includes(ext) ? 'no-cache' : 'public, max-age=3600' });
    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch (error) {
    if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : 'The note could not be saved. Please try again.' });
    else res.destroy();
  }
});

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of attempts) {
    const recent = times.filter(time => now - time < WINDOW_MS);
    if (recent.length) attempts.set(ip, recent); else attempts.delete(ip);
  }
}, WINDOW_MS);
cleanup.unref();
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(PORT, HOST, () => console.log(`Portfolio and guestbook: http://${HOST}:${PORT}/pages/about.html`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  clearInterval(cleanup);
  server.close(() => { db.close(); process.exit(0); });
});

