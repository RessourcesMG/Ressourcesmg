/**
 * Enregistrement des événements analytics côté client.
 * Les données sont envoyées à l'API et stockées dans Supabase.
 */

export async function trackResourceClick(params: {
  resourceId: string;
  resourceName: string;
  categoryId: string;
}): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'resource_click',
        ...params,
      }),
    });
  } catch {
    // Silently ignore analytics failures
  }
}

export async function trackSearch(params: {
  query: string;
  resultCount: number;
}): Promise<void> {
  if (!params.query.trim()) return;
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'search',
        ...params,
      }),
    });
  } catch {
    // Silently ignore analytics failures
  }
}
