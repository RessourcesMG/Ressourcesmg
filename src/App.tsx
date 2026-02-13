import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategorySection } from '@/components/CategorySection';
import { Footer } from '@/components/Footer';
import { useManagedBlocks } from '@/hooks/useManagedBlocks';
import {
  getSearchTermGroups,
  matchesSearch,
  scoreSearchMatch,
  getDidYouMeanSuggestions,
} from '@/lib/searchSynonyms';
import { useCategoriesWithCustom } from '@/hooks/useCategoriesWithCustom';
import { useCustomResources } from '@/hooks/useCustomResources';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SearchX, Stethoscope, Globe } from 'lucide-react';
import type { Category } from '@/types/resources';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 280);

  const { generalCategories: baseGeneralCategories, medicalSpecialties: baseSpecialties } = useManagedBlocks();
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

  // Calculate totals
  const totalResources = useMemo(() => {
    return [...baseGeneralCategories, ...baseSpecialties].reduce(
      (acc, cat) => acc + cat.resources.length,
      0
    );
  }, [baseGeneralCategories, baseSpecialties]);

  const specialtyCount = baseSpecialties.length;

  function filterAndSortCategories(
    list: Category[],
    query: string
  ): Category[] {
    let result = list;

    if (selectedCategory) {
      result = result.filter((cat) => cat.id === selectedCategory);
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

  // Check if any results found
  const hasGeneralResults = filteredGeneralCategories.length > 0;
  const hasSpecialtyResults = filteredSpecialties.length > 0;
  const hasResults = hasGeneralResults || hasSpecialtyResults;
  
  const totalFilteredResources = [...filteredGeneralCategories, ...filteredSpecialties].reduce(
    (acc, cat) => acc + cat.resources.length, 
    0
  );

  // Check if viewing a specialty section
  const isViewingSpecialties = !selectedCategory || mergedSpecialties.some(s => s.id === selectedCategory);
  const isViewingGeneral = !selectedCategory || generalCategories.some(s => s.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        searchQuery={searchQuery}
        onSearch={setSearchQuery} 
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <main>
        {/* Hero affiché uniquement quand il n'y a ni recherche ni catégorie sélectionnée */}
        {!searchQuery && !selectedCategory && (
          <Hero 
            totalResources={totalResources} 
            totalCategories={specialtyCount} 
          />
        )}

        <section id="resources-section" className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Results info */}
            {(searchQuery || selectedCategory) && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-600">
                  {totalFilteredResources} résultat{totalFilteredResources > 1 ? 's' : ''} trouvé
                  {totalFilteredResources > 1 ? 's' : ''}
                  {searchQuery && (
                    <span> pour "<span className="font-medium text-slate-900">{searchQuery}</span>"</span>
                  )}
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* No results */}
            {!hasResults && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <SearchX className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-slate-600 mb-4">
                  Essayez avec d'autres termes de recherche
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
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Voir toutes les ressources
                </button>
              </div>
            )}

            {/* General Categories - Ressources globales */}
            {isViewingGeneral && hasGeneralResults && (
              <div className="mb-16">
                {/* Big Section Header */}
                {!selectedCategory && (
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-teal-100 rounded-xl">
                      <Globe className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Ressources globales</h2>
                      <p className="text-slate-600">{filteredGeneralCategories.length} catégories</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-12">
                  {filteredGeneralCategories.map((category) => (
                    <CategorySection 
                      key={category.id} 
                      category={category}
                      isExpanded={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Medical Specialties Section */}
            {isViewingSpecialties && hasSpecialtyResults && (
              <div className="border-t border-slate-200 pt-12">
                {/* Big Section Header */}
                {!selectedCategory && (
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-teal-100 rounded-xl">
                      <Stethoscope className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Ressources par spécialités médicales</h2>
                      <p className="text-slate-600">{filteredSpecialties.length} spécialités</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-12">
                  {filteredSpecialties.map((category) => (
                    <CategorySection 
                      key={category.id} 
                      category={category}
                      isExpanded={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick access section */}
        {!searchQuery && !selectedCategory && (
          <section className="py-12 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4">
                  <Stethoscope className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Ressources essentielles
                </h2>
                <p className="text-slate-600">
                  Les outils les plus utilisés au quotidien
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                    className={`px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors ${item.color}`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
