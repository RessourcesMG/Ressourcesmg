export const SORT_AZ_STORAGE_KEY = 'ressourcesmg-sort-az';

export function getSortAlphabetically(categoryId: string): boolean {
  try {
    const raw = localStorage.getItem(SORT_AZ_STORAGE_KEY);
    if (!raw) return true;
    const prefs = JSON.parse(raw) as Record<string, boolean>;
    return prefs[categoryId] !== false;
  } catch {
    return true;
  }
}

export function setSortAlphabetically(categoryId: string, value: boolean): void {
  try {
    const raw = localStorage.getItem(SORT_AZ_STORAGE_KEY);
    const prefs = (raw ? JSON.parse(raw) : {}) as Record<string, boolean>;
    prefs[categoryId] = value;
    localStorage.setItem(SORT_AZ_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
