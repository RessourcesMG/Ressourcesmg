import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/types/resources';
import { categories as staticCategories, medicalSpecialties as staticSpecialties } from '@/types/resources';
import { getToken } from '@/lib/webmasterAuth';

const API_URL = typeof window !== 'undefined' ? `${window.location.origin}/api/blocks` : '/api/blocks';

export function useManagedBlocks() {
  const [generalCategories, setGeneralCategories] = useState<Category[]>(() =>
    staticCategories.slice(0, 3)
  );
  const [medicalSpecialties, setMedicalSpecialties] = useState<Category[]>(() => staticSpecialties);
  const [fromDb, setFromDb] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json().catch(() => ({}));
      if (data?.fromDb && Array.isArray(data.categories) && data.categories.length > 0) {
        const gen = data.categories.filter((c: Category) => !c.isSpecialty);
        const spec = data.categories.filter((c: Category) => c.isSpecialty);
        setGeneralCategories(gen.length > 0 ? gen : staticCategories.slice(0, 3));
        setMedicalSpecialties(spec.length > 0 ? spec : staticSpecialties);
        setFromDb(true);
      } else {
        setGeneralCategories(staticCategories.slice(0, 3));
        setMedicalSpecialties(staticSpecialties);
        setFromDb(false);
      }
    } catch {
      setError('Impossible de charger les ressources.');
      setGeneralCategories(staticCategories.slice(0, 3));
      setMedicalSpecialties(staticSpecialties);
      setFromDb(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const seedBlocks = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const token = getToken();
    if (!token) return { success: false, error: 'Session expirée' };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'seed',
          categories: staticCategories.map((c) => ({
            ...c,
            isSpecialty: c.isSpecialty ?? false,
            resources: c.resources.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description ?? '',
              url: r.url,
              requiresAuth: r.requiresAuth ?? false,
              note: r.note ?? undefined,
            })),
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchBlocks();
        return { success: true };
      }
      return { success: false, error: data?.error || `Erreur ${res.status}` };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
    }
  }, [fetchBlocks]);

  const updateResource = useCallback(
    async (
      id: string,
      data: { name?: string; description?: string; url?: string; requiresAuth?: boolean; note?: string }
    ): Promise<{ success: boolean; error?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      try {
        const res = await fetch(API_URL, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'resource', id, ...data }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  const addResource = useCallback(
    async (input: { categoryId: string; name: string; description?: string; url: string; requiresAuth?: boolean; note?: string }): Promise<{ success: boolean; error?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'addResource',
            categoryId: input.categoryId,
            name: input.name,
            description: input.description ?? '',
            url: input.url,
            requiresAuth: input.requiresAuth ?? false,
            note: input.note ?? undefined,
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  const addCategory = useCallback(
    async (name: string, icon?: string, isSpecialty?: boolean): Promise<{ success: boolean; error?: string; id?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'addCategory',
            name: name.trim(),
            icon: icon || 'Circle',
            isSpecialty: isSpecialty ?? true,
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true, id: out.id };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  const reorderCategories = useCallback(
    async (generalOrder?: string[], specialtyOrder?: string[]): Promise<{ success: boolean; error?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      if (!Array.isArray(generalOrder) && !Array.isArray(specialtyOrder)) {
        return { success: false, error: 'generalOrder ou specialtyOrder requis' };
      }
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'reorderCategories',
            generalOrder: generalOrder ?? [],
            specialtyOrder: specialtyOrder ?? [],
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  const deleteResource = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'deleteResource', id }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'deleteCategory', id }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  const updateCategory = useCallback(
    async (id: string, data: { name?: string; icon?: string }): Promise<{ success: boolean; error?: string }> => {
      const token = getToken();
      if (!token) return { success: false, error: 'Session expirée' };
      try {
        const res = await fetch(API_URL, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'category', id, ...data }),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          await fetchBlocks();
          return { success: true };
        }
        return { success: false, error: out?.error || `Erreur ${res.status}` };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
      }
    },
    [fetchBlocks]
  );

  return {
    generalCategories,
    medicalSpecialties,
    fromDb,
    loading,
    error,
    retry: fetchBlocks,
    refresh: fetchBlocks,
    seedBlocks,
    addResource,
    addCategory,
    reorderCategories,
    updateResource,
    updateCategory,
    deleteResource,
    deleteCategory,
    staticCategories,
  };
}
