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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // GET : récupérer les annonces actives (public) ou toutes (webmaster)
  if (req.method === 'GET') {
    if (!supabase) return res.status(200).json({ announcements: [] });

    const isWebmaster = verifyToken(getToken(req));
    
    try {
      let query = supabase.from('announcements').select('*');
      
      if (isWebmaster) {
        // Webmaster : toutes les annonces, triées par date de création (plus récentes en premier)
        query = query.order('created_at', { ascending: false });
      } else {
        // Public : uniquement les annonces actives
        query = query.eq('is_active', true).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const announcements = (data || []).map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        type: a.type,
        isActive: a.is_active,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

      return res.status(200).json({ announcements });
    } catch {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // POST, PATCH, DELETE : uniquement pour les webmasters
  if (!verifyToken(getToken(req))) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  if (!supabase) return res.status(503).json({ error: 'Base de données non configurée' });

  // POST : créer une nouvelle annonce
  if (req.method === 'POST') {
    const body = req.body as {
      title?: string;
      message?: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      isActive?: boolean;
    };

    if (!body?.title || !body?.message) {
      return res.status(400).json({ error: 'title et message requis' });
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: body.title.trim(),
          message: body.message.trim(),
          type: body.type || 'info',
          is_active: body.isActive ?? true,
        })
        .select('id')
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({
        id: data.id,
        title: body.title.trim(),
        message: body.message.trim(),
        type: body.type || 'info',
        isActive: body.isActive ?? true,
      });
    } catch {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PATCH : modifier une annonce
  if (req.method === 'PATCH') {
    const body = req.body as {
      id?: string;
      title?: string;
      message?: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      isActive?: boolean;
    };

    if (!body?.id) {
      return res.status(400).json({ error: 'id requis' });
    }

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.message !== undefined) updates.message = body.message.trim();
    if (body.type !== undefined) updates.type = body.type;
    if (body.isActive !== undefined) updates.is_active = body.isActive;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucun champ à modifier' });
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', body.id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE : supprimer une annonce
  if (req.method === 'DELETE') {
    const id = req.query.id as string;

    if (!id) {
      return res.status(400).json({ error: 'id requis' });
    }

    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(204).end();
    } catch {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
