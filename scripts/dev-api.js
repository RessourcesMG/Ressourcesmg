/**
 * Serveur API local pour le développement (simule les routes Vercel).
 * Lance avec: node scripts/dev-api.js
 * Puis dans un autre terminal: npm run dev
 */
import 'dotenv/config';
import { createServer } from 'http';
import crypto from 'crypto';

const PORT = 3001;
const PASSWORD = process.env.WEBMASTER_PASSWORD;
const SECRET = process.env.WEBMASTER_SECRET || 'ressourcesmg-default-secret-change-me';
const TOKEN_DURATION_MS = 8 * 60 * 60 * 1000;

function createToken() {
  const payload = JSON.stringify({ t: Date.now(), r: crypto.randomBytes(16).toString('hex') });
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + signature;
}

function verifyToken(token) {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (signature !== expected) return false;
    const data = JSON.parse(payload);
    return Date.now() - data.t < TOKEN_DURATION_MS;
  } catch {
    return false;
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

// Stockage en mémoire pour /api/resources en dev local (sans Supabase)
const devResources = new Map();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/resources
  if (url.pathname === '/api/resources' && req.method === 'GET') {
    const list = Array.from(devResources.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.writeHead(200);
    res.end(JSON.stringify(list.map(r => ({
      id: r.id,
      categoryId: r.category_id,
      name: r.name,
      description: r.description,
      url: r.url,
      requiresAuth: r.requires_auth,
      note: r.note,
    }))));
    return;
  }

  // POST /api/resources (avec token)
  if (url.pathname === '/api/resources' && req.method === 'POST') {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !verifyToken(token)) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Non autorisé' }));
      return;
    }
    const body = await parseBody(req);
    if (!body.categoryId || !body.name || !body.url) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'categoryId, name et url requis' }));
      return;
    }
    const id = crypto.randomUUID();
    const r = {
      id,
      category_id: body.categoryId,
      name: body.name,
      description: body.description || '',
      url: body.url,
      requires_auth: body.requiresAuth ?? false,
      note: body.note || null,
      created_at: new Date().toISOString(),
    };
    devResources.set(id, r);
    res.writeHead(201);
    res.end(JSON.stringify({
      id: r.id,
      categoryId: r.category_id,
      name: r.name,
      description: r.description,
      url: r.url,
      requiresAuth: r.requires_auth,
      note: r.note,
    }));
    return;
  }

  // DELETE /api/resources?id=xxx
  if (url.pathname === '/api/resources' && req.method === 'DELETE') {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !verifyToken(token)) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Non autorisé' }));
      return;
    }
    const id = url.searchParams.get('id');
    if (id) devResources.delete(id);
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === '/api/login' && req.method === 'POST') {
    if (!PASSWORD) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'WEBMASTER_PASSWORD non configuré (.env)' }));
      return;
    }
    const body = await parseBody(req);
    if (body.password === PASSWORD) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, token: createToken() }));
    } else {
      res.writeHead(401);
      res.end(JSON.stringify({ success: false, error: 'Mot de passe incorrect' }));
    }
    return;
  }

  if (url.pathname === '/api/verify' && req.method === 'GET') {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    res.writeHead(200);
    res.end(JSON.stringify({ valid: token ? verifyToken(token) : false }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`API locale: http://localhost:${PORT}`);
  console.log('Lancez "npm run dev" dans un autre terminal.');
});
