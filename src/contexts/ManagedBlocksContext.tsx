import { createContext, useContext, type ReactNode } from 'react';
import { useManagedBlocks } from '@/hooks/useManagedBlocks';

export type ManagedBlocksValue = ReturnType<typeof useManagedBlocks>;

const ManagedBlocksContext = createContext<ManagedBlocksValue | null>(null);

export function ManagedBlocksProvider({ children }: { children: ReactNode }) {
  const value = useManagedBlocks();
  return (
    <ManagedBlocksContext.Provider value={value}>
      {children}
    </ManagedBlocksContext.Provider>
  );
}

export function useManagedBlocksContext(): ManagedBlocksValue {
  const ctx = useContext(ManagedBlocksContext);
  if (!ctx) {
    throw new Error('useManagedBlocksContext doit être utilisé dans un ManagedBlocksProvider');
  }
  return ctx;
}
