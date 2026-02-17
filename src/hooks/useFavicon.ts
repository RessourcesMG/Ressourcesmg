import { useState, useEffect, useMemo } from 'react';

const FAVICON_CACHE_KEY = 'favicon_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface FaviconCache {
  [url: string]: {
    faviconUrl: string;
    timestamp: number;
  };
}

function getCachedFavicon(url: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(FAVICON_CACHE_KEY);
    if (!cached) return null;
    
    const cache: FaviconCache = JSON.parse(cached);
    const entry = cache[url];
    
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.faviconUrl;
    }
    
    // Nettoyer les entrées expirées
    const cleaned: FaviconCache = {};
    for (const [key, value] of Object.entries(cache)) {
      if (Date.now() - value.timestamp < CACHE_DURATION) {
        cleaned[key] = value;
      }
    }
    localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(cleaned));
    
    return null;
  } catch {
    return null;
  }
}

function setCachedFavicon(url: string, faviconUrl: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached = localStorage.getItem(FAVICON_CACHE_KEY);
    const cache: FaviconCache = cached ? JSON.parse(cached) : {};
    cache[url] = { faviconUrl, timestamp: Date.now() };
    localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignorer les erreurs de localStorage
  }
}

function getFaviconSources(url: string): string[] {
  try {
    const { origin, hostname } = new URL(url);
    const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
    
    return [
      // 1. Service Google (très rapide, bon taux de réussite)
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      // 2. Chemins directs (rapides, testés en parallèle)
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/favicon-32x32.png`,
      `${origin}/favicon-16x16.png`,
      // 3. API qui parse le HTML (plus lent mais plus précis, en dernier)
      `${apiBase}/api/favicon?url=${encodeURIComponent(url)}`,
    ];
  } catch {
    return [];
  }
}

/**
 * Teste si une URL d'image est valide
 */
async function testImageUrl(url: string, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(false);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Trouve le premier favicon valide parmi plusieurs sources en parallèle
 */
async function findFirstValidFavicon(sources: string[]): Promise<string | null> {
  // Essayer d'abord les sources rapides en parallèle (Google + chemins directs)
  const fastSources = sources.slice(0, -1); // Tout sauf l'API
  const apiSource = sources[sources.length - 1]; // L'API en dernier
  
  // Tester les sources rapides en parallèle avec un timeout court
  const fastPromises = fastSources.map(url => 
    testImageUrl(url, 1500).then(valid => valid ? url : null)
  );
  
  const fastResults = await Promise.all(fastPromises);
  const firstValid = fastResults.find(url => url !== null);
  
  if (firstValid) {
    return firstValid;
  }
  
  // Si aucune source rapide n'a fonctionné, essayer l'API (avec timeout plus long)
  if (apiSource) {
    const apiValid = await testImageUrl(apiSource, 3000);
    if (apiValid) {
      return apiSource;
    }
  }
  
  return null;
}

export function useFavicon(url: string): string | null {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  
  const sources = useMemo(() => getFaviconSources(url), [url]);
  
  useEffect(() => {
    // Vérifier le cache d'abord
    const cached = getCachedFavicon(url);
    if (cached) {
      setFaviconUrl(cached);
      return;
    }
    
    // Si pas de cache, chercher le favicon
    let cancelled = false;
    
    findFirstValidFavicon(sources).then((found) => {
      if (cancelled) return;
      
      if (found) {
        setFaviconUrl(found);
        setCachedFavicon(url, found);
      } else {
        setFaviconUrl(null);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [url, sources]);
  
  return faviconUrl;
}
