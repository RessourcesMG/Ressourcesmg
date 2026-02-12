import { useState } from 'react';
import { Pencil, ChevronDown, ChevronRight, Database, Trash2, Plus } from 'lucide-react';
import { useManagedBlocks } from '@/hooks/useManagedBlocks';
import type { Category } from '@/types/resources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { IconPicker } from '@/components/IconPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function BlockEditor() {
  const {
    generalCategories,
    medicalSpecialties,
    fromDb,
    loading,
    seedBlocks,
    addCategory,
    updateResource,
    updateCategory,
    deleteResource,
    deleteCategory,
  } = useManagedBlocks();

  const [seedLoading, setSeedLoading] = useState(false);
  const [seedError, setSeedError] = useState('');
  const [editType, setEditType] = useState<'resource' | 'category' | 'newCategory' | null>(null);
  const [editItem, setEditItem] = useState<{ id: string; categoryId?: string } & Partial<Category['resources'][0]> & Partial<Pick<Category, 'name' | 'icon'>> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'resource' | 'category'; id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Circle');

  const allCategories = [...generalCategories, ...medicalSpecialties];

  const handleSeed = async () => {
    setSeedError('');
    setSeedLoading(true);
    const result = await seedBlocks();
    setSeedLoading(false);
    if (result.success) setSeedError('');
    else setSeedError(result.error || 'Erreur');
  };

  const openEditResource = (cat: Category, res: Category['resources'][0]) => {
    setEditType('resource');
    setEditItem({
      id: res.id,
      categoryId: cat.id,
      name: res.name,
      description: res.description ?? '',
      url: res.url,
      requiresAuth: res.requiresAuth ?? false,
      note: res.note ?? '',
    });
  };

  const openEditCategory = (cat: Category) => {
    setEditType('category');
    setEditItem({ id: cat.id, name: cat.name, icon: cat.icon });
  };

  const openAddCategory = () => {
    setEditType('newCategory');
    setNewCatName('');
    setNewCatIcon('Circle');
  };

  const handleSave = async () => {
    if (!editItem || !editType) return;
    setSaveError('');
    setSaving(true);
    const result =
      editType === 'resource'
        ? await updateResource(editItem.id, {
            name: editItem.name,
            description: editItem.description,
            url: editItem.url,
            requiresAuth: editItem.requiresAuth,
            note: editItem.note,
          })
        : await updateCategory(editItem.id, { name: editItem.name, icon: editItem.icon });
    setSaving(false);
    if (result.success) {
      setEditItem(null);
      setEditType(null);
    } else {
      setSaveError(result.error || 'Erreur');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSaveError('');
    setSaving(true);
    const result = await addCategory(newCatName.trim(), newCatIcon);
    setSaving(false);
    if (result.success) {
      setEditType(null);
    } else {
      setSaveError(result.error || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const result =
      deleteTarget.type === 'resource'
        ? await deleteResource(deleteTarget.id)
        : await deleteCategory(deleteTarget.id);
    setDeleteLoading(false);
    if (result.success) setDeleteTarget(null);
    else setSaveError(result.error || 'Erreur');
  };

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-slate-500 text-center">Chargement des blocs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Éditer les blocs
          </CardTitle>
          <p className="text-sm text-slate-600">
            {fromDb
              ? 'Cliquez sur le crayon pour modifier, la corbeille pour supprimer.'
              : 'Initialisez d\'abord les blocs pour pouvoir les éditer.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!fromDb && (
            <div>
              <Button onClick={handleSeed} disabled={seedLoading}>
                {seedLoading ? 'Initialisation...' : 'Initialiser les blocs depuis les données par défaut'}
              </Button>
              {seedError && <p className="text-sm text-red-600 mt-2">{seedError}</p>}
            </div>
          )}
          {fromDb && (
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={openAddCategory}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une catégorie
              </Button>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {allCategories.map((cat) => (
                  <Collapsible
                    key={cat.id}
                    open={openCategories[cat.id] ?? true}
                    onOpenChange={() => toggleCategory(cat.id)}
                  >
                    <div className="border border-slate-200 rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-50">
                          {openCategories[cat.id] !== false ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="font-medium text-slate-900">{cat.name}</span>
                          <span className="text-sm text-slate-500">
                            ({cat.resources.length} ressources)
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCategory(cat);
                            }}
                            title="Modifier la catégorie"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ type: 'category', id: cat.id, name: cat.name });
                            }}
                            title="Supprimer la catégorie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t border-slate-200 p-2 space-y-1">
                          {cat.resources.map((res) => (
                            <div
                              key={res.id}
                              className="flex items-center justify-between gap-2 py-2 px-3 rounded hover:bg-slate-50"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-800 truncate">{res.name}</p>
                                <p className="text-xs text-slate-500 truncate">{res.description}</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditResource(cat, res)}
                                  title="Modifier la ressource"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'resource',
                                      id: res.id,
                                      name: res.name,
                                    })
                                  }
                                  title="Supprimer la ressource"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog modifier ressource / catégorie */}
      <Dialog
        open={!!editItem && (editType === 'resource' || editType === 'category')}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editType === 'resource' ? 'Modifier la ressource' : 'Modifier la catégorie'}
            </DialogTitle>
          </DialogHeader>
          {editItem && editType === 'resource' && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nom</Label>
                <Input
                  value={editItem.name ?? ''}
                  onChange={(e) => setEditItem((i) => (i ? { ...i, name: e.target.value } : null))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editItem.description ?? ''}
                  onChange={(e) => setEditItem((i) => (i ? { ...i, description: e.target.value } : null))}
                  rows={2}
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  type="url"
                  value={editItem.url ?? ''}
                  onChange={(e) => setEditItem((i) => (i ? { ...i, url: e.target.value } : null))}
                />
              </div>
              <div>
                <Label>Note (optionnel)</Label>
                <Input
                  value={editItem.note ?? ''}
                  onChange={(e) => setEditItem((i) => (i ? { ...i, note: e.target.value } : null))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editItem.requiresAuth ?? false}
                  onCheckedChange={(c) =>
                    setEditItem((i) => (i ? { ...i, requiresAuth: !!c } : null))
                  }
                />
                <Label>Nécessite une connexion</Label>
              </div>
            </div>
          )}
          {editItem && editType === 'category' && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nom</Label>
                <Input
                  value={editItem.name ?? ''}
                  onChange={(e) => setEditItem((i) => (i ? { ...i, name: e.target.value } : null))}
                />
              </div>
              <div>
                <Label>Icône</Label>
                <IconPicker
                  value={editItem.icon ?? 'Circle'}
                  onChange={(icon) => setEditItem((i) => (i ? { ...i, icon } : null))}
                />
              </div>
            </div>
          )}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog nouvelle catégorie */}
      <Dialog open={editType === 'newCategory'} onOpenChange={(open) => !open && setEditType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nom (ex: Néphrologie)</Label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Néphrologie"
              />
            </div>
            <div>
              <Label>Icône</Label>
              <IconPicker value={newCatIcon} onChange={setNewCatIcon} />
            </div>
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditType(null)}>
              Annuler
            </Button>
            <Button onClick={handleAddCategory} disabled={saving || !newCatName.trim()}>
              {saving ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'category'
                ? `Supprimer la catégorie « ${deleteTarget.name} » et toutes ses ressources ? Cette action est irréversible.`
                : `Supprimer la ressource « ${deleteTarget?.name} » ? Cette action est irréversible.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
