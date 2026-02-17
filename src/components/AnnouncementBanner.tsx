import { useState, useEffect, useRef } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Announcement = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const ANNOUNCEMENTS_API = typeof window !== 'undefined' ? `${window.location.origin}/api/announcements` : '/api/announcements';

const STORAGE_KEY = 'ressourcesmg_dismissed_announcements';

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Charger les IDs des annonces déjà masquées depuis localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        setDismissedIds(new Set(ids));
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
  }, []);

  useEffect(() => {
    // Charger les annonces actives
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(ANNOUNCEMENTS_API);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.announcements) {
          setAnnouncements(data.announcements.filter((a: Announcement) => a.isActive));
        }
      } catch {
        // Ignorer les erreurs silencieusement
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newDismissed)));
  };

  if (loading) return null;

  // Filtrer les annonces non masquées
  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.has(a.id));

  // Afficher uniquement la plus récente
  const latestAnnouncement = visibleAnnouncements.length > 0 ? visibleAnnouncements[0] : null;

  // Définir une variable CSS pour la hauteur du bandeau (même si pas d'annonce)
  useEffect(() => {
    if (bannerRef.current && latestAnnouncement) {
      const height = bannerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--announcement-banner-height', `${height}px`);
    } else {
      document.documentElement.style.setProperty('--announcement-banner-height', '0px');
    }
  }, [visibleAnnouncements.length, latestAnnouncement?.id]);

  if (!latestAnnouncement) return null;

  const getIcon = () => {
    switch (latestAnnouncement.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getBgColor = () => {
    switch (latestAnnouncement.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getIconColor = () => {
    switch (latestAnnouncement.type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  // Définir une variable CSS pour la hauteur du bandeau
  useEffect(() => {
    if (bannerRef.current) {
      const height = bannerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--announcement-banner-height', `${height}px`);
    }
  }, [visibleAnnouncements.length, latestAnnouncement?.id]);

  return (
    <div ref={bannerRef} className={`border-b ${getBgColor()} shadow-sm sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 ${getIconColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {latestAnnouncement.title && (
              <h3 className="font-semibold text-sm mb-1">{latestAnnouncement.title}</h3>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-line">{latestAnnouncement.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100"
            onClick={() => handleDismiss(latestAnnouncement.id)}
            aria-label="Masquer cette annonce"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
