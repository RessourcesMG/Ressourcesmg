import { Link } from 'react-router-dom';
import { Stethoscope, Heart, Send, Mail, Shield, CheckCircle, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import emailjs from '@emailjs/browser';
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
    website: '', // Honeypot anti-spam (caché, ne doit pas être rempli)
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveCategoryId = formData.categoryId || (categories[0]?.id ?? '');

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((f) => ({ ...f, categoryId: categories[0].id }));
    }
  }, [categories]);

  function validateForm(): string | null {
    const name = formData.name.trim();
    const url = formData.url.trim();
    if (!name) return 'Le nom du site est requis.';
    if (!url) return 'Le lien du site est requis.';
    try {
      new URL(url);
    } catch {
      return 'Veuillez entrer une URL valide (ex. https://…).';
    }
    if (!effectiveCategoryId && categories.length > 0) return 'Choisissez une catégorie.';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
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
          website: formData.website, // Honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitted(true);
        
        // Envoyer la notification email côté client (EmailJS)
        const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        const notifyEmail = import.meta.env.VITE_NOTIFICATION_EMAIL;
        
        if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey && notifyEmail) {
          try {
            await emailjs.send(
              emailjsServiceId,
              emailjsTemplateId,
              {
                to_email: notifyEmail,
                subject: `[Ressources MG] Nouvelle proposition : ${formData.name.trim()}`,
                name: formData.name.trim(),
                url: formData.url.trim(),
                description: formData.description.trim() || '(vide)',
                category: effectiveCategoryId || '(non spécifiée)',
              },
              emailjsPublicKey
            );
          } catch (emailError) {
            // Ne pas bloquer l'utilisateur si l'email échoue
            console.error('[EmailJS] Erreur lors de l\'envoi de la notification:', emailError);
          }
        }
        
        setFormData({
          name: '',
          url: '',
          description: '',
          categoryId: categories[0]?.id ?? '',
          website: '',
        });
        toast.success('Proposition envoyée', {
          description: 'Merci ! Elle sera examinée par l’équipe.',
          duration: 5000,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-8">
          {/* Infos site + contact : même poids visuel que le formulaire */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Ressources MG</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3 max-w-md">
              Outils web utiles pour la pratique en médecine générale, organisés par spécialité.
            </p>
            <p className="text-slate-500 text-sm italic mb-4 max-w-md">
              Fait de manière indépendante par une médecin généraliste. Pas de conflits d&apos;intérêt à déclarer.
            </p>
            <p className="text-slate-400 text-sm font-semibold mb-2">Me contacter</p>
            <a
              href="mailto:ressourcesmedge@gmail.com"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-teal-400 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 shrink-0" />
              ressourcesmedge@gmail.com
            </a>
          </div>

          {/* Formulaire : largeur équilibrée */}
          <div id="add-resource-form" className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/80">
              <h3 className="font-semibold text-white mb-1 text-sm">Proposer une ressource</h3>
              <p className="text-slate-400 text-xs mb-3">
                Un site utile ? Proposez-le rapidement.
              </p>
              {submitted ? (
                <div className="bg-teal-900/50 border border-teal-700 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-3" aria-hidden />
                  <p className="text-teal-300 font-semibold text-base">Merci pour votre proposition !</p>
                  <p className="text-teal-400 text-sm mt-1">Elle sera examinée par l&apos;équipe.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
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
                        <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-white min-h-10 h-10 rounded-lg text-sm">
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
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm min-h-10 h-10 rounded-lg"
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
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm min-h-10 h-10 rounded-lg"
                      required
                    />
                  </div>
                  {/* Honeypot anti-spam : champ caché, ne pas remplir */}
                  <div className="absolute -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden="true">
                    <label htmlFor="website">Ne pas remplir</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm min-h-[70px] rounded-lg resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-xs">{error}</p>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white min-h-10 h-10 rounded-lg font-medium text-sm"
                    disabled={loading}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {loading ? 'Envoi...' : 'Proposer'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar : copyright + liens + retour en haut */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {currentYear} Ressources MG.
          </p>
          <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Retour en haut de la page"
            >
              <ArrowUp className="w-3.5 h-3.5 shrink-0" />
              Haut de page
            </button>
            <p className="flex items-center gap-1">
              Fait avec <Heart className="w-4 h-4 text-red-500 fill-red-500" /> pour la médecine générale
            </p>
            <Link
              to="/webmaster"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-500 transition-colors no-underline"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              Espace webmaster
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
