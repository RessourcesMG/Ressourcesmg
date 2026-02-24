import { useState, useMemo, useEffect, useCallback } from 'react';
import { CompactModeProvider, useCompactMode } from '@/contexts/CompactModeContext';
import { AiSearchProvider } from '@/contexts/AiSearchContext';
import { Header } from '@/components/Header';
import type { CatalogEntry, AiSuggestion } from '@/lib/aiSuggest';
import { Hero } from '@/components/Hero';
import { CategorySection } from '@/components/CategorySection';
import { Footer } from '@/components/Footer';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { useManagedBlocksContext } from '@/contexts/ManagedBlocksContext';
import {
  getSearchTermGroups,
  getSearchTermGroupsForQuestion,
  matchesSearch,
  matchesSearchAny,
  countMatchingTermGroups,
  scoreSearchMatch,
  getDidYouMeanSuggestions,
} from '@/lib/searchSynonyms';
import { trackSearch } from '@/lib/analytics';
import { useCategoriesWithCustom } from '@/hooks/useCategoriesWithCustom';
import { useCustomResources } from '@/hooks/useCustomResources';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFavorites } from '@/contexts/FavoritesContext';
import { SearchX, Stethoscope, Globe, RefreshCw, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types/resources';
import { SchemaOrgResources } from '@/components/SchemaOrgResources';

function AppContent() {
  const { isCompact } = useCompactMode();
  const { favoriteIds } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const debouncedQuery = useDebouncedValue(searchQuery, 280);

  const { generalCategories: baseGeneralCategories, medicalSpecialties: baseSpecialties, loading: blocksLoading, error: blocksError, retry: retryBlocks } = useManagedBlocksContext();
  const { resources: customResources } = useCustomResources();
  const { generalCategories, medicalSpecialties: mergedSpecialties } = useCategoriesWithCustom(
    baseGeneralCategories,
    baseSpecialties,
    customResources
  );

  // Vocabulaire pour les suggestions "Vous vouliez dire ?"
  const searchVocabulary = useMemo(() => {
    const cats = [...generalCategories, ...mergedSpecialties];
    const names = cats.flatMap((c) => [c.name, ...c.resources.map((r) => r.name)]);
    return [...new Set(names)];
  }, [generalCategories, mergedSpecialties]);

  // Quand on commence à taper une recherche, scroller vers la section des ressources
  useEffect(() => {
    if (searchQuery.trim()) {
      const el = document.getElementById('resources-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchQuery]);

  // Scroll vers "Ressources essentielles" si l'URL contient le hash (lien en bas de page)
  useEffect(() => {
    if (window.location.hash !== '#ressources-essentielles' || searchQuery || selectedCategory) return;
    const t = setTimeout(() => {
      const el = document.getElementById('ressources-essentielles');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCategory]);

  // Calculate totals (exclure les ressources masquées)
  // Utiliser les catégories fusionnées pour inclure les ressources personnalisées
  // Note: traiter undefined/null comme non masqué (ressource visible)
  const totalResources = useMemo(() => {
    return [...generalCategories, ...mergedSpecialties].reduce(
      (acc, cat) => acc + cat.resources.filter((r) => r.isHidden !== true).length,
      0
    );
  }, [generalCategories, mergedSpecialties]);

  const specialtyCount = baseSpecialties.length;

  // Catalogue pour la recherche par IA (ressources visibles uniquement)
  const catalogForAI = useMemo((): CatalogEntry[] => {
    const cats = [...generalCategories, ...mergedSpecialties];
    return cats.map((cat) => ({
      categoryName: cat.name,
      resources: cat.resources
        .filter((r) => r.isHidden !== true)
        .map((r) => ({
          name: r.name,
          description: r.description || '',
          url: r.url,
        })),
    })).filter((cat) => cat.resources.length > 0);
  }, [generalCategories, mergedSpecialties]);

  function filterAndSortCategories(
    list: Category[],
    query: string,
    categoryOverride?: string | null
  ): Category[] {
    let result = list;
    const categoryFilter = categoryOverride !== undefined ? categoryOverride : selectedCategory;
    if (categoryFilter) {
      result = result.filter((cat) => cat.id === categoryFilter);
    }

    if (!query.trim()) return result;

    const termGroups = getSearchTermGroups(query);
    const simpleGroup = [[query.trim()]];

    result = result.map((category) => {
      const contextBase = { categoryName: category.name };
      const resources = category.resources.filter((resource) => {
        const searchableText = `${category.name} ${resource.name} ${resource.description} ${resource.note ?? ''}`;
        const matchesSimple = matchesSearch(searchableText, simpleGroup);
        const matchesSynonyms = matchesSearch(searchableText, termGroups);
        // Pas de fuzzy matching dans la recherche principale - seulement exact + synonymes pour rester précis
        return matchesSimple || matchesSynonyms;
      });

      if (resources.length === 0) return null;

      const withScore = resources.map((resource) => ({
        resource,
        score: scoreSearchMatch(
          {
            ...contextBase,
            name: resource.name,
            description: resource.description,
            note: resource.note,
          },
          termGroups
        ),
      }));
      withScore.sort((a, b) => b.score - a.score);
      return { ...category, resources: withScore.map((r) => r.resource) };
    }).filter((c): c is Category => c !== null);

    return result.filter((cat) => cat.resources.length > 0);
  }

  const filteredGeneralCategories = useMemo(
    () => filterAndSortCategories(generalCategories, debouncedQuery),
    [debouncedQuery, selectedCategory, generalCategories]
  );

  const filteredSpecialties = useMemo(
    () => filterAndSortCategories(mergedSpecialties, debouncedQuery),
    [debouncedQuery, selectedCategory, mergedSpecialties]
  );

  /** Recherche 100 % locale à partir d’une question : extrait les mots-clés (synonymes) et retourne les ressources correspondantes. Gratuit, sans API. */
  const getSuggestionsForQuestion = useCallback(
    (question: string): AiSuggestion[] => {
      const q = question.trim();
      if (!q || q.length < 2) return [];
      const termGroups = getSearchTermGroupsForQuestion(q);
      if (termGroups.length === 0) return [];
      const allCats = [...generalCategories, ...mergedSpecialties];
      const scored: Array<{ resource: (typeof allCats)[0]['resources'][0]; categoryName: string; score: number; matchCount: number }> = [];
      for (const cat of allCats) {
        for (const r of cat.resources) {
          if (r.isHidden === true) continue;
          const searchableText = `${cat.name} ${r.name} ${r.description} ${r.note ?? ''}`;
          const matchCount = countMatchingTermGroups(searchableText, termGroups);
          if (matchCount === 0) continue;
          const score = scoreSearchMatch(
            { categoryName: cat.name, name: r.name, description: r.description, note: r.note },
            termGroups
          );
          scored.push({ resource: r, categoryName: cat.name, score, matchCount });
        }
      }
      scored.sort((a, b) => b.matchCount - a.matchCount || b.score - a.score);
      const seen = new Set<string>();
      return scored
        .filter(({ resource }) => {
          if (seen.has(resource.id)) return false;
          seen.add(resource.id);
          return true;
        })
        .slice(0, 8)
        .map(({ resource, categoryName }) => ({
          resourceName: resource.name,
          resourceUrl: resource.url,
          categoryName,
          reason: `Ressource en « ${categoryName} » correspondant à votre question.`,
        }));
    },
    [generalCategories, mergedSpecialties]
  );

  // Appliquer le filtre "Mes favoris" si actif
  const applyFavoritesFilter = useCallback(
    (categoriesList: Category[]) => {
      if (!showOnlyFavorites || favoriteIds.length === 0) return categoriesList;
      return categoriesList
        .map((cat) => ({
          ...cat,
          resources: cat.resources.filter((r) => favoriteIds.includes(r.id)),
        }))
        .filter((cat) => cat.resources.length > 0);
    },
    [showOnlyFavorites, favoriteIds]
  );

  const displayGeneralCategories = useMemo(
    () => applyFavoritesFilter(filteredGeneralCategories),
    [applyFavoritesFilter, filteredGeneralCategories]
  );

  const displaySpecialties = useMemo(
    () => applyFavoritesFilter(filteredSpecialties),
    [applyFavoritesFilter, filteredSpecialties]
  );

  // Check if any results found
  const hasGeneralResults = displayGeneralCategories.length > 0;
  const hasSpecialtyResults = displaySpecialties.length > 0;
  const hasResults = hasGeneralResults || hasSpecialtyResults;

  const totalFilteredResources = [...displayGeneralCategories, ...displaySpecialties].reduce(
    (acc, cat) => acc + cat.resources.length,
    0
  );

  // Enregistrer les recherches (analytics)
  useEffect(() => {
    if (debouncedQuery.trim()) {
      trackSearch({ query: debouncedQuery.trim(), resultCount: totalFilteredResources });
    }
  }, [debouncedQuery, totalFilteredResources]);

  // Check if viewing a specialty section
  const isViewingSpecialties = !selectedCategory || mergedSpecialties.some(s => s.id === selectedCategory);
  const isViewingGeneral = !selectedCategory || generalCategories.some(s => s.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <SchemaOrgResources generalCategories={baseGeneralCategories} medicalSpecialties={baseSpecialties} />
      <a href="#resources-section" className="skip-link">
        Aller au contenu
      </a>
      <AnnouncementBanner />
      <Header
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        onGoHome={() => {
          setSearchQuery('');
          setSelectedCategory(null);
          setShowOnlyFavorites(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        showOnlyFavorites={showOnlyFavorites}
        onShowOnlyFavoritesChange={(v) => {
          setShowOnlyFavorites(v);
          if (v) setSelectedCategory(null);
        }}
        favoritesCount={favoriteIds.length}
        catalogForAI={catalogForAI}
        getSuggestionsForQuestion={getSuggestionsForQuestion}
      />
      
      <main>
        {/* Hero affiché uniquement quand il n'y a ni recherche, ni catégorie, ni filtre favoris */}
        {!searchQuery && !selectedCategory && !showOnlyFavorites && (
          <Hero 
            totalResources={totalResources} 
            totalCategories={specialtyCount}
            isLoading={blocksLoading}
          />
        )}

        <section
          id="resources-section"
          className={`scroll-mt-[8.5rem] sm:scroll-mt-[8rem] ${isCompact ? 'py-6 px-4 sm:px-6 lg:px-8' : 'py-12 px-4 sm:px-6 lg:px-8'}`}
          aria-label="Ressources"
        >
          <div className="max-w-7xl mx-auto">
            {/* Erreur chargement API */}
            {blocksError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-slate-700 font-medium mb-2">{blocksError}</p>
                <Button onClick={() => retryBlocks()} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </Button>
              </div>
            )}

            {/* Skeletons pendant le chargement */}
            {!blocksError && blocksLoading && (
              <div className="space-y-12">
                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {/* Contenu normal (résultats, catégories) */}
            {!blocksError && !blocksLoading && (
              <>
            {/* Annonce pour lecteurs d'écran */}
            {(searchQuery || selectedCategory) && (
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {totalFilteredResources} résultat{totalFilteredResources > 1 ? 's' : ''} trouvé{totalFilteredResources > 1 ? 's' : ''}
                {searchQuery && ` pour ${searchQuery}`}.
              </p>
            )}
            {/* Results info */}
            {(searchQuery || selectedCategory) && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-600">
                  {totalFilteredResources} résultat{totalFilteredResources > 1 ? 's' : ''} trouvé{totalFilteredResources > 1 ? 's' : ''}
                  {searchQuery && (
                    <span> pour &quot;<span className="font-medium text-slate-900">{searchQuery}</span>&quot;</span>
                  )}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="link"
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium h-auto p-0"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  )}
                  {favoriteIds.length > 0 && (
                    <Button
                      variant={showOnlyFavorites ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      className={`rounded-full gap-1.5 ${
                        showOnlyFavorites
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200'
                          : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                      Mes favoris ({favoriteIds.length})
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* No results */}
            {!hasResults && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <SearchX className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {showOnlyFavorites ? 'Aucune ressource en favori' : 'Aucun résultat trouvé'}
                </h3>
                <p className="text-slate-600 mb-4">
                  {showOnlyFavorites
                    ? 'Ajoutez des ressources en favori avec l\'étoile sur chaque carte.'
                    : 'Essayez avec d\'autres termes de recherche'}
                </p>
                {debouncedQuery.trim() && (() => {
                  const suggestions = getDidYouMeanSuggestions(debouncedQuery, searchVocabulary, 3);
                  return suggestions.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 mb-2">Vous vouliez peut-être dire :</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSearchQuery(s)}
                            className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setShowOnlyFavorites(false);
                  }}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                >
                  Voir toutes les ressources
                </Button>
              </div>
            )}

            {/* General Categories - Ressources globales (style teal) */}
            {isViewingGeneral && hasGeneralResults && (
              <div className={isCompact ? 'mb-8' : 'mb-16'}>
                {!selectedCategory && (
                  <div className={`flex items-center gap-4 ${isCompact ? 'mb-4' : 'mb-8'}`}>
                    <div className={isCompact ? 'p-2 bg-teal-100 rounded-lg' : 'p-3 bg-teal-100 rounded-xl'}>
                      <Globe className={isCompact ? 'w-5 h-5 text-teal-600' : 'w-6 h-6 text-teal-600'} />
                    </div>
                    <div>
                      <h2 className={isCompact ? 'text-xl font-bold text-slate-900' : 'text-2xl font-bold text-slate-900'}>Ressources globales</h2>
                      <p className="text-teal-700/80 text-sm">{displayGeneralCategories.length} catégories</p>
                    </div>
                  </div>
                )}
                
                <div className={isCompact ? 'space-y-6' : 'space-y-12'}>
                  {displayGeneralCategories.map((category: Category) => (
                    <CategorySection 
                      key={category.id} 
                      category={category}
                      isExpanded={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Medical Specialties Section (même style teal que Ressources globales) */}
            {isViewingSpecialties && hasSpecialtyResults && (
              <div className={`border-t border-slate-200 ${isCompact ? 'pt-6' : 'pt-12'}`}>
                {!selectedCategory && (
                  <div className={`flex items-center gap-4 ${isCompact ? 'mb-4' : 'mb-8'}`}>
                    <div className={isCompact ? 'p-2 bg-teal-100 rounded-lg' : 'p-3 bg-teal-100 rounded-xl'}>
                      <Stethoscope className={isCompact ? 'w-5 h-5 text-teal-600' : 'w-6 h-6 text-teal-600'} />
                    </div>
                    <div>
                      <h2 className={isCompact ? 'text-xl font-bold text-slate-900' : 'text-2xl font-bold text-slate-900'}>Ressources par spécialités médicales</h2>
                      <p className="text-teal-700/80 text-sm">{displaySpecialties.length} spécialités</p>
                    </div>
                  </div>
                )}
                
                <div className={isCompact ? 'space-y-6' : 'space-y-12'}>
                  {displaySpecialties.map((category: Category) => (
                    <CategorySection 
                      key={category.id} 
                      category={category}
                      isExpanded={true}
                    />
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </section>

        {/* Quick access section */}
        {!searchQuery && !selectedCategory && (
          <section id="ressources-essentielles" className={isCompact ? 'py-6 bg-white border-t border-slate-200' : 'py-12 bg-white border-t border-slate-200'}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`text-center ${isCompact ? 'mb-4' : 'mb-8'}`}>
                <div className={`inline-flex items-center justify-center bg-indigo-100 rounded-full mb-4 ${isCompact ? 'w-10 h-10' : 'w-12 h-12'}`}>
                  <Stethoscope className={isCompact ? 'w-5 h-5 text-indigo-600' : 'w-6 h-6 text-indigo-600'} />
                </div>
                <h2 className={isCompact ? 'text-xl font-bold text-slate-900 mb-1' : 'text-2xl font-bold text-slate-900 mb-2'}>
                  Ressources essentielles
                </h2>
                <p className="text-slate-600 text-sm">
                  Les outils les plus utilisés au quotidien
                </p>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 ${isCompact ? 'gap-2' : 'gap-4'}`}>
                {[
                  { name: 'Recomed', url: 'https://recomedicales.fr/', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { name: 'Ordotype', url: 'https://www.ordotype.fr/', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                  { name: 'Antibioclic', url: 'https://antibioclic.com/', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
                  { name: 'Omnidoc', url: 'https://omnidoc.fr/', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { name: 'Ameli Pro', url: 'https://authps-espacepro.ameli.fr/oauth2/authorize?response_type=code&scope=openid%20profile%20infosps%20email&client_id=csm-cen-prod_ameliprotransverse-connexionadmin_1_amtrx_i1_csm-cen-prod%2Fameliprotransverse-connexionadmin_1%2Famtrx_i1&state=0uLmiQtNwK3Oj_3bzE11SPlRnNY&redirect_uri=https%3A%2F%2Fespacepro.ameli.fr%2Fpage-accueil-ihm%2Fredirect_uri&nonce=BxK70DF6GATpBdoPi3MHhDQ1x9lFpxfTc6VEhIey1CI', color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
                  { name: 'HAS', url: 'https://www.has-sante.fr/', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg text-sm font-medium text-center transition-colors ${item.color} ${isCompact ? 'px-3 py-2' : 'px-4 py-3'}`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer
        categories={[...baseGeneralCategories, ...baseSpecialties].map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </div>
  );
}

function App() {
  return (
    <CompactModeProvider>
      <AiSearchProvider>
        <AppContent />
      </AiSearchProvider>
    </CompactModeProvider>
  );
}

export default App;
