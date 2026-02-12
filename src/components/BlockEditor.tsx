import { useState } from 'react';
import { Pencil, ChevronDown, ChevronRight, Database } from 'lucide-react';
import { useManagedBlocks } from '@/hooks/useManagedBlocks';
import type { Category } from '@/types/resources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ICON_OPTIONS = [
  'Stethoscope', 'Sparkles', 'MoreHorizontal', 'Wind', 'Heart', 'ToothIcon',
  'ScanFace', 'ThyroidIcon', 'User', 'PregnantWomanIcon', 'TestTubeIcon', 'Bug',
  'Search', 'Briefcase', 'Accessibility', 'Brain', 'Apple', 'Ribbon', 'Eye',
  'Ear', 'Bone', 'Baby', 'Pill', 'BrainCircuit', 'Scan', 'Hand', 'FileText',
  'HeartHandshake', 'Circle',
];

export function BlockEditor() {
  const {
    generalCategories,
    medicalSpecialties,
    fromDb,
    loading,
    seedBlocks,
    updateResource,
    updateCategory,
    refresh,
  } = useManagedBlocks();

  const [seedLoading, setSeedLoading] = useState(false);
  const [seedError, setSeedError] = useState('');
  const [editType, setEditType] = useState<'resource' | 'category' | null>(null);
  const [editItem, setEditItem] = useState<{ id: string; categoryId?: string } & Partial<Category['resources'][0]> & Partial<Pick<Category, 'name' | 'icon'>> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const allCategories = [...generalCategories, ...medicalSpecialties];

  const handleSeed = async () => {
    setSeedError('');
    setSeedLoading(true);
    const result = await seedBlocks();
    setSeedLoading(false);
    if (result.success) {
      setSeedError('');
    } else {
      setSeedError(result.error || 'Erreur');
    }
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
    setEditItem({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
    });
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
              ? 'Les catégories et ressources sont gérées en base. Cliquez sur le crayon pour modifier.'
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
              <Button variant="outline" size="sm" onClick={refresh}>
                Actualiser
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => openEditResource(cat, res)}
                                title="Modifier la ressource"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
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

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
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
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editItem.icon ?? 'Circle'}
                  onChange={(e) => setEditItem((i) => (i ? { ...i, icon: e.target.value } : null))}
                >
                  {ICON_OPTIONS.map((ico) => (
                    <option key={ico} value={ico}>
                      {ico}
                    </option>
                  ))}
                </select>
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
    </>
  );
}
