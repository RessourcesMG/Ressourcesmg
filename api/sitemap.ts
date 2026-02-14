import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://ressourcesmg.vercel.app';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');

  const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }> = [
    { loc: `${BASE_URL}/`, lastmod: new Date().toISOString().slice(0, 10), changefreq: 'weekly', priority: 1.0 },
    { loc: `${BASE_URL}/webmaster`, lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: 0.3 },
  ];

  const supabase = getSupabase();
  if (supabase) {
    const { data: cats } = await supabase
      .from('managed_categories')
      .select('id, name')
      .order('is_specialty', { ascending: true })
      .order('sort_order', { ascending: true });
    for (const cat of cats || []) {
      urls.push({
        loc: `${BASE_URL}/#${cat.id}`,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority !== undefined ? `\n    <priority>${u.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return res.status(200).send(xml);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
