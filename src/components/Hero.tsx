import { Stethoscope, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompactMode } from '@/contexts/CompactModeContext';
import { useEffect, useRef } from 'react';

interface HeroProps {
  totalResources: number;
  totalCategories: number;
  isLoading?: boolean;
}

export function Hero({ totalResources, totalCategories, isLoading }: HeroProps) {
  const { isCompact } = useCompactMode();
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Nettoyer le timeout au démontage
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToResources = () => {
    const element = document.getElementById('resources-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAddResource = () => {
    // Annuler tout scroll en cours
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Fonction récursive pour attendre que l'élément soit disponible
    const tryScroll = (attempts = 0) => {
      const element = document.getElementById('add-resource-form');
      if (element) {
        // Vérifier que l'élément a une taille (est vraiment rendu)
        const rect = element.getBoundingClientRect();
        const hasSize = rect.width > 0 || rect.height > 0;
        
        if (!hasSize && attempts < 15) {
          // L'élément existe mais n'est pas encore mesurable, réessayer
          scrollTimeoutRef.current = setTimeout(() => tryScroll(attempts + 1), 100);
          return;
        }

        // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
        requestAnimationFrame(() => {
          // Utiliser scrollIntoView qui est plus fiable que le calcul manuel
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          
          // Vérification après le scroll pour s'assurer que ça a fonctionné
          scrollTimeoutRef.current = setTimeout(() => {
            const newRect = element.getBoundingClientRect();
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            
            // Vérifier si l'élément est visible (avec une marge de tolérance)
            const isVisible = newRect.top >= headerHeight - 100 && newRect.top < window.innerHeight + 200;
            
            // Si l'élément n'est toujours pas visible, réessayer avec un calcul manuel
            if (!isVisible) {
              const elementTop = newRect.top + window.pageYOffset;
              const offsetPosition = Math.max(0, elementTop - headerHeight - 20);
              
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }, 500);
        });
      } else if (attempts < 40) {
        // Réessayer jusqu'à 40 fois avec un délai de 50ms (2 secondes max)
        scrollTimeoutRef.current = setTimeout(() => tryScroll(attempts + 1), 50);
      }
    };
    tryScroll();
  };

  const scrollToEssentielles = () => {
    const element = document.getElementById('ressources-essentielles');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={`relative bg-gradient-to-br from-teal-50 via-white to-slate-50 overflow-hidden ${isCompact ? 'pt-[7.5rem] pb-10' : 'pt-32 pb-16'}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 font-medium ${isCompact ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
            <Stethoscope className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            <span>Encyclopédie des ressources web pour les médecins généralistes</span>
          </div>

          {/* Title */}
          <h1 className={`font-bold text-slate-900 leading-tight ${isCompact ? 'text-2xl sm:text-3xl mb-4' : 'text-3xl sm:text-4xl lg:text-5xl mb-6'}`}>
            Vos ressources médicales
            <br />
            <span className="text-teal-600">en un clic</span>
          </h1>

          {/* Description */}
          <p className={`text-slate-600 leading-relaxed ${isCompact ? 'text-base mb-4' : 'text-lg sm:text-xl mb-8'}`}>
            Un référencement participatif des outils web utiles pour la pratique de la médecine générale en France. Organisé par spécialité pour une consultation rapide.
          </p>

          {/* Stats avec léger fade-in au chargement */}
          <div className={`flex items-center justify-center ${isCompact ? 'gap-4 mb-6' : 'gap-8 mb-10'}`}>
            <div className="text-center animate-fade-in-up">
              <div className={`font-bold text-teal-600 min-w-[2.5rem] ${isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>
                {isLoading ? (
                  <span className="inline-block w-10 h-9 bg-teal-200/60 rounded animate-pulse" aria-hidden />
                ) : (
                  totalResources
                )}
              </div>
              <div className="text-sm text-slate-500">ressources</div>
            </div>
            <div className={`w-px bg-slate-200 ${isCompact ? 'h-8' : 'h-12'} animate-fade-in-up`} style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }} />
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
              <div className={`font-bold text-teal-600 min-w-[2.5rem] ${isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>
                {isLoading ? (
                  <span className="inline-block w-10 h-9 bg-teal-200/60 rounded animate-pulse" aria-hidden />
                ) : (
                  totalCategories
                )}
              </div>
              <div className="text-sm text-slate-500">spécialités</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center ${isCompact ? 'gap-2' : 'gap-4'}`}>
            <Button 
              onClick={scrollToResources}
              size={isCompact ? 'default' : 'lg'}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 w-full sm:w-auto"
            >
              Découvrir les ressources
              <ArrowDown className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              onClick={scrollToAddResource}
              size={isCompact ? 'default' : 'lg'}
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 w-full sm:w-auto"
            >
              Ajouter une ressource
            </Button>
          </div>

          {/* Lien secondaire visible vers les ressources essentielles */}
          <Button
            type="button"
            variant="ghost"
            size={isCompact ? 'sm' : 'default'}
            onClick={scrollToEssentielles}
            className={`mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 ${isCompact ? 'text-xs' : 'text-sm'}`}
            aria-label="Aller aux ressources essentielles"
          >
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Ressources essentielles</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
