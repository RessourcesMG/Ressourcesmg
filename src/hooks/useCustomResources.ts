import { useState, useEffect, useCallback } from 'react';
import type { Resource } from '@/types/resources';

export interface CustomResource extends Resource {
  categoryId: string;
}

export interface CustomResourceInput {
  categoryId: string;
  name: string;
  description: string;
  url: string;
  requiresAuth?: boolean;
  note?: string;
}

export function useCustomResources() {
  const [resources, setResources] = useState<CustomResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/resources`;
    }
    return '/api/resources';
  };

  const addResource = useCallback(
    async (input: CustomResourceInput, token: string): Promise<{ success: true; resource: CustomResource } | { success: false; error: string }> => {
      try {
        const url = getApiUrl();
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
        });
        const text = await res.text();
        const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
        if (res.ok && data.id) {
          const newResource: CustomResource = {
            id: data.id,
            ...input,
          };
          setResources((prev) => [newResource, ...prev]);
          return { success: true, resource: newResource };
        }
        const msg = data?.error || (res.status === 404 ? 'API non trouvée (404). Vérifiez le déploiement Vercel.' : `Erreur ${res.status}: ${text.slice(0, 100)}`);
        return { success: false, error: msg };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erreur réseau' };
      }
    },
    []
  );

  const removeResource = useCallback(
    async (id: string, token: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/resources?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setResources((prev) => prev.filter((r) => r.id !== id));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  return { resources, loading, refresh: fetchResources, addResource, removeResource };
}
