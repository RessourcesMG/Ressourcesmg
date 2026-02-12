import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, Trash2, ExternalLink, LogOut, Shield } from 'lucide-react';
import { isWebmasterLoggedIn, login, logout, getToken } from '@/lib/webmasterAuth';
import { useCustomResources, type CustomResourceInput } from '@/hooks/useCustomResources';
import { useManagedBlocks } from '@/hooks/useManagedBlocks';
import { BlockEditor } from '@/components/BlockEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export function Webmaster() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const { generalCategories, medicalSpecialties } = useManagedBlocks();
  const categoriesForSelect = useMemo(
    () => [...generalCategories, ...medicalSpecialties],
    [generalCategories, medicalSpecialties]
  );
  const { resources: customResources, addResource, removeResource } = useCustomResources();
  const [form, setForm] = useState<CustomResourceInput>({
    categoryId: '',
    name: '',
    description: '',
    url: '',
    requiresAuth: false,
    note: '',
  });

  useEffect(() => {
    isWebmasterLoggedIn().then(setIsLoggedIn);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (result.success) {
      setIsLoggedIn(true);
    } else {
      setError(result.error || 'Mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.name.trim() || !form.url.trim()) {
      setError('Remplissez au moins : catégorie, nom et URL.');
      return;
    }
    setError('');
    setAddLoading(true);
    const token = getToken();
    if (!token) {
      setError('Session expirée. Reconnectez-vous.');
      setAddLoading(false);
      return;
    }
    const result = await addResource(form, token);
    setAddLoading(false);
    if (result.success) {
      setForm({
        categoryId: form.categoryId,
        name: '',
        description: '',
        url: '',
        requiresAuth: false,
        note: '',
      });
      setError('');
    } else {
      setError(result.error || 'Erreur lors de l\'ajout.');
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    await removeResource(id, token);
  };

  const getCategoryName = (id: string) => categoriesForSelect.find((c) => c.id === id)?.name ?? id;

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-slate-600">Chargement...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-teal-600" />
              <CardTitle>Espace Webmaster</CardTitle>
            </div>
            <p className="text-sm text-slate-600">
              Connectez-vous pour ajouter des ressources.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe webmaster"
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Retour au site
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            <h1 className="font-bold text-slate-900">Espace Webmaster</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Voir le site
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Formulaire d'ajout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajouter une ressource
            </CardTitle>
            <p className="text-sm text-slate-600">
              La ressource sera enregistrée de manière durable et visible pour tous les visiteurs.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir une section" />
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
              <div>
                <Label htmlFor="name">Nom de la ressource</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Nom du site"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Courte description de la ressource"
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="url">URL du site</Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="note">Note (optionnel)</Label>
                <Input
                  id="note"
                  value={form.note ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Ex: Abonnement nécessaire"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requiresAuth"
                  checked={form.requiresAuth ?? false}
                  onCheckedChange={(c) =>
                    setForm((f) => ({ ...f, requiresAuth: !!c }))
                  }
                />
                <Label htmlFor="requiresAuth" className="cursor-pointer">
                  Nécessite une connexion
                </Label>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={addLoading}>
                {addLoading ? 'Ajout...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Éditer les blocs */}
        <BlockEditor />

        {/* Liste des ressources ajoutées */}
        <Card>
          <CardHeader>
            <CardTitle>Ressources ajoutées ({customResources.length})</CardTitle>
            <p className="text-sm text-slate-600">
              Stockées durablement dans la base de données. Visibles par tous les visiteurs.
            </p>
          </CardHeader>
          <CardContent>
            {customResources.length === 0 ? (
              <p className="text-slate-500 text-sm">
                Aucune ressource personnalisée. Utilisez le formulaire ci-dessus pour en ajouter.
              </p>
            ) : (
              <ul className="space-y-3">
                {customResources.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{r.name}</p>
                      <p className="text-sm text-slate-500">{getCategoryName(r.categoryId)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-teal-600"
                        title="Ouvrir le lien"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(r.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
