import { Stethoscope, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  totalResources: number;
  totalCategories: number;
}

export function Hero({ totalResources, totalCategories }: HeroProps) {
  const scrollToResources = () => {
    const element = document.getElementById('resources-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAddResource = () => {
    const element = document.getElementById('add-resource-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-teal-50 via-white to-slate-50 pt-32 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
            <Stethoscope className="w-4 h-4" />
            <span>Encyclopédie des ressources web pour les médecins généralistes</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Vos ressources médicales{' '}
            <span className="text-teal-600">en un clic</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
            Un référencement complet des outils web utiles pour la pratique quotidienne en médecine générale en France. Organisé par spécialité pour une consultation rapide.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-teal-600">{totalResources}</div>
              <div className="text-sm text-slate-500">ressources</div>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-teal-600">{totalCategories}</div>
              <div className="text-sm text-slate-500">spécialités</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={scrollToResources}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 w-full sm:w-auto"
            >
              Découvrir les ressources
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              onClick={scrollToAddResource}
              size="lg"
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 w-full sm:w-auto"
            >
              Ajouter une ressource
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
