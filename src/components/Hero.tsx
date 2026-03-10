import { Stethoscope, FolderHeart, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompactMode } from '@/contexts/CompactModeContext';
import { useEffect, useRef, useCallback } from 'react';

interface HeroProps {
  totalResources: number;
  totalCategories: number;
  isLoading?: boolean;
}

export function Hero({ totalResources, totalCategories, isLoading }: HeroProps) {
  const { isCompact } = useCompactMode();
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollToElementWithOffsetAndRetries = useCallback(
    (getElement: () => HTMLElement | null, maxAttempts = 15, attemptDelayMs = 150) => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const doScroll = (attempt: number) => {
        const element = getElement();
        if (!element) {
          if (attempt < maxAttempts) {
            scrollTimeoutRef.current = setTimeout(() => doScroll(attempt + 1), attemptDelayMs);
          }
          return;
        }

        const rect = element.getBoundingClientRect();
        const hasSize = rect.width > 0 || rect.height > 0;
        if (!hasSize && attempt < maxAttempts) {
          scrollTimeoutRef.current = setTimeout(() => doScroll(attempt + 1), attemptDelayMs);
          return;
        }

        // Hauteur approximative de l'en-tête sticky (un peu plus large pour la marge de sécurité)
        const HEADER_OFFSET_PX = window.innerWidth < 640 ? 96 : 112;
        const targetTop = Math.max(0, window.scrollY + rect.top - HEADER_OFFSET_PX);
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
          top: targetTop,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        if (attempt < maxAttempts) {
          // Re-vérifier après un court délai pour compenser les décalages de layout tardifs
          scrollTimeoutRef.current = setTimeout(() => {
            const checkElement = getElement();
            if (!checkElement) return;
            const checkRect = checkElement.getBoundingClientRect();
            const desiredTop = HEADER_OFFSET_PX;
            const delta = Math.abs(checkRect.top - desiredTop);
            // Si l'élément est trop éloigné du bord haut, on réessaie
            if (delta > 16) {
              doScroll(attempt + 1);
            }
          }, attemptDelayMs);
        }
      };

      doScroll(0);
    },
    []
  );

  const scrollToAddResource = useCallback(() => {
    scrollToElementWithOffsetAndRetries(
      () => document.getElementById('add-resource-form'),
      25,
      120
    );
  }, [scrollToElementWithOffsetAndRetries]);

  const scrollToEssentielles = useCallback(() => {
    scrollToElementWithOffsetAndRetries(
      () => document.getElementById('ressources-essentielles'),
      25,
      120
    );
  }, [scrollToElementWithOffsetAndRetries]);

  return (
    <section className={`relative bg-gradient-to-br from-teal-50 via-white to-slate-50 overflow-hidden ${isCompact ? 'pt-4 pb-10' : 'pt-6 pb-16'}`}>
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
          <div className={`flex flex-col items-stretch justify-center max-w-md mx-auto ${isCompact ? 'gap-2' : 'gap-3'}`}>
            <Button 
              onClick={scrollToEssentielles}
              size={isCompact ? 'default' : 'lg'}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 w-full"
              aria-label="Aller aux ressources essentielles, les onglets pour débuter ma journée de consultation"
            >
              <FolderHeart className="w-4 h-4 mr-2 text-teal-100" />
              <span className="flex flex-col items-start leading-tight">
                <span>Ressources essentielles</span>
                <span className="text-[11px] text-teal-100/80">
                  Les onglets pour débuter ma journée de consultation
                </span>
              </span>
            </Button>
            <Button 
              onClick={scrollToAddResource}
              size={isCompact ? 'default' : 'lg'}
              variant="outline"
              className="border-teal-600 text-teal-700 hover:bg-teal-50 px-8 w-full"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Ajouter une ressource
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
