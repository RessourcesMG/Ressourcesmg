import { Link } from 'react-router-dom';
import { Stethoscope, Heart, Send, Mail, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type FooterCategory = { id: string; name: string };

type FooterProps = {
  categories?: FooterCategory[];
};

export function Footer({ categories = [] }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    categoryId: categories[0]?.id ?? '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveCategoryId = formData.categoryId || categories[0]?.id ?? '';

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((f) => ({ ...f, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          url: formData.url.trim(),
          description: formData.description.trim(),
          ...(effectiveCategoryId ? { categoryId: effectiveCategoryId } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          url: '',
          description: '',
          categoryId: categories[0]?.id ?? '',
        });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setError(data?.error || 'Une erreur est survenue. Réessayez.');
      }
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Ressources MG</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Un référencement complet des outils web utiles pour la pratique quotidienne en médecine générale en France. Organisé par spécialité pour une consultation rapide.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed italic">
              Fait de manière indépendante par une médecin généraliste. Pas de conflits d'intérêt à déclarer.
            </p>
          </div>

          {/* Formulaire : plus large, plus accueillant */}
          <div id="add-resource-form" className="lg:col-span-6">
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/80">
              <h3 className="font-semibold text-white mb-1">Proposer une ressource</h3>
              <p className="text-slate-400 text-sm mb-4">
                Un site qui vous aide au quotidien ? Proposez-le en quelques secondes.
              </p>
              {submitted ? (
                <div className="bg-teal-900/50 border border-teal-700 rounded-xl p-5 text-center">
                  <p className="text-teal-300 text-sm">Merci pour votre proposition !</p>
                  <p className="text-teal-400 text-xs mt-1">Elle sera examinée par l&apos;équipe.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {categories.length > 0 && (
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-1.5">
                        Catégorie
                      </label>
                      <Select
                        value={effectiveCategoryId}
                        onValueChange={(v) => setFormData((f) => ({ ...f, categoryId: v }))}
                        required
                      >
                        <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-white h-10 rounded-xl">
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="text-slate-900">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">
                      Nom du site
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex. Recomed, Ordotype…"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm h-10 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">
                      Lien du site
                    </label>
                    <Input
                      type="url"
                      placeholder="https://…"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm h-10 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">
                      Description (optionnel)
                    </label>
                    <Textarea
                      placeholder="En quelques mots, à quoi sert ce site ?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm min-h-[88px] rounded-xl resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-xs">{error}</p>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white h-10 rounded-xl font-medium"
                    disabled={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Envoi...' : 'Proposer'}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact : mail + webmaster à droite */}
          <div className="lg:col-span-2 flex flex-col justify-center gap-4">
            <a
              href="mailto:ressourcesmedge@gmail.com"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span className="text-sm">ressourcesmedge@gmail.com</span>
            </a>
            <Link
              to="/webmaster"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors text-sm"
            >
              <Shield className="w-4 h-4 shrink-0" />
              Espace webmaster
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {currentYear} Ressources MG.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Fait avec <Heart className="w-4 h-4 text-red-500 fill-red-500" /> pour la médecine générale
          </p>
        </div>
      </div>
    </footer>
  );
}
