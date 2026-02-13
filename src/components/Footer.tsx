import { Link } from 'react-router-dom';
import { Stethoscope, Heart, ExternalLink, Send, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({ name: '', url: '', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({ name: '', url: '', description: '' });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
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

          {/* Contact Form */}
          <div>
            <h3 className="font-semibold text-white mb-4">Proposer une ressource</h3>
            {submitted ? (
              <div className="bg-teal-900/50 border border-teal-700 rounded-lg p-4 text-center">
                <p className="text-teal-300 text-sm">Merci pour votre proposition !</p>
                <p className="text-teal-400 text-xs mt-1">Elle sera examinée par l&apos;équipe.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Nom du site"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm"
                  required
                />
                <Input
                  type="url"
                  placeholder="Lien du site (https://...)"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm"
                  required
                />
                <Textarea
                  placeholder="Description brève..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm min-h-[80px]"
                />
                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <Button 
                  type="submit"
                  size="sm"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Envoi...' : 'Proposer'}
                </Button>
              </form>
            )}
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.cmg.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                >
                  Collège de Médecine Générale
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.has-sante.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                >
                  HAS
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://recomedicales.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                >
                  Recomedicales
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2 border-t border-slate-700 mt-2">
                <a 
                  href="mailto:ressourcesmedge@gmail.com"
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-1 text-slate-400"
                >
                  <Mail className="w-3 h-3" />
                  ressourcesmedge@gmail.com
                </a>
              </li>
              <li>
                <Link 
                  to="/webmaster"
                  className="hover:text-teal-400 transition-colors inline-flex items-center gap-1 text-slate-500 text-xs"
                >
                  <Shield className="w-3 h-3" />
                  Webmaster
                </Link>
              </li>
            </ul>
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
