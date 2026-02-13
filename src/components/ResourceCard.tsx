import { useState } from 'react';
import { ExternalLink, Lock, Info, Globe } from 'lucide-react';
import type { Resource } from '@/types/resources';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompactMode } from '@/contexts/CompactModeContext';

interface ResourceCardProps {
  resource: Resource;
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

export function ResourceCard({ resource }: ResourceCardProps) {
  const { isCompact } = useCompactMode();
  const sources = getFaviconSources(resource.url);
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

  return (
    <Card className={`group h-full transition-all duration-300 border border-slate-200 bg-white ${isCompact ? 'hover:shadow-md hover:-translate-y-0.5' : 'hover:shadow-lg hover:-translate-y-1'}`}>
      <CardHeader className={isCompact ? 'pb-1.5 px-3 pt-3' : 'pb-3'}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`shrink-0 flex items-center justify-center rounded bg-slate-100 border border-slate-200/60 overflow-hidden ${isCompact ? 'w-6 h-6' : 'w-8 h-8'}`}>
              {showFallbackIcon ? (
                <Globe className={isCompact ? 'w-4 h-4 text-slate-400' : 'w-5 h-5 text-slate-400'} />
              ) : (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-full h-full object-contain"
                  width={isCompact ? 24 : 32}
                  height={isCompact ? 24 : 32}
                  loading="lazy"
                  onError={handleFaviconError}
                />
              )}
            </div>
            <h3 className={`font-semibold text-slate-900 leading-tight group-hover:text-teal-600 transition-colors ${isCompact ? 'text-sm' : 'text-base'}`}>
              {resource.name}
            </h3>
          </div>
          <div className="flex gap-1 shrink-0">
            {resource.requiresAuth && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Connexion
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-0 px-3 pb-3' : 'pt-0'}>
        <p className={`text-slate-600 leading-relaxed ${isCompact ? 'text-xs mb-1.5 line-clamp-2' : 'text-sm mb-3'}`}>
          {resource.description}
        </p>
        {resource.note && (
          <div className={`flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 rounded ${isCompact ? 'mb-1.5 p-1.5' : 'mb-3 p-2'}`}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span className={isCompact ? 'line-clamp-2' : ''}>{resource.note}</span>
          </div>
        )}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 font-medium text-teal-600 hover:text-teal-700 transition-colors ${isCompact ? 'text-xs' : 'text-sm'}`}
        >
          Accéder au site
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
