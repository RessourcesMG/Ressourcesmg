import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ressourcesmg_ai_search_enabled';
const CUSTOM_EVENT = 'ressourcesmg_ai_search_change';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function subscribe(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  const onLocal = () => callback();
  window.addEventListener('storage', onStorage);
  window.addEventListener(CUSTOM_EVENT, onLocal);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CUSTOM_EVENT, onLocal);
  };
}

type AiSearchContextValue = {
  aiSearchEnabled: boolean;
  setAiSearchEnabled: (enabled: boolean) => void;
};

const AiSearchContext = createContext<AiSearchContextValue | null>(null);

export function AiSearchProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setAiSearchEnabled = useCallback((value: boolean) => {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, 'true');
      else localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(CUSTOM_EVENT));
    } catch {
      // ignore
    }
  }, []);

  const value: AiSearchContextValue = { aiSearchEnabled: enabled, setAiSearchEnabled };
  return <AiSearchContext.Provider value={value}>{children}</AiSearchContext.Provider>;
}

export function useAiSearch() {
  const ctx = useContext(AiSearchContext);
  if (!ctx) {
    return {
      aiSearchEnabled: false,
      setAiSearchEnabled: () => {},
    };
  }
  return ctx;
}
