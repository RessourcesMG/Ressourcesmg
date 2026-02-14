import { useState, useEffect } from 'react';
import { BarChart3, Search, MousePointer, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getToken } from '@/lib/webmasterAuth';

type AnalyticsData = {
  topResources: Array<{ id: string; name: string; categoryId: string; count: number }>;
  topSearches: Array<{ query: string; count: number }>;
  totalClicks: number;
  totalSearches: number;
  periodDays: number;
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('Session expirée');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">Chargement des statistiques…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <p className="text-slate-500 text-xs">
            Assurez-vous d&apos;avoir exécuté supabase/schema-analytics.sql et que les tables existent.
          </p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Réessayer
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics (derniers {data.periodDays} jours)
        </CardTitle>
        <button
          onClick={fetchAnalytics}
          className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
          aria-label="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3">
            <MousePointer className="w-8 h-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.totalClicks}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clics sur les ressources</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3">
            <Search className="w-8 h-8 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.totalSearches}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Recherches effectuées</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Ressources les plus cliquées</h4>
          {data.topResources.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune donnée</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {data.topResources.map((r, i) => (
                <li key={r.id} className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[70%]">
                    {i + 1}. {r.name}
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-medium shrink-0 ml-2">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Recherches populaires</h4>
          {data.topSearches.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune donnée</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {data.topSearches.map((s, i) => (
                <li key={`${s.query}-${i}`} className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[70%]">
                    {i + 1}. &quot;{s.query}&quot;
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-medium shrink-0 ml-2">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
