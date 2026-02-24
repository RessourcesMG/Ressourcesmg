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
// Analytics en mémoire pour dev
const devAnalyticsClicks = [];
const devAnalyticsSearches = [];

async function findFavicon(pageUrlStr) {
  try {
    const pageUrl = new URL(pageUrlStr);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(pageUrl.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RessourcesMG/1.0)' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    const html = await response.text();
    const finalUrl = new URL(response.url);

    const linkRegex = /<link\s[^>]*>/gi;
    const candidates = [];
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      const tag = m[0];
      const relMatch = tag.match(/rel\s*=\s*["']([^"']*)["']/i);
      const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!relMatch || !hrefMatch) continue;
      const rel = relMatch[1].toLowerCase();
      const href = hrefMatch[1];
      let priority = 0;
      if (rel.includes('apple-touch-icon')) priority = 3;
      else if ((rel.includes('icon') || rel.includes('shortcut')) && /32|64|128|192|512/.test(rel)) priority = 2;
      else if (rel.includes('icon') || rel.includes('shortcut')) priority = 1;
      if (priority > 0) candidates.push({ href, priority });
    }
    candidates.sort((a, b) => b.priority - a.priority);

    for (const { href } of candidates) {
      try {
        const absolute = new URL(href.trim(), finalUrl.origin + finalUrl.pathname);
        return absolute.toString();
      } catch {
        continue;
      }
    }

    const fallback = `${finalUrl.origin}/favicon.ico`;
    const check = await fetch(fallback, { method: 'HEAD' });
    if (check.ok) return fallback;
    return null;
  } catch {
    return null;
  }
}

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

  // POST /api/analytics (en dev : stockage en mémoire)
  if (url.pathname === '/api/analytics') {
    if (req.method === 'POST') {
      let body;
      try {
        body = await parseBody(req);
      } catch {
        body = {};
      }
      if (body.type === 'resource_click') {
        devAnalyticsClicks.push({
          resource_id: body.resourceId,
          resource_name: body.resourceName,
          category_id: body.categoryId,
        });
      } else if (body.type === 'search') {
        devAnalyticsSearches.push({ query: body.query, result_count: body.resultCount || 0 });
      }
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === 'GET') {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token || !verifyToken(token)) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Non autorisé' }));
        return;
      }
      const clickCounts = new Map();
      for (const c of devAnalyticsClicks) {
        const k = c.resource_id;
        const cur = clickCounts.get(k) || { name: c.resource_name, categoryId: c.category_id, count: 0 };
        cur.count++;
        clickCounts.set(k, cur);
      }
      const topResources = [...clickCounts.entries()].map(([id, d]) => ({ id, ...d })).sort((a, b) => b.count - a.count).slice(0, 20);
      const searchCounts = new Map();
      for (const s of devAnalyticsSearches) {
        const q = (s.query || '').toLowerCase();
        if (q) searchCounts.set(q, (searchCounts.get(q) || 0) + 1);
      }
      const topSearches = [...searchCounts.entries()].map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, 20);
      res.writeHead(200);
      res.end(JSON.stringify({
        topResources,
        topSearches,
        totalClicks: devAnalyticsClicks.length,
        totalSearches: devAnalyticsSearches.length,
        periodDays: 30,
      }));
      return;
    }
  }

  // GET /api/sitemap (en dev : sitemap minimal)
  if (url.pathname === '/api/sitemap' && req.method === 'GET') {
    const base = 'http://localhost:5173';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/webmaster</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.writeHead(200);
    res.end(xml);
    return;
  }

  // POST /api/proposals (mock en dev sans Supabase : honeypot + validation URL basique)
  if (url.pathname === '/api/proposals' && req.method === 'POST') {
    const body = await parseBody(req);
    if (body.website && body.website.trim()) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: 'Proposition envoyée. Merci !' }));
      return;
    }
    const name = (body.name || '').trim();
    const urlStr = (body.url || '').trim();
    if (!name || !urlStr) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Nom et lien du site requis' }));
      return;
    }
    try {
      new URL(urlStr);
    } catch {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'URL invalide' }));
      return;
    }
    res.writeHead(201);
    res.end(JSON.stringify({ success: true, message: 'Proposition envoyée. Merci !' }));
    return;
  }

  // POST /api/ai-suggest (recherche par IA : appelle OpenAI si OPENAI_API_KEY est défini)
  if (url.pathname === '/api/ai-suggest' && req.method === 'POST') {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const body = await parseBody(req);
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const catalog = Array.isArray(body.catalog) ? body.catalog : [];
    if (!OPENAI_API_KEY) {
      res.writeHead(503);
      res.end(JSON.stringify({ suggestions: [], error: 'Recherche par IA non disponible (OPENAI_API_KEY manquante).' }));
      return;
    }
    if (!question || question.length < 5) {
      res.writeHead(400);
      res.end(JSON.stringify({ suggestions: [], error: 'Veuillez poser une question plus précise (au moins quelques mots).' }));
      return;
    }
    if (catalog.length === 0) {
      res.writeHead(400);
      res.end(JSON.stringify({ suggestions: [], error: 'Catalogue des ressources indisponible.' }));
      return;
    }
    const catalogText = catalog
      .map((cat) => {
        const resources = (cat.resources || [])
          .map((r) => `- ${r.name}: ${r.description || '(sans description)'} (${r.url})`)
          .join('\n');
        return `[${cat.categoryName}]\n${resources}`;
      })
      .join('\n\n');
    const systemPrompt = `Tu es un assistant pour des médecins généralistes. On te donne un catalogue de sites web médicaux (nom, courte description, URL) organisés par catégorie. Ta tâche : pour une question clinique posée par l'utilisateur, recommander les sites du catalogue qui peuvent y répondre.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, de la forme :
{"suggestions":[{"resourceName":"Nom du site","resourceUrl":"https://...","categoryName":"Nom de la catégorie","reason":"Une phrase courte expliquant pourquoi ce site est pertinent"}]}

Règles :
- Ne recommande que des sites qui sont dans le catalogue fourni. Utilise exactement le nom et l'URL du catalogue.
- Maximum 5 suggestions, par ordre de pertinence.
- reason doit être en français, une phrase courte.
- Si aucun site ne correspond vraiment, retourne {"suggestions":[]}.`;
    const userMessage = `Catalogue des ressources disponibles :\n\n${catalogText}\n\n---\nQuestion clinique de l'utilisateur :\n${question}`;
    try {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 800,
        }),
      });
      if (!openaiRes.ok) {
        const err = await openaiRes.text();
        res.writeHead(500);
        res.end(JSON.stringify({ suggestions: [], error: `OpenAI: ${openaiRes.status} ${err}` }));
        return;
      }
      const data = await openaiRes.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        res.writeHead(500);
        res.end(JSON.stringify({ suggestions: [], error: 'Réponse OpenAI vide' }));
        return;
      }
      const parsed = JSON.parse(content);
      const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ suggestions }));
    } catch (e) {
      const message = e?.message || 'Erreur lors de la suggestion';
      res.writeHead(500);
      res.end(JSON.stringify({ suggestions: [], error: message }));
    }
    return;
  }

  // GET /api/favicon?url=...
  if (url.pathname === '/api/favicon' && req.method === 'GET') {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Paramètre url requis' }));
      return;
    }
    try {
      const favicon = await findFavicon(targetUrl);
      if (favicon) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.writeHead(302, { Location: favicon });
        res.end();
      } else {
        res.writeHead(404);
        res.end();
      }
    } catch {
      res.writeHead(404);
      res.end();
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`API locale: http://localhost:${PORT}`);
  console.log('Lancez "npm run dev" dans un autre terminal.');
});
