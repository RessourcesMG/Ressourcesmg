import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { isWebmasterLoggedIn, login, logout, getToken, getRateLimitStatus } from '@/lib/webmasterAuth';
import { useManagedBlocks } from '@/hooks/useManagedBlocks';
import { BlockEditor } from '@/components/BlockEditor';
import { ProposalManager } from '@/components/ProposalManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export function Webmaster() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState(getRateLimitStatus);
  const [addLoading, setAddLoading] = useState(false);
  const { generalCategories, medicalSpecialties, fromDb, addResource } = useManagedBlocks();
  const [form, setForm] = useState({
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
    setRateLimitStatus(getRateLimitStatus());
    setLoading(false);
    if (result.success) {
      setIsLoggedIn(true);
    } else {
      setError(result.error || 'Mot de passe incorrect.');
    }
  };

  useEffect(() => {
    if (!rateLimitStatus.locked) return;
    const interval = setInterval(() => {
      const next = getRateLimitStatus();
      setRateLimitStatus(next);
      if (!next.locked) clearInterval(interval);
    }, 30000);
    return () => clearInterval(interval);
  }, [rateLimitStatus.locked]);

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
    const result = await addResource(form);
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe webmaster"
                    className="pl-10 pr-10"
                    autoFocus
                    disabled={rateLimitStatus.locked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-0.5"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {rateLimitStatus.locked && (
                  <p className="text-sm text-amber-600 mt-1">
                    Trop de tentatives incorrectes. Réessayez dans quelques minutes.
                  </p>
                )}
                {!rateLimitStatus.locked && rateLimitStatus.remainingAttempts < 5 && rateLimitStatus.remainingAttempts > 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    {rateLimitStatus.remainingAttempts} tentative(s) restante(s).
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading || rateLimitStatus.locked}>
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
              La ressource sera ajoutée dans les blocs éditables ci-dessous et visible pour tous les visiteurs.
            </p>
          </CardHeader>
          <CardContent>
            {!fromDb ? (
              <p className="text-slate-500 text-sm">Initialisez d'abord les blocs dans la section « Éditer les blocs » pour pouvoir ajouter des ressources.</p>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Propositions des utilisateurs */}
        <ProposalManager />

        {/* Éditer les blocs */}
        <BlockEditor />
      </main>
    </div>
  );
}
