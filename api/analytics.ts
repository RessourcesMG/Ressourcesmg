import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../api-utils/supabase';
import { getToken, verifyToken } from '../api-utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    return res.status(500).json({ error: msg });
  }
}

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // POST : enregistrer un événement (public, rate-limited implicitement par le client)
  if (req.method === 'POST') {
    if (!supabase) return res.status(503).json({ error: 'Analytics non disponibles' });

    const body = req.body as {
      type?: string;
      resourceId?: string;
      resourceName?: string;
      categoryId?: string;
      query?: string;
      resultCount?: number;
    };

    if (body.type === 'resource_click') {
      const resourceId = typeof body.resourceId === 'string' ? body.resourceId.trim() : '';
      const resourceName = typeof body.resourceName === 'string' ? body.resourceName.trim() : '';
      const categoryId = typeof body.categoryId === 'string' ? body.categoryId.trim() : '';
      if (!resourceId || !resourceName || !categoryId) {
        return res.status(400).json({ error: 'Champs manquants' });
      }
      const { error } = await supabase.from('analytics_resource_clicks').insert({
        resource_id: resourceId,
        resource_name: resourceName,
        category_id: categoryId,
      });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }

    if (body.type === 'search') {
      const query = typeof body.query === 'string' ? body.query.trim().slice(0, 200) : '';
      const resultCount = typeof body.resultCount === 'number' ? Math.max(0, body.resultCount) : 0;
      if (!query) return res.status(400).json({ error: 'Query manquante' });
      const { error } = await supabase.from('analytics_search_queries').insert({
        query,
        result_count: resultCount,
      });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }

    return res.status(400).json({ error: 'Type d\'événement invalide' });
  }

  // GET : dashboard (webmaster uniquement)
  if (req.method === 'GET') {
    if (!verifyToken(getToken(req))) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    if (!supabase) return res.status(503).json({ error: 'Analytics non disponibles' });

    const periodDays = 30; // Derniers 30 jours
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    // Top 10 ressources les plus cliquées
    const { data: clicks } = await supabase
      .from('analytics_resource_clicks')
      .select('resource_id, resource_name, category_id')
      .gte('clicked_at', since.toISOString());

    const clickCounts = new Map<string, { name: string; categoryId: string; count: number }>();
    for (const c of clicks || []) {
      const key = c.resource_id;
      const cur = clickCounts.get(key);
      if (cur) cur.count++;
      else clickCounts.set(key, { name: c.resource_name, categoryId: c.category_id ?? '', count: 1 });
    }
    const topResources = [...clickCounts.entries()]
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top 10 recherches populaires
    const { data: searches } = await supabase
      .from('analytics_search_queries')
      .select('query')
      .gte('searched_at', since.toISOString());

    const searchCounts = new Map<string, number>();
    for (const s of searches || []) {
      const q = (s.query || '').trim().toLowerCase();
      if (q) searchCounts.set(q, (searchCounts.get(q) || 0) + 1);
    }
    const topSearches = [...searchCounts.entries()]
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.status(200).json({
      topResources,
      topSearches,
      totalClicks: clicks?.length ?? 0,
      totalSearches: searches?.length ?? 0,
      periodDays,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
