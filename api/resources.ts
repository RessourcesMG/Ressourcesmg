import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../api-utils/supabase';
import { verifyToken } from '../api-utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur inattendue';
    return res.status(500).json({ error: msg });
  }
}

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    if (!supabase) return res.status(200).json([]);
    try {
      const { data, error } = await supabase
        .from('custom_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const resources = (data || []).map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        name: r.name,
        description: r.description,
        url: r.url,
        requiresAuth: r.requires_auth,
        note: r.note,
      }));
      return res.status(200).json(resources);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'POST') {
    if (!supabase) return res.status(503).json({ error: 'Base de données non configurée' });
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const body = req.body as { categoryId?: string; name?: string; description?: string; url?: string; requiresAuth?: boolean; note?: string };
    if (!body?.categoryId || !body?.name || !body?.url) {
      return res.status(400).json({ error: 'categoryId, name et url requis' });
    }

    try {
      const { data, error } = await supabase
        .from('custom_resources')
        .insert({
          category_id: body.categoryId,
          name: body.name,
          description: body.description || '',
          url: body.url,
          requires_auth: body.requiresAuth ?? false,
          note: body.note || null,
        })
        .select('id')
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json({
        id: data.id,
        categoryId: body.categoryId,
        name: body.name,
        description: body.description || '',
        url: body.url,
        requiresAuth: body.requiresAuth ?? false,
        note: body.note || null,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method === 'DELETE') {
    if (!supabase) return res.status(503).json({ error: 'Base de données non configurée' });
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: 'id requis' });
    }

    try {
      const { error } = await supabase.from('custom_resources').delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
