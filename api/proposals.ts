import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    _supabase = createClient(url, key, { auth: { persistSession: false } });
    return _supabase;
  } catch {
    return null;
  }
}

const SECRET = process.env.WEBMASTER_SECRET || 'ressourcesmg-default-secret-change-me';
const TOKEN_MS = 8 * 60 * 60 * 1000;
function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig !== expected) return false;
    const data = JSON.parse(payload);
    return Date.now() - data.t < TOKEN_MS;
  } catch {
    return false;
  }
}

function getToken(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!supabase) return res.status(503).json({ error: 'Base de données non configurée' });

  // POST : soumission publique (sans auth)
  if (req.method === 'POST') {
    const body = req.body as { name?: string; url?: string; description?: string };
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (!name || !url) {
      return res.status(400).json({ error: 'Nom et lien du site requis' });
    }

    const { error } = await supabase.from('resource_proposals').insert({
      name,
      url,
      description: description || '',
      status: 'pending',
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, message: 'Proposition envoyée. Merci !' });
  }

  // GET : liste des propositions (webmaster uniquement)
  if (req.method === 'GET') {
    if (!verifyToken(getToken(req))) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { data, error } = await supabase
      .from('resource_proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({
      proposals: (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        description: p.description ?? '',
        status: p.status,
        categoryId: p.category_id ?? undefined,
        createdAt: p.created_at,
      })),
    });
  }

  // PATCH : accepter, refuser ou éditer (webmaster uniquement)
  if (req.method === 'PATCH') {
    if (!verifyToken(getToken(req))) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const body = req.body as {
      id?: string;
      action?: 'accept' | 'reject' | 'edit';
      categoryId?: string;
      name?: string;
      url?: string;
      description?: string;
    };

    const { id, action } = body;
    if (!id || !action) {
      return res.status(400).json({ error: 'id et action requis' });
    }

    if (action === 'accept') {
      const { data: prop } = await supabase
        .from('resource_proposals')
        .select('name, url, description')
        .eq('id', id)
        .single();

      if (!prop) return res.status(404).json({ error: 'Proposition introuvable' });

      const categoryId = body.categoryId?.trim();
      if (!categoryId) {
        return res.status(400).json({ error: 'Choisissez une catégorie pour accepter' });
      }

      const resourceId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const { error: insertErr } = await supabase.from('managed_resources').insert({
        id: resourceId,
        category_id: categoryId,
        name: prop.name,
        description: prop.description ?? '',
        url: prop.url,
        requires_auth: false,
        note: null,
        sort_order: 9999,
      });

      if (insertErr) return res.status(500).json({ error: insertErr.message });

      const { error: updateErr } = await supabase
        .from('resource_proposals')
        .update({ status: 'accepted', category_id: categoryId })
        .eq('id', id);

      if (updateErr) return res.status(500).json({ error: updateErr.message });
      return res.status(200).json({ success: true, resourceId });
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('resource_proposals')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    if (action === 'edit') {
      const up: Record<string, unknown> = {};
      if (body.name !== undefined) up.name = body.name.trim();
      if (body.url !== undefined) up.url = body.url.trim();
      if (body.description !== undefined) up.description = body.description;

      if (Object.keys(up).length === 0) {
        return res.status(400).json({ error: 'Aucun champ à modifier' });
      }

      const { error } = await supabase
        .from('resource_proposals')
        .update(up)
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'action invalide' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
