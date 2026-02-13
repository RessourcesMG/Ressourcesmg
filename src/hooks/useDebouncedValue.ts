import { useState, useEffect } from 'react';

/**
 * Retourne une valeur décalée dans le temps (debounce).
 * Utile pour la recherche : l'UI reste réactive pendant la saisie, le filtrage se fait après une pause.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
