import { useState } from 'react';
import { ExternalLink, Lock, Info, Globe } from 'lucide-react';
import type { Resource } from '@/types/resources';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [faviconError, setFaviconError] = useState(false);
  const faviconUrl = getFaviconUrl(resource.url);

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
              {faviconUrl && !faviconError ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-5 h-5 object-contain"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Globe className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-teal-600 transition-colors pt-0.5">
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
        >
          Accéder au site
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
