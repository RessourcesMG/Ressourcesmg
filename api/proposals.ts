import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from './lib/supabase';
import { getToken, verifyToken } from './lib/auth';

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
    const body = req.body as {
      name?: string;
      url?: string;
      description?: string;
      categoryId?: string;
      website?: string; // Honeypot : si rempli = spam
    };
    // Honeypot : rejeter silencieusement si le champ "website" est rempli
    const honeypot = typeof body?.website === 'string' ? body.website.trim() : '';
    if (honeypot) {
      return res.status(200).json({ success: true, message: 'Proposition envoyée. Merci !' });
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const categoryId = typeof body?.categoryId === 'string' ? body.categoryId.trim() || null : null;

    if (!name || !url) {
      return res.status(400).json({ error: 'Nom et lien du site requis' });
    }

    // Validation de l'URL : vérifier qu'elle est accessible
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: 'L\'URL doit commencer par http:// ou https://' });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      let urlOk = false;
      try {
        const headRes = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'RessourcesMG/1.0 (proposal-validation)' },
          redirect: 'follow',
        });
        urlOk = headRes.ok || [405, 403, 404].includes(headRes.status);
        if (!urlOk) {
          const getRes = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'RessourcesMG/1.0 (proposal-validation)' },
            redirect: 'follow',
          });
          urlOk = getRes.ok;
        }
      } catch {
        // Fallback : certains serveurs refusent HEAD ou timeout
        try {
          const getController = new AbortController();
          const getTimeout = setTimeout(() => getController.abort(), 6000);
          const getRes = await fetch(url, {
            method: 'GET',
            signal: getController.signal,
            headers: { 'User-Agent': 'RessourcesMG/1.0 (proposal-validation)' },
            redirect: 'follow',
          });
          urlOk = getRes.ok;
          clearTimeout(getTimeout);
        } catch {
          urlOk = false;
        }
      }
      clearTimeout(timeout);
      if (!urlOk) {
        return res.status(400).json({
          error: 'Impossible d\'accéder à ce lien. Vérifiez que l\'URL est correcte et accessible.',
        });
      }
    } catch {
      return res.status(400).json({
        error: 'Impossible de vérifier ce lien. Assurez-vous que l\'URL est valide et accessible.',
      });
    }

    const { error } = await supabase.from('resource_proposals').insert({
      name,
      url,
      description: description || '',
      status: 'pending',
      category_id: categoryId,
    });

    if (error) return res.status(500).json({ error: error.message });

    // L'envoi d'email se fait maintenant côté client (voir Footer.tsx)
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
        note: p.note ?? undefined,
        requiresAuth: p.requires_auth ?? false,
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
      action?: 'accept' | 'reject' | 'edit' | 'delete';
      categoryId?: string;
      name?: string;
      url?: string;
      description?: string;
      note?: string;
      requiresAuth?: boolean;
    };

    const { id, action } = body;
    if (!id || !action) {
      return res.status(400).json({ error: 'id et action requis' });
    }

    if (action === 'accept') {
      const { data: prop } = await supabase
        .from('resource_proposals')
        .select('name, url, description, note, requires_auth')
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
        requires_auth: prop.requires_auth ?? false,
        note: prop.note ?? null,
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
      if (body.categoryId !== undefined) up.category_id = body.categoryId.trim();
      if (body.note !== undefined) up.note = body.note.trim() || null;
      if (body.requiresAuth !== undefined) up.requires_auth = body.requiresAuth;

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

    if (action === 'delete') {
      const { error } = await supabase
        .from('resource_proposals')
        .delete()
        .eq('id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'action invalide' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
