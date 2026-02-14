import { useState } from 'react';
import { ExternalLink, Lock, Info, Globe, Star } from 'lucide-react';
import type { Resource } from '@/types/resources';
import { trackResourceClick } from '@/lib/analytics';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompactMode } from '@/contexts/CompactModeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface ResourceCardProps {
  resource: Resource;
  categoryId?: string;
}

function getFaviconSources(url: string): string[] {
  try {
    const { origin } = new URL(url);
    const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
    return [
      // 1. API qui parse le HTML du site pour trouver le favicon réel
      `${apiBase}/api/favicon?url=${encodeURIComponent(url)}`,
      // 2. Chemins directs (vraies 404 si absent)
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/favicon-32x32.png`,
      `${origin}/favicon-16x16.png`,
    ];
  } catch {
    return [];
  }
}

export function ResourceCard({ resource, categoryId = '' }: ResourceCardProps) {
  const { isCompact } = useCompactMode();
  const { isFavorite, toggleFavorite } = useFavorites();
  const sources = getFaviconSources(resource.url);
  const fav = isFavorite(resource.id);
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(resource.id);
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const faviconUrl = sources[currentIndex] ?? '';
  const showFallbackIcon = !faviconUrl || currentIndex >= sources.length;

  const handleFaviconError = () => {
    if (currentIndex < sources.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(sources.length);
    }
  };

  // Mode compact : une ligne par ressource, avec petit favicon, format liste
  if (isCompact) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 hover:bg-slate-50 transition-colors min-h-[44px]">
        <div className="w-5 h-5 shrink-0 flex items-center justify-center rounded bg-slate-100 border border-slate-200/60 overflow-hidden">
          {showFallbackIcon ? (
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <img
              src={faviconUrl}
              alt=""
              className="w-full h-full object-contain"
              width={20}
              height={20}
              loading="lazy"
              onError={handleFaviconError}
            />
          )}
        </div>
        <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
          <span className="font-semibold text-slate-900 text-sm truncate flex-shrink-0 max-w-[40%] sm:max-w-none">{resource.name}</span>
          {resource.requiresAuth && (
            <span title="Connexion requise"><Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden /></span>
          )}
          <span className="text-slate-500 text-xs truncate min-w-0">— {resource.description}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`shrink-0 p-1.5 rounded-full transition-colors ${
                  fav ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-amber-500'
                }`}
                aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">{fav ? 'Retirer des favoris' : 'Mettre en favori'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium text-xs py-1 px-2 rounded hover:bg-teal-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            trackResourceClick({ resourceId: resource.id, resourceName: resource.name, categoryId });
          }}
        >
          Ouvrir
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-slate-100 border border-slate-200/60 overflow-hidden">
              {showFallbackIcon ? (
                <Globe className="w-5 h-5 text-slate-400" />
              ) : (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-full h-full object-contain"
                  width={32}
                  height={32}
                  loading="lazy"
                  onError={handleFaviconError}
                />
              )}
            </div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-teal-600 transition-colors">
              {resource.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`p-1.5 rounded-full transition-colors ${
                      fav ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-amber-500'
                    }`}
                    aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">{fav ? 'Retirer des favoris' : 'Mettre en favori'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {resource.requiresAuth && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Connexion
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          {resource.description}
        </p>
        {resource.note && (
          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span>{resource.note}</span>
          </div>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          onClick={() => trackResourceClick({ resourceId: resource.id, resourceName: resource.name, categoryId })}
        >
          Accéder au site
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
