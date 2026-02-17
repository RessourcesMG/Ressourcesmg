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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!supabase) return res.status(503).json({ error: 'Base de données non configurée' });

  if (req.method === 'GET') {
    const isWebmaster = verifyToken(getToken(req));
    const { data: cats } = await supabase
      .from('managed_categories')
      .select('*')
      .order('is_specialty', { ascending: true })
      .order('sort_order', { ascending: true });
    
    // Récupérer toutes les ressources
    const { data: allRess, error: ressError } = await supabase
      .from('managed_resources')
      .select('*')
      .order('sort_order', { ascending: true });
    
    // Si erreur, logger mais continuer avec un tableau vide
    if (ressError) {
      console.warn('Erreur lors de la récupération des ressources:', ressError.message);
    }
    
    // Filtrer les ressources masquées côté serveur
    // Si is_hidden est undefined/null/false, la ressource est visible (non masquée)
    // Seulement filtrer si on n'est pas webmaster ET qu'on a des ressources
    let ress = allRess || [];
    if (!isWebmaster && ress.length > 0) {
      ress = ress.filter((r) => {
        // Si is_hidden n'existe pas dans l'objet (undefined), considérer comme visible
        // Si is_hidden est null ou false, considérer comme visible
        // Seulement masquer si is_hidden est explicitement true
        return r.is_hidden !== true;
      });
    }

    // Si pas de catégories ET pas de ressources, retourner fromDb: false
    // Mais si on a des catégories (même sans ressources), c'est qu'on vient de la DB
    if (!cats?.length && !ress?.length) {
      return res.status(200).json({ categories: [], fromDb: false });
    }
    
    // Si on a des catégories mais pas de ressources, c'est normal (toutes masquées ou pas encore de ressources)
    // On retourne quand même fromDb: true pour utiliser les catégories de la DB

    const categories = (cats || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      isSpecialty: c.is_specialty ?? false,
      resources: ress
        .filter((r) => r.category_id === c.id)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? '',
          url: r.url,
          requiresAuth: r.requires_auth ?? false,
          note: r.note ?? undefined,
          isHidden: r.is_hidden ?? false,
        })),
    }));
    return res.status(200).json({ categories, fromDb: true });
  }

  if (req.method === 'POST') {
    if (!verifyToken(getToken(req))) return res.status(401).json({ error: 'Non autorisé' });
    const body = req.body as {
      action?: string;
      categories?: Array<{ id: string; name: string; icon: string; isSpecialty?: boolean; resources: Array<{ id: string; name: string; description?: string; url: string; requiresAuth?: boolean; note?: string; isHidden?: boolean }> }>;
      categoryId?: string;
      name?: string;
      description?: string;
      url?: string;
      requiresAuth?: boolean;
      note?: string;
      icon?: string;
      id?: string;
      isHidden?: boolean;
    };
    if (body?.action === 'addResource') {
      const { categoryId, name, url } = body;
      if (!categoryId || !name?.trim() || !url?.trim()) {
        return res.status(400).json({ error: 'categoryId, name et url requis' });
      }
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const { data, error } = await supabase
        .from('managed_resources')
        .insert({
          id,
          category_id: categoryId,
          name: name.trim(),
          description: body.description ?? '',
          url: url.trim(),
          requires_auth: body.requiresAuth ?? false,
          note: body.note ?? null,
          sort_order: 9999,
          is_hidden: false,
        })
        .select('id')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ success: true, id: data.id });
    }
    if (body?.action === 'addCategory') {
      const { name, icon, isSpecialty } = body as { name?: string; icon?: string; isSpecialty?: boolean };
      if (!name?.trim()) return res.status(400).json({ error: 'name requis' });
      const id = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `cat-${Date.now()}`;
      const isSpec = isSpecialty ?? true;
      const { data: lastInSection } = await supabase
        .from('managed_categories')
        .select('sort_order')
        .eq('is_specialty', isSpec)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      const sortOrder = lastInSection != null ? lastInSection.sort_order + 1 : 0;
      const { error: err } = await supabase.from('managed_categories').insert({
        id,
        name: name.trim(),
        icon: icon || 'Circle',
        sort_order: sortOrder,
        is_specialty: isSpec,
      });
      if (err) return res.status(500).json({ error: err.message });
      return res.status(201).json({ success: true, id });
    }
    if (body?.action === 'deleteResource') {
      const { id } = body as { id?: string };
      if (!id) return res.status(400).json({ error: 'id requis' });
      const { error } = await supabase.from('managed_resources').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }
    if (body?.action === 'deleteCategory') {
      const { id } = body as { id?: string };
      if (!id) return res.status(400).json({ error: 'id requis' });
      await supabase.from('managed_resources').delete().eq('category_id', id);
      const { error } = await supabase.from('managed_categories').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }
    if (body?.action === 'reorderCategories') {
      const { generalOrder, specialtyOrder } = body as { generalOrder?: string[]; specialtyOrder?: string[] };
      if (!Array.isArray(generalOrder) && !Array.isArray(specialtyOrder)) {
        return res.status(400).json({ error: 'generalOrder ou specialtyOrder requis' });
      }
      for (let i = 0; i < (generalOrder?.length ?? 0); i++) {
        const id = generalOrder[i];
        if (!id) continue;
        const { error } = await supabase.from('managed_categories').update({ sort_order: i }).eq('id', id).eq('is_specialty', false);
        if (error) return res.status(500).json({ error: error.message });
      }
      for (let i = 0; i < (specialtyOrder?.length ?? 0); i++) {
        const id = specialtyOrder[i];
        if (!id) continue;
        const { error } = await supabase.from('managed_categories').update({ sort_order: i }).eq('id', id).eq('is_specialty', true);
        if (error) return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true });
    }
    if (body?.action === 'reorderResources') {
      const { categoryId, resourceIds } = body as { categoryId?: string; resourceIds?: string[] };
      if (!categoryId || !Array.isArray(resourceIds) || resourceIds.length === 0) {
        return res.status(400).json({ error: 'categoryId et resourceIds (tableau) requis' });
      }
      for (let i = 0; i < resourceIds.length; i++) {
        const id = resourceIds[i];
        if (!id) continue;
        const { error } = await supabase
          .from('managed_resources')
          .update({ sort_order: i })
          .eq('id', id)
          .eq('category_id', categoryId);
        if (error) return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true });
    }
    if (body?.action !== 'seed' || !Array.isArray(body.categories)) {
      return res.status(400).json({ error: 'Action seed ou addResource et champs requis' });
    }
    const { count } = await supabase.from('managed_categories').select('id', { count: 'exact', head: true });
    if ((count ?? 0) > 0) {
      return res.status(400).json({ error: 'Données déjà initialisées' });
    }
    const catsToInsert = body.categories.map((cat, i) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      sort_order: i,
      is_specialty: cat.isSpecialty ?? false,
    }));
    const ressToInsert: Array<{ id: string; category_id: string; name: string; description: string; url: string; requires_auth: boolean; note: string | null; sort_order: number }> = [];
    body.categories.forEach((cat, catIdx) => {
      (cat.resources || []).forEach((res, resIdx) => {
        ressToInsert.push({
          id: res.id,
          category_id: cat.id,
          name: res.name,
          description: res.description ?? '',
          url: res.url,
          requires_auth: res.requiresAuth ?? false,
          note: res.note ?? null,
          sort_order: resIdx,
          is_hidden: res.isHidden ?? false,
        });
      });
    });
    const { error: errCat } = await supabase.from('managed_categories').insert(catsToInsert);
    if (errCat) return res.status(500).json({ error: errCat.message });
    if (ressToInsert.length > 0) {
      const { error: errRes } = await supabase.from('managed_resources').insert(ressToInsert);
      if (errRes) return res.status(500).json({ error: errRes.message });
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PATCH') {
    if (!verifyToken(getToken(req))) return res.status(401).json({ error: 'Non autorisé' });
    const body = req.body as { type?: string; id?: string; name?: string; description?: string; url?: string; requiresAuth?: boolean; note?: string; icon?: string; categoryId?: string; isHidden?: boolean };
    const { type, id } = body;
    if (!type || !id) return res.status(400).json({ error: 'type et id requis' });
    if (type === 'resource') {
      const up: Record<string, unknown> = {};
      if (body.name !== undefined) up.name = body.name;
      if (body.description !== undefined) up.description = body.description;
      if (body.url !== undefined) up.url = body.url;
      if (body.requiresAuth !== undefined) up.requires_auth = body.requiresAuth;
      if (body.note !== undefined) up.note = body.note;
      if (body.isHidden !== undefined) up.is_hidden = body.isHidden;
      if (body.categoryId !== undefined) {
        up.category_id = body.categoryId;
        const { data: maxOrder } = await supabase
          .from('managed_resources')
          .select('sort_order')
          .eq('category_id', body.categoryId)
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        up.sort_order = maxOrder != null ? maxOrder.sort_order + 1 : 0;
      }
      if (Object.keys(up).length === 0) return res.status(400).json({ error: 'Aucun champ à modifier' });
      const { error } = await supabase.from('managed_resources').update(up).eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      // Réordonner par ordre alphabétique si la catégorie a changé
      if (body.categoryId !== undefined) {
        const { data: resources } = await supabase
          .from('managed_resources')
          .select('id, name')
          .eq('category_id', body.categoryId)
          .order('sort_order', { ascending: true });
        if (resources && resources.length > 0) {
          const sorted = [...resources].sort((a, b) =>
            (a.name || '').localeCompare(b.name || '', 'fr')
          );
          for (let i = 0; i < sorted.length; i++) {
            const { error: err } = await supabase
              .from('managed_resources')
              .update({ sort_order: i })
              .eq('id', sorted[i].id)
              .eq('category_id', body.categoryId);
            if (err) return res.status(500).json({ error: err.message });
          }
        }
      }
      return res.status(200).json({ success: true });
    }
    if (type === 'category') {
      const up: Record<string, unknown> = {};
      if (body.name !== undefined) up.name = body.name;
      if (body.icon !== undefined) up.icon = body.icon;
      if (Object.keys(up).length === 0) return res.status(400).json({ error: 'Aucun champ à modifier' });
      const { error } = await supabase.from('managed_categories').update(up).eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'type invalide' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
