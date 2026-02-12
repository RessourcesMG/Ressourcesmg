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

  const addResource = useCallback(
    async (input: CustomResourceInput, token: string): Promise<CustomResource | null> => {
      try {
        const res = await fetch('/api/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (res.ok && data.id) {
          const newResource: CustomResource = {
            id: data.id,
            ...input,
          };
          setResources((prev) => [newResource, ...prev]);
          return newResource;
        }
        return null;
      } catch {
        return null;
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
