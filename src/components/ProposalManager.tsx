import { useState, useEffect, useCallback } from 'react';
import { Inbox, Check, X, Pencil, ExternalLink, Trash2 } from 'lucide-react';
import { getToken } from '@/lib/webmasterAuth';
import { getSortAlphabetically } from '@/lib/sortAzPrefs';
import { useManagedBlocksContext } from '@/contexts/ManagedBlocksContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export type Proposal = {
  id: string;
  name: string;
  url: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  categoryId?: string;
  note?: string;
  requiresAuth?: boolean;
  createdAt: string;
};

const PROPOSALS_API = typeof window !== 'undefined' ? `${window.location.origin}/api/proposals` : '/api/proposals';

export function ProposalManager() {
  const { generalCategories, medicalSpecialties, fromDb, refresh, reorderResources } = useManagedBlocksContext();
  const categoriesForSelect = [...generalCategories, ...medicalSpecialties];

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editProposal, setEditProposal] = useState<Proposal | null>(null);
  const [editForm, setEditForm] = useState({ name: '', url: '', description: '', categoryId: '', note: '', requiresAuth: false });
  const [acceptCategoryId, setAcceptCategoryId] = useState<Record<string, string>>({});

  const fetchProposals = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PROPOSALS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.proposals) {
        setProposals(data.proposals);
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
    fetchProposals();
  }, [fetchProposals]);

  // Pré-sélectionner la catégorie : celle choisie par le visiteur si présente, sinon la première
  const pendingProposals = proposals.filter((p) => p.status === 'pending');
  const firstCatId = categoriesForSelect[0]?.id;
  const catIds = categoriesForSelect.map((c) => c.id);
  useEffect(() => {
    if (firstCatId && pendingProposals.length > 0) {
      setAcceptCategoryId((prev) => {
        const next = { ...prev };
        pendingProposals.forEach((p) => {
          if (next[p.id]) return;
          const preferred = p.categoryId && catIds.includes(p.categoryId) ? p.categoryId : firstCatId;
          next[p.id] = preferred;
        });
        return next;
      });
    }
  }, [firstCatId, pendingProposals.map((p) => p.id).join(','), pendingProposals.map((p) => p.categoryId).join(',')]);

  const handleAccept = async (id: string) => {
    const categoryId = acceptCategoryId[id] || categoriesForSelect[0]?.id;
    if (!categoryId) {
      setError('Choisissez une catégorie');
      return;
    }
    setAcceptingId(id);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('Session expirée');
      setAcceptingId(null);
      return;
    }
    try {
      const res = await fetch(PROPOSALS_API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action: 'accept', categoryId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchProposals();
        const updated = await refresh();
        const allCats = [...(updated?.generalCategories ?? []), ...(updated?.medicalSpecialties ?? [])];
        const cat = allCats.find((c) => c.id === categoryId);
        if (cat && getSortAlphabetically(categoryId)) {
          const sorted = [...cat.resources].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
          await reorderResources(categoryId, sorted.map((r) => r.id));
        }
        setAcceptCategoryId((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        setError(data?.error || 'Erreur acceptation');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('Session expirée');
      setRejectingId(null);
      return;
    }
    try {
      const res = await fetch(PROPOSALS_API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action: 'reject' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchProposals();
      } else {
        setError(data?.error || 'Erreur refus');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setRejectingId(null);
    }
  };

  const openEdit = (p: Proposal) => {
    setEditProposal(p);
    setEditForm({ 
      name: p.name, 
      url: p.url, 
      description: p.description,
      categoryId: p.categoryId || '',
      note: p.note || '',
      requiresAuth: p.requiresAuth || false,
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('Session expirée');
      setDeletingId(null);
      return;
    }
    try {
      const res = await fetch(PROPOSALS_API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action: 'delete' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchProposals();
        setAcceptCategoryId((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        setError(data?.error || 'Erreur suppression');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = async () => {
    if (!editProposal) return;
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(PROPOSALS_API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editProposal.id,
          action: 'edit',
          name: editForm.name.trim(),
          url: editForm.url.trim(),
          description: editForm.description.trim(),
          categoryId: editForm.categoryId || undefined,
          note: editForm.note.trim() || undefined,
          requiresAuth: editForm.requiresAuth,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchProposals();
        setEditProposal(null);
      } else {
        setError(data?.error || 'Erreur édition');
      }
    } catch {
      setError('Erreur réseau');
    }
  };

  const pending = proposals.filter((p) => p.status === 'pending');
  const accepted = proposals.filter((p) => p.status === 'accepted');
  const rejected = proposals.filter((p) => p.status === 'rejected');

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return s;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          Propositions des utilisateurs
        </CardTitle>
        <p className="text-sm text-slate-600">
          Les visiteurs peuvent proposer des sites via le formulaire en bas de page.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}
        {loading ? (
          <p className="text-slate-500 text-sm">Chargement...</p>
        ) : proposals.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucune proposition.</p>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  En attente ({pending.length})
                </h4>
                <div className="space-y-2">
                  {pending.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-lg p-3 bg-amber-50/50 border-amber-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-900 hover:text-teal-600 inline-flex items-center gap-1"
                          >
                            {p.name}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <p className="text-slate-600 text-sm mt-1 truncate">{p.url}</p>
                          {p.description && (
                            <p className="text-slate-500 text-xs mt-1">{p.description}</p>
                          )}
                          <p className="text-slate-400 text-xs mt-1">{formatDate(p.createdAt)}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          {fromDb && categoriesForSelect.length > 0 ? (
                            <Select
                              value={acceptCategoryId[p.id] ?? ''}
                              onValueChange={(v) =>
                                setAcceptCategoryId((prev) => ({ ...prev, [p.id]: v }))
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs max-w-[140px]">
                                <SelectValue placeholder="Catégorie" className="truncate" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoriesForSelect.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 bg-green-600 hover:bg-green-700"
                              disabled={acceptingId === p.id || categoriesForSelect.length === 0 || !acceptCategoryId[p.id]}
                              onClick={() => handleAccept(p.id)}
                            >
                              {acceptingId === p.id ? (
                                '...'
                              ) : (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Accepter
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              disabled={rejectingId === p.id}
                              onClick={() => handleReject(p.id)}
                              title="Refuser"
                            >
                              {rejectingId === p.id ? '...' : <X className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-slate-500 hover:text-red-600"
                              disabled={deletingId === p.id}
                              onClick={() => handleDelete(p.id)}
                              title="Supprimer définitivement"
                            >
                              {deletingId === p.id ? '...' : <Trash2 className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accepted.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Acceptées ({accepted.length})
                </h4>
                <div className="space-y-2">
                  {accepted.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-lg p-3 bg-green-50/50 border-green-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-900 hover:text-teal-600"
                          >
                            {p.name}
                          </a>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 truncate">{p.url}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-slate-500 hover:text-red-600 shrink-0"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id)}
                        title="Supprimer de la liste"
                      >
                        {deletingId === p.id ? '...' : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rejected.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Refusées ({rejected.length})
                </h4>
                <div className="space-y-2">
                  {rejected.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-lg p-3 bg-slate-50 border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-600">{p.name}</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 truncate">{p.url}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-slate-500 hover:text-red-600 shrink-0"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id)}
                        title="Supprimer définitivement"
                      >
                        {deletingId === p.id ? '...' : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editProposal} onOpenChange={(o) => !o && setEditProposal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la proposition</DialogTitle>
          </DialogHeader>
          {editProposal && (
            <div className="space-y-4 py-2">
              <div>
                <Label>Nom du site</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  type="url"
                  value={editForm.url}
                  onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1"
                  rows={2}
                />
              </div>
              {fromDb && categoriesForSelect.length > 0 && (
                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={editForm.categoryId}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, categoryId: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesForSelect.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Note (optionnel)</Label>
                <Textarea
                  value={editForm.note}
                  onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                  className="mt-1"
                  rows={2}
                  placeholder="Note additionnelle sur cette ressource"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresAuth"
                  checked={editForm.requiresAuth}
                  onCheckedChange={(checked) => setEditForm((f) => ({ ...f, requiresAuth: checked === true }))}
                />
                <Label htmlFor="requiresAuth" className="cursor-pointer">
                  Nécessite une authentification
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProposal(null)}>
              Annuler
            </Button>
            <Button onClick={handleEditSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
