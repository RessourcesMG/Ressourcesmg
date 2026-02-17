import { useState, useCallback, useMemo } from 'react';
import { Pencil, ChevronDown, ChevronRight, Database, Trash2, Plus, GripVertical, Globe, Stethoscope, ArrowDownAZ, Search } from 'lucide-react';
import { useManagedBlocksContext } from '@/contexts/ManagedBlocksContext';
import type { Category, Resource } from '@/types/resources';
import { getSortAlphabetically, setSortAlphabetically } from '@/lib/sortAzPrefs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { IconPicker } from '@/components/IconPicker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    reorderCategories,
    reorderResources,
    updateResource,
    updateCategory,
    deleteResource,
    deleteCategory,
  } = useManagedBlocksContext();

  const [seedLoading, setSeedLoading] = useState(false);
  const [seedError, setSeedError] = useState('');
  const [editType, setEditType] = useState<'resource' | 'category' | 'newCategory' | null>(null);
  const [editItem, setEditItem] = useState<{ id: string; categoryId?: string; originalCategoryId?: string } & Partial<Category['resources'][0]> & Partial<Pick<Category, 'name' | 'icon'>> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'resource' | 'category'; id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Circle');
  const [newCatIsSpecialty, setNewCatIsSpecialty] = useState(true);
  const [dragCategoryId, setDragCategoryId] = useState<string | null>(null);
  const [dragSection, setDragSection] = useState<'general' | 'specialty' | null>(null);
  const [dragResource, setDragResource] = useState<{ resourceId: string; categoryId: string } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<
    { type: 'category'; section: 'general' | 'specialty'; index: number } | { type: 'resource'; categoryId: string; index: number } | null
  >(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [pendingResourceOrder, setPendingResourceOrder] = useState<Record<string, string[]>>({});
  const [sortAzPrefs, setSortAzPrefs] = useState<Record<string, boolean>>(() => ({}));
  const [searchQuery, setSearchQuery] = useState('');

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
      originalCategoryId: cat.id,
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

  const openAddCategory = (isSpecialty: boolean) => {
    setEditType('newCategory');
    setNewCatName('');
    setNewCatIcon('Circle');
    setNewCatIsSpecialty(isSpecialty);
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
            ...(editItem.categoryId && editItem.categoryId !== editItem.originalCategoryId
              ? { categoryId: editItem.categoryId }
              : {}),
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
    const result = await addCategory(newCatName.trim(), newCatIcon, newCatIsSpecialty);
    setSaving(false);
    if (result.success) {
      setEditType(null);
    } else {
      setSaveError(result.error || 'Erreur');
    }
  };

  const moveInArray = <T,>(arr: T[], fromId: string, toId: string, idKey: keyof T): T[] => {
    const fromIdx = arr.findIndex((x) => (x as Record<string, string>)[idKey as string] === fromId);
    const toIdx = arr.findIndex((x) => (x as Record<string, string>)[idKey as string] === toId);
    if (fromIdx === -1 || toIdx === -1) return arr;
    const out = arr.slice();
    const [item] = out.splice(fromIdx, 1);
    out.splice(toIdx, 0, item);
    return out;
  };

  /** Déplace l'élément à fromIdx pour l'insérer à la position toIdx (avant l'élément actuellement à toIdx). */
  const insertAtOrder = <T,>(arr: T[], fromIdx: number, toIdx: number): T[] => {
    if (fromIdx === -1 || toIdx < 0 || toIdx > arr.length) return arr;
    const out = arr.slice();
    const [item] = out.splice(fromIdx, 1);
    const insertIdx = toIdx > fromIdx ? toIdx - 1 : toIdx;
    out.splice(insertIdx, 0, item);
    return out;
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string, section: 'general' | 'specialty') => {
    setDragCategoryId(categoryId);
    setDragSection(section);
    e.dataTransfer.setData('text/plain', categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDragCategoryId(null);
    setDragSection(null);
    setDropIndicator(null);
  };

  const handleCategoryDropZoneOver = (e: React.DragEvent, section: 'general' | 'specialty', index: number) => {
    if (!dragCategoryId || dragSection !== section) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicator({ type: 'category', section, index });
  };

  const handleCategoryDropZoneDrop = async (e: React.DragEvent, section: 'general' | 'specialty', toIndex: number) => {
    e.preventDefault();
    setDropIndicator(null);
    if (!dragCategoryId || dragSection !== section) {
      setDragCategoryId(null);
      setDragSection(null);
      return;
    }
    const list = section === 'general' ? generalCategories : medicalSpecialties;
    const fromIdx = list.findIndex((c) => c.id === dragCategoryId);
    if (fromIdx === -1) {
      setDragCategoryId(null);
      setDragSection(null);
      return;
    }
    const reordered = insertAtOrder(list, fromIdx, toIndex);
    const newOrder = reordered.map((c) => c.id);
    setDragCategoryId(null);
    setDragSection(null);
    setReorderLoading(true);
    setSaveError('');
    const result =
      section === 'general'
        ? await reorderCategories(newOrder, undefined)
        : await reorderCategories(undefined, newOrder);
    setReorderLoading(false);
    if (!result.success) setSaveError(result.error || 'Erreur réordonnancement');
  };

  const handleDrop = async (e: React.DragEvent, targetId: string, section: 'general' | 'specialty') => {
    e.preventDefault();
    if (!dragCategoryId || dragSection !== section) {
      setDragCategoryId(null);
      setDragSection(null);
      return;
    }
    if (dragCategoryId === targetId) {
      setDragCategoryId(null);
      setDragSection(null);
      return;
    }
    setReorderLoading(true);
    setSaveError('');
    if (section === 'general') {
      const newOrder = moveInArray(generalCategories, dragCategoryId, targetId, 'id').map((c) => c.id);
      const result = await reorderCategories(newOrder, undefined);
      if (!result.success) setSaveError(result.error || 'Erreur réordonnancement');
    } else {
      const newOrder = moveInArray(medicalSpecialties, dragCategoryId, targetId, 'id').map((c) => c.id);
      const result = await reorderCategories(undefined, newOrder);
      if (!result.success) setSaveError(result.error || 'Erreur réordonnancement');
    }
    setReorderLoading(false);
    setDragCategoryId(null);
    setDragSection(null);
  };

  const getDisplayedResources = useCallback(
    (cat: Category): Resource[] => {
      const pending = pendingResourceOrder[cat.id];
      if (pending?.length) {
        const byId = new Map(cat.resources.map((r) => [r.id, r]));
        return pending.map((id) => byId.get(id)).filter(Boolean) as Resource[];
      }
      const sortAz = sortAzPrefs[cat.id] !== false ? getSortAlphabetically(cat.id) : false;
      if (sortAz) {
        return [...cat.resources].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      }
      return cat.resources;
    },
    [pendingResourceOrder, sortAzPrefs]
  );

  const toggleSortAlphabetically = useCallback(
    async (cat: Category) => {
      const next = !getSortAlphabetically(cat.id);
      setSortAlphabetically(cat.id, next);
      setSortAzPrefs((p) => ({ ...p, [cat.id]: next }));
      if (next && cat.resources.length > 0) {
        setReorderLoading(true);
        setSaveError('');
        const sorted = [...cat.resources].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        const result = await reorderResources(cat.id, sorted.map((r) => r.id));
        setReorderLoading(false);
        if (result.success) {
          setPendingResourceOrder((p) => {
            const next_ = { ...p };
            delete next_[cat.id];
            return next_;
          });
        } else setSaveError(result.error || 'Erreur');
      }
    },
    [reorderResources]
  );

  const applySortAlphabetically = useCallback(
    async (cat: Category) => {
      const sorted = [...cat.resources].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      const ids = sorted.map((r) => r.id);
      if (ids.length === 0) return;
      setSortAlphabetically(cat.id, true);
      setSortAzPrefs((p) => ({ ...p, [cat.id]: true }));
      setReorderLoading(true);
      setSaveError('');
      const result = await reorderResources(cat.id, ids);
      setReorderLoading(false);
      if (result.success) {
        setPendingResourceOrder((p) => {
          const next = { ...p };
          delete next[cat.id];
          return next;
        });
      }
    },
    [reorderResources]
  );

  const handleResourceDragStart = (e: React.DragEvent, resourceId: string, categoryId: string) => {
    setDragResource({ resourceId, categoryId });
    e.dataTransfer.setData('text/plain', `${categoryId}:${resourceId}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleResourceDragEnd = () => {
    setDragResource(null);
    setDropIndicator(null);
  };

  const handleResourceDropZoneOver = (e: React.DragEvent, categoryId: string, index: number) => {
    if (!dragResource || dragResource.categoryId !== categoryId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicator({ type: 'resource', categoryId, index });
  };

  const handleResourceDropZoneDrop = useCallback(
    async (e: React.DragEvent, categoryId: string, toIndex: number) => {
      e.preventDefault();
      setDropIndicator(null);
      if (!dragResource || dragResource.categoryId !== categoryId) {
        setDragResource(null);
        return;
      }
      const cat = [...generalCategories, ...medicalSpecialties].find((c) => c.id === categoryId);
      if (!cat) return;
      const displayed = getDisplayedResources(cat);
      const fromIdx = displayed.findIndex((r) => r.id === dragResource.resourceId);
      if (fromIdx === -1) {
        setDragResource(null);
        return;
      }
      const reordered = insertAtOrder(displayed, fromIdx, toIndex);
      const newIds = reordered.map((r) => r.id);
      setDragResource(null);
      setPendingResourceOrder((p) => ({ ...p, [categoryId]: newIds }));
      setReorderLoading(true);
      setSaveError('');
      const result = await reorderResources(categoryId, newIds);
      setReorderLoading(false);
      if (result.success) {
        setPendingResourceOrder((p) => {
          const next = { ...p };
          delete next[categoryId];
          return next;
        });
      } else {
        setSaveError(result.error || 'Erreur réordonnancement');
        setPendingResourceOrder((p) => {
          const next = { ...p };
          delete next[categoryId];
          return next;
        });
      }
    },
    [dragResource, generalCategories, medicalSpecialties, getDisplayedResources, reorderResources]
  );

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

  // Filtrer les catégories et ressources selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return { general: generalCategories, specialty: medicalSpecialties };
    }
    const query = searchQuery.toLowerCase().trim();
    const filterCategory = (cat: Category) => {
      const matchesCategory = cat.name.toLowerCase().includes(query);
      const matchingResources = cat.resources.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.url.toLowerCase().includes(query) ||
          r.note?.toLowerCase().includes(query)
      );
      return matchesCategory || matchingResources.length > 0
        ? { ...cat, resources: matchingResources.length > 0 ? matchingResources : cat.resources }
        : null;
    };
    return {
      general: generalCategories.map(filterCategory).filter(Boolean) as Category[],
      specialty: medicalSpecialties.map(filterCategory).filter(Boolean) as Category[],
    };
  }, [searchQuery, generalCategories, medicalSpecialties]);

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
            <div className="space-y-6">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une ressource (nom, description, URL, note)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {reorderLoading && (
                <p className="text-sm text-slate-500">Réorganisation en cours...</p>
              )}
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}

              {/* Ressources globales */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Globe className="w-4 h-4 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Ressources globales</h3>
                  <Button variant="outline" size="sm" onClick={() => openAddCategory(false)} className="ml-auto">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter une catégorie
                  </Button>
                </div>
                <div className="max-h-[420px] overflow-y-auto space-y-2">
                  {filteredCategories.general.map((cat) => {
                    const originalCat = generalCategories.find((c) => c.id === cat.id);
                    if (!originalCat) return null;
                    const originalIdx = generalCategories.findIndex((c) => c.id === cat.id);
                    return (
                    <div key={cat.id} className="space-y-0">
                      <div
                        className={`min-h-[10px] flex items-center transition-colors ${dropIndicator?.type === 'category' && dropIndicator.section === 'general' && dropIndicator.index === originalIdx ? 'py-1' : ''}`}
                        onDragOver={(e) => handleCategoryDropZoneOver(e, 'general', originalIdx)}
                        onDragLeave={() => setDropIndicator(null)}
                        onDrop={(e) => handleCategoryDropZoneDrop(e, 'general', originalIdx)}
                      >
                        {dropIndicator?.type === 'category' && dropIndicator.section === 'general' && dropIndicator.index === originalIdx && (
                          <div className="h-1 w-full max-w-[calc(100%-1rem)] mx-2 bg-teal-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <Collapsible
                        open={openCategories[cat.id] ?? true}
                        onOpenChange={() => toggleCategory(cat.id)}
                      >
                        <div
                          className={`transition-opacity duration-75 ${dragCategoryId === cat.id ? 'opacity-50' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, cat.id, 'general')}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, cat.id, 'general')}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="border border-slate-200 rounded-lg bg-white">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-50">
                                <span className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600" title="Glisser pour réordonner" onPointerDown={(e) => e.stopPropagation()}>
                                  <GripVertical className="w-4 h-4" />
                                </span>
                                {openCategories[cat.id] !== false ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="font-medium text-slate-900">{cat.name}</span>
                                <span className="text-sm text-slate-500">
                                  ({cat.resources.length} ressources)
                                </span>
                                {cat.resources.length > 0 && (
                                  <>
                                    <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                                      <Checkbox
                                        id={`sort-az-${cat.id}`}
                                        checked={sortAzPrefs[cat.id] ?? getSortAlphabetically(cat.id)}
                                        onCheckedChange={() => toggleSortAlphabetically(cat)}
                                        title="Ordre alphabétique (appliqué sur le site quand coché)"
                                      />
                                      <Label htmlFor={`sort-az-${cat.id}`} className="text-xs cursor-pointer flex items-center gap-1 text-slate-600">
                                        <ArrowDownAZ className="w-3.5 h-3.5" />
                                        A–Z
                                      </Label>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-slate-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        applySortAlphabetically(cat);
                                      }}
                                      title="Appliquer l'ordre alphabétique maintenant"
                                    >
                                      Appliquer A–Z
                                    </Button>
                                  </>
                                )}
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
                            <div className="border-t border-slate-200 p-2 space-y-0">
                              {getDisplayedResources(cat).map((res, resIdx) => (
                                <div key={res.id} className="space-y-0">
                                  <div
                                    className={`min-h-[6px] flex items-center transition-colors ${dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === resIdx ? 'py-0.5' : ''}`}
                                    onDragOver={(e) => handleResourceDropZoneOver(e, cat.id, resIdx)}
                                    onDragLeave={() => setDropIndicator(null)}
                                    onDrop={(e) => handleResourceDropZoneDrop(e, cat.id, resIdx)}
                                  >
                                    {dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === resIdx && (
                                      <div className="h-0.5 w-full bg-teal-500 rounded-full" />
                                    )}
                                  </div>
                                  <div
                                    draggable
                                    onDragStart={(e) => handleResourceDragStart(e, res.id, cat.id)}
                                    onDragEnd={handleResourceDragEnd}
                                    className={`flex items-center justify-between gap-2 py-2 px-3 rounded transition-opacity duration-75 select-none ${
                                      dragResource?.resourceId === res.id && dragResource?.categoryId === cat.id
                                        ? 'opacity-40 bg-slate-100'
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none" title="Glisser pour réordonner">
                                      <GripVertical className="w-4 h-4 shrink-0" />
                                    </span>
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
                                </div>
                              ))}
                              {getDisplayedResources(cat).length > 0 && (
                                <div
                                  className={`min-h-[6px] flex items-center ${dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === getDisplayedResources(cat).length ? 'py-0.5' : ''}`}
                                  onDragOver={(e) => handleResourceDropZoneOver(e, cat.id, getDisplayedResources(cat).length)}
                                  onDragLeave={() => setDropIndicator(null)}
                                  onDrop={(e) => handleResourceDropZoneDrop(e, cat.id, getDisplayedResources(cat).length)}
                                >
                                  {dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === getDisplayedResources(cat).length && (
                                    <div className="h-0.5 w-full bg-teal-500 rounded-full" />
                                  )}
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </div>
                    </Collapsible>
                    </div>
                    );
                  })}
                  <div
                    className={`min-h-[10px] flex items-center transition-colors ${dropIndicator?.type === 'category' && dropIndicator.section === 'general' && dropIndicator.index === generalCategories.length ? 'py-1' : ''}`}
                    onDragOver={(e) => handleCategoryDropZoneOver(e, 'general', generalCategories.length)}
                    onDragLeave={() => setDropIndicator(null)}
                    onDrop={(e) => handleCategoryDropZoneDrop(e, 'general', generalCategories.length)}
                  >
                    {dropIndicator?.type === 'category' && dropIndicator.section === 'general' && dropIndicator.index === generalCategories.length && (
                      <div className="h-1 w-full max-w-[calc(100%-1rem)] mx-2 bg-teal-500 rounded-full shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Ressources par spécialités */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Ressources par spécialités</h3>
                  <Button variant="outline" size="sm" onClick={() => openAddCategory(true)} className="ml-auto">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter une catégorie
                  </Button>
                </div>
                <div className="max-h-[420px] overflow-y-auto space-y-2">
                  {filteredCategories.specialty.map((cat) => {
                    const originalCat = medicalSpecialties.find((c) => c.id === cat.id);
                    if (!originalCat) return null;
                    const originalIdx = medicalSpecialties.findIndex((c) => c.id === cat.id);
                    return (
                    <div key={cat.id} className="space-y-0">
                      <div
                        className={`min-h-[10px] flex items-center transition-colors ${dropIndicator?.type === 'category' && dropIndicator.section === 'specialty' && dropIndicator.index === originalIdx ? 'py-1' : ''}`}
                        onDragOver={(e) => handleCategoryDropZoneOver(e, 'specialty', originalIdx)}
                        onDragLeave={() => setDropIndicator(null)}
                        onDrop={(e) => handleCategoryDropZoneDrop(e, 'specialty', originalIdx)}
                      >
                        {dropIndicator?.type === 'category' && dropIndicator.section === 'specialty' && dropIndicator.index === originalIdx && (
                          <div className="h-1 w-full max-w-[calc(100%-1rem)] mx-2 bg-teal-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <Collapsible
                        open={openCategories[cat.id] ?? true}
                        onOpenChange={() => toggleCategory(cat.id)}
                      >
                        <div
                          className={`transition-opacity duration-75 ${dragCategoryId === cat.id ? 'opacity-50' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, cat.id, 'specialty')}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, cat.id, 'specialty')}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="border border-slate-200 rounded-lg bg-white">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-50">
                                <span className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600" title="Glisser pour réordonner" onPointerDown={(e) => e.stopPropagation()}>
                                  <GripVertical className="w-4 h-4" />
                                </span>
                                {openCategories[cat.id] !== false ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="font-medium text-slate-900">{cat.name}</span>
                                <span className="text-sm text-slate-500">
                                  ({cat.resources.length} ressources)
                                </span>
                                {cat.resources.length > 0 && (
                                  <>
                                    <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                                      <Checkbox
                                        id={`sort-az-spec-${cat.id}`}
                                        checked={sortAzPrefs[cat.id] ?? getSortAlphabetically(cat.id)}
                                        onCheckedChange={() => toggleSortAlphabetically(cat)}
                                        title="Ordre alphabétique (appliqué sur le site quand coché)"
                                      />
                                      <Label htmlFor={`sort-az-spec-${cat.id}`} className="text-xs cursor-pointer flex items-center gap-1 text-slate-600">
                                        <ArrowDownAZ className="w-3.5 h-3.5" />
                                        A–Z
                                      </Label>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-slate-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        applySortAlphabetically(cat);
                                      }}
                                      title="Appliquer l'ordre alphabétique maintenant"
                                    >
                                      Appliquer A–Z
                                    </Button>
                                  </>
                                )}
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
                            <div className="border-t border-slate-200 p-2 space-y-0">
                              {getDisplayedResources(cat).map((res, resIdx) => (
                                <div key={res.id} className="space-y-0">
                                  <div
                                    className={`min-h-[6px] flex items-center transition-colors ${dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === resIdx ? 'py-0.5' : ''}`}
                                    onDragOver={(e) => handleResourceDropZoneOver(e, cat.id, resIdx)}
                                    onDragLeave={() => setDropIndicator(null)}
                                    onDrop={(e) => handleResourceDropZoneDrop(e, cat.id, resIdx)}
                                  >
                                    {dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === resIdx && (
                                      <div className="h-0.5 w-full bg-teal-500 rounded-full" />
                                    )}
                                  </div>
                                  <div
                                    draggable
                                    onDragStart={(e) => handleResourceDragStart(e, res.id, cat.id)}
                                    onDragEnd={handleResourceDragEnd}
                                    className={`flex items-center justify-between gap-2 py-2 px-3 rounded transition-opacity duration-75 select-none ${
                                      dragResource?.resourceId === res.id && dragResource?.categoryId === cat.id
                                        ? 'opacity-40 bg-slate-100'
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none" title="Glisser pour réordonner">
                                      <GripVertical className="w-4 h-4 shrink-0" />
                                    </span>
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
                                </div>
                              ))}
                              {getDisplayedResources(cat).length > 0 && (
                                <div
                                  className={`min-h-[6px] flex items-center ${dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === getDisplayedResources(cat).length ? 'py-0.5' : ''}`}
                                  onDragOver={(e) => handleResourceDropZoneOver(e, cat.id, getDisplayedResources(cat).length)}
                                  onDragLeave={() => setDropIndicator(null)}
                                  onDrop={(e) => handleResourceDropZoneDrop(e, cat.id, getDisplayedResources(cat).length)}
                                >
                                  {dropIndicator?.type === 'resource' && dropIndicator.categoryId === cat.id && dropIndicator.index === getDisplayedResources(cat).length && (
                                    <div className="h-0.5 w-full bg-teal-500 rounded-full" />
                                  )}
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </div>
                    </Collapsible>
                    </div>
                    );
                  })}
                  <div
                    className={`min-h-[10px] flex items-center transition-colors ${dropIndicator?.type === 'category' && dropIndicator.section === 'specialty' && dropIndicator.index === medicalSpecialties.length ? 'py-1' : ''}`}
                    onDragOver={(e) => handleCategoryDropZoneOver(e, 'specialty', medicalSpecialties.length)}
                    onDragLeave={() => setDropIndicator(null)}
                    onDrop={(e) => handleCategoryDropZoneDrop(e, 'specialty', medicalSpecialties.length)}
                  >
                    {dropIndicator?.type === 'category' && dropIndicator.section === 'specialty' && dropIndicator.index === medicalSpecialties.length && (
                      <div className="h-1 w-full max-w-[calc(100%-1rem)] mx-2 bg-teal-500 rounded-full shrink-0" />
                    )}
                  </div>
                </div>
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
                <Label>Catégorie</Label>
                <Select
                  value={
                    (() => {
                      const allIds = [...generalCategories, ...medicalSpecialties].map((c) => c.id);
                      const id = editItem.categoryId ?? '';
                      return allIds.includes(id) ? id : (allIds[0] ?? '');
                    })()
                  }
                  onValueChange={(v) => setEditItem((i) => (i ? { ...i, categoryId: v } : null))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir une section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Ressources globales</SelectLabel>
                      {generalCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Ressources par spécialités</SelectLabel>
                      {medicalSpecialties.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
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
            <p className="text-sm text-slate-600">
              Section : <strong>{newCatIsSpecialty ? 'Ressources par spécialités' : 'Ressources globales'}</strong>
            </p>
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
