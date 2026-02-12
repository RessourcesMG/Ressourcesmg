import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategorySection } from '@/components/CategorySection';
import { Footer } from '@/components/Footer';
import { categories, medicalSpecialties } from '@/types/resources';
import { getSearchTermGroups, matchesSearch } from '@/lib/searchSynonyms';
import { SearchX, Stethoscope, Globe } from 'lucide-react';

// General categories (first 3: diagnostic, IA, other)
const generalCategories = categories.slice(0, 3);

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate totals
  const totalResources = useMemo(() => {
    return categories.reduce((acc, cat) => acc + cat.resources.length, 0);
  }, []);

  // Number of medical specialties (25)
  const specialtyCount = medicalSpecialties.length;

  // Filter categories based on search and selection
  const filteredGeneralCategories = useMemo(() => {
    let result = generalCategories;

    // Filter by selected category
    if (selectedCategory) {
      result = result.filter(cat => cat.id === selectedCategory);
    }

    // Filter by search query (with synonym support)
    if (searchQuery.trim()) {
      const termGroups = getSearchTermGroups(searchQuery);
      const simpleGroup = [[searchQuery]];
      result = result.map(category => ({
        ...category,
        resources: category.resources.filter(resource => {
          const searchableText = `${resource.name} ${resource.description}`;
          // Match if: original query (complet) OU via synonymes
          const matchesSimple = matchesSearch(searchableText, simpleGroup);
          const matchesSynonyms = matchesSearch(searchableText, termGroups);
          return matchesSimple || matchesSynonyms;
        })
      })).filter(category => category.resources.length > 0);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const filteredSpecialties = useMemo(() => {
    let result = medicalSpecialties;

    // Filter by selected category
    if (selectedCategory) {
      result = result.filter(cat => cat.id === selectedCategory);
    }

    // Filter by search query (with synonym support)
    if (searchQuery.trim()) {
      const termGroups = getSearchTermGroups(searchQuery);
      const simpleGroup = [[searchQuery]];
      result = result.map(category => ({
        ...category,
        resources: category.resources.filter(resource => {
          const searchableText = `${resource.name} ${resource.description}`;
          // Match if: original query (complet) OU via synonymes
          const matchesSimple = matchesSearch(searchableText, simpleGroup);
          const matchesSynonyms = matchesSearch(searchableText, termGroups);
          return matchesSimple || matchesSynonyms;
        })
      })).filter(category => category.resources.length > 0);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  // Check if any results found
  const hasGeneralResults = filteredGeneralCategories.length > 0;
  const hasSpecialtyResults = filteredSpecialties.length > 0;
  const hasResults = hasGeneralResults || hasSpecialtyResults;
  
  const totalFilteredResources = [...filteredGeneralCategories, ...filteredSpecialties].reduce(
    (acc, cat) => acc + cat.resources.length, 
    0
  );

  // Check if viewing a specialty section
  const isViewingSpecialties = !selectedCategory || medicalSpecialties.some(s => s.id === selectedCategory);
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
        <Hero 
          totalResources={totalResources} 
          totalCategories={specialtyCount} 
        />

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
                  { name: 'Medicalcul', url: 'http://medicalcul.free.fr/', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { name: 'Ameli Pro', url: 'https://annuairesante.ameli.fr/', color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
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
