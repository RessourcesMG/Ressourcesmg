import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ressources-mg-favorites';

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (resourceId: string) => boolean;
  toggleFavorite: (resourceId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites);

  const isFavorite = useCallback((resourceId: string) => favoriteIds.includes(resourceId), [favoriteIds]);

  const toggleFavorite = useCallback((resourceId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId];
      saveFavorites(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
