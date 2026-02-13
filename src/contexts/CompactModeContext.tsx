import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ressourcesmg-compact-view';

type CompactModeContextValue = {
  isCompact: boolean;
  setCompact: (value: boolean) => void;
  toggleCompact: () => void;
};

const CompactModeContext = createContext<CompactModeContextValue | null>(null);

function readStored(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

function writeStored(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function CompactModeProvider({ children }: { children: React.ReactNode }) {
  const [isCompact, setCompactState] = useState(false);

  useEffect(() => {
    setCompactState(readStored());
  }, []);

  const setCompact = useCallback((value: boolean) => {
    setCompactState(value);
    writeStored(value);
  }, []);

  const toggleCompact = useCallback(() => {
    setCompactState((prev) => {
      const next = !prev;
      writeStored(next);
      return next;
    });
  }, []);

  return (
    <CompactModeContext.Provider value={{ isCompact, setCompact, toggleCompact }}>
      {children}
    </CompactModeContext.Provider>
  );
}

export function useCompactMode(): CompactModeContextValue {
  const ctx = useContext(CompactModeContext);
  if (!ctx) {
    throw new Error('useCompactMode must be used within CompactModeProvider');
  }
  return ctx;
}
