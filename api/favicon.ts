import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API qui parse le HTML d'un site pour extraire l'URL du favicon.
 * Retourne une redirection 302 vers le favicon, ou 404 si introuvable.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = typeof req.query.url === 'string' ? req.query.url : null;
  if (!url) {
    return res.status(400).json({ error: 'Paramètre url requis' });
  }

  let pageUrl: URL;
  try {
    pageUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL invalide' });
  }

  const faviconUrl = await findFavicon(pageUrl);
  if (faviconUrl) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h
    return res.redirect(302, faviconUrl);
  }
  return res.status(404).end();
}

async function findFavicon(pageUrl: URL): Promise<string | null> {
  try {
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

    // Chercher les balises <link> avec rel icon
    const linkRegex = /<link\s[^>]*>/gi;
    const candidates: { href: string; priority: number }[] = [];
    let m: RegExpExecArray | null;

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

    // Trier par priorité (le plus haut en premier)
    candidates.sort((a, b) => b.priority - a.priority);

    for (const { href } of candidates) {
      try {
        const absolute = new URL(href.trim(), finalUrl.origin + finalUrl.pathname);
        return absolute.toString();
      } catch {
        continue;
      }
    }

    // Fallback : /favicon.ico à la racine
    const fallback = `${finalUrl.origin}/favicon.ico`;
    const check = await fetch(fallback, { method: 'HEAD' });
    if (check.ok) return fallback;

    return null;
  } catch {
    return null;
  }
}
