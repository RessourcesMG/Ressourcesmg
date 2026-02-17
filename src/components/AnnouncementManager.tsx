import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { getToken } from '@/lib/webmasterAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Announcement } from './AnnouncementBanner';

const ANNOUNCEMENTS_API = typeof window !== 'undefined' ? `${window.location.origin}/api/announcements` : '/api/announcements';

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ANNOUNCEMENTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.announcements) {
        setAnnouncements(data.announcements);
      } else {
        setError(data?.error || 'Erreur chargement');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const openCreate = () => {
    setIsCreating(true);
    setEditAnnouncement(null);
    setForm({
      title: '',
      message: '',
      type: 'info',
      isActive: true,
    });
  };

  const openEdit = (a: Announcement) => {
    setIsCreating(false);
    setEditAnnouncement(a);
    setForm({
      title: a.title,
      message: a.message,
      type: a.type,
      isActive: a.isActive,
    });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError('Le titre et le message sont requis');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Session expirée');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isCreating ? ANNOUNCEMENTS_API : ANNOUNCEMENTS_API;
      const method = isCreating ? 'POST' : 'PATCH';
      const body = isCreating
        ? {
            title: form.title.trim(),
            message: form.message.trim(),
            type: form.type,
            isActive: form.isActive,
          }
        : {
            id: editAnnouncement?.id,
            title: form.title.trim(),
            message: form.message.trim(),
            type: form.type,
            isActive: form.isActive,
          };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchAnnouncements();
        setEditAnnouncement(null);
        setIsCreating(false);
      } else {
        setError(data?.error || 'Erreur sauvegarde');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) {
      setError('Session expirée');
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`${ANNOUNCEMENTS_API}?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok || res.status === 204) {
        await fetchAnnouncements();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Erreur suppression');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (a: Announcement) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(ANNOUNCEMENTS_API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: a.id,
          isActive: !a.isActive,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await fetchAnnouncements();
      } else {
        setError(data?.error || 'Erreur modification');
      }
    } catch {
      setError('Erreur réseau');
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return s;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            <CardTitle>Bandeaux d'informations</CardTitle>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Nouveau bandeau
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          Les bandeaux s'affichent en haut du site pour tous les visiteurs. Seule l'annonce la plus récente est visible.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        {loading ? (
          <p className="text-slate-500 text-sm">Chargement...</p>
        ) : announcements.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucun bandeau créé.</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`border rounded-lg p-3 ${
                  a.isActive ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{a.title}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          a.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : a.type === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : a.type === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {a.type}
                      </span>
                      {a.isActive ? (
                        <span className="text-xs text-green-600 font-medium">● Actif</span>
                      ) : (
                        <span className="text-xs text-slate-400">● Inactif</span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-line">{a.message}</p>
                    <p className="text-slate-400 text-xs mt-1">Créé le {formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => toggleActive(a)}
                      title={a.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {a.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-slate-500 hover:text-red-600"
                      disabled={deletingId === a.id}
                      onClick={() => handleDelete(a.id)}
                      title="Supprimer"
                    >
                      {deletingId === a.id ? '...' : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!editAnnouncement || isCreating}
        onOpenChange={(o) => {
          if (!o) {
            setEditAnnouncement(null);
            setIsCreating(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Créer un bandeau' : 'Modifier le bandeau'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1"
                placeholder="Ex: Nouvelle ressource ajoutée !"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="mt-1"
                rows={4}
                placeholder="Le message à afficher dans le bandeau..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Utilisez des retours à la ligne pour structurer le message.
              </p>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as typeof form.type }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information (bleu)</SelectItem>
                  <SelectItem value="success">Succès (vert)</SelectItem>
                  <SelectItem value="warning">Avertissement (orange)</SelectItem>
                  <SelectItem value="error">Erreur (rouge)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked === true }))}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Activer immédiatement (visible sur le site)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditAnnouncement(null);
                setIsCreating(false);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
