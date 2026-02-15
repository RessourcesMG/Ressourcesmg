import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Menu,
  Stethoscope,
  Wind,
  Heart,
  Smile,
  ScanFace,
  Activity,
  User,
  Baby,
  Droplet,
  Bug,
  Briefcase,
  Accessibility,
  Brain,
  Apple,
  Ribbon,
  Eye,
  Ear,
  Bone,
  Pill,
  BrainCircuit,
  Scan,
  Hand,
  FileText,
  HeartHandshake,
  Sparkles,
  MoreHorizontal,
  Circle,
  BriefcaseMedical,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { categories } from '@/types/resources';
import { useCompactMode } from '@/contexts/CompactModeContext';
import { ThyroidIcon, UterusIcon, ToothIcon, TestTubeIcon, PregnantWomanIcon } from './icons/MedicalIcons';

// Icon mapping for categories
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Wind,
  Heart,
  Smile,
  ScanFace,
  Activity,
  User,
  Baby,
  Droplet,
  Bug,
  Search,
  Briefcase,
  Accessibility,
  Brain,
  Apple,
  Ribbon,
  Eye,
  Ear,
  Bone,
  Pill,
  BrainCircuit,
  Scan,
  Hand,
  FileText,
  HeartHandshake,
  Sparkles,
  MoreHorizontal,
  Circle,
  BriefcaseMedical,
  // Icônes médicales personnalisées
  ThyroidIcon,
  UterusIcon,
  ToothIcon,
  TestTubeIcon,
  PregnantWomanIcon,
};

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
  onGoHome?: () => void;
  showOnlyFavorites?: boolean;
  onShowOnlyFavoritesChange?: (value: boolean) => void;
  favoritesCount?: number;
}

export function Header({
  searchQuery,
  onSearch,
  onCategorySelect,
  selectedCategory,
  onGoHome,
  showOnlyFavorites = false,
  onShowOnlyFavoritesChange,
  favoritesCount = 0,
}: HeaderProps) {
  const { isCompact, setCompact } = useCompactMode();
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const updateScrollArrows = useCallback(() => {
    const el = categoriesScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = categoriesScrollRef.current;
    if (!el) return;
    updateScrollArrows();
    const ro = new ResizeObserver(updateScrollArrows);
    ro.observe(el);
    el.addEventListener('scroll', updateScrollArrows);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateScrollArrows);
    };
  }, [updateScrollArrows]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  }, [onSearch]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      onCategorySelect(null);
    } else {
      onCategorySelect(categoryId);
      // Attendre le re-render (ex. disparition du Hero) avant de scroller, sinon la vue finit sur le footer
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = document.getElementById(categoryId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200' 
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo : retour accueil et réinitialisation recherche / filtres */}
          <Link
            to="/"
            onClick={onGoHome}
            className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
            aria-label="Ressources MG – Retour à l'accueil"
          >
            <div className="p-2 bg-teal-600 rounded-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg hidden sm:block">Ressources MG</span>
          </Link>

          {/* Search Bar + termes associés */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="search"
                autoComplete="off"
                placeholder="Rechercher (ex. rein, pédiatrie, ordonnance…)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 w-full bg-slate-50 border-slate-200 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 focus-visible:border-teal-400"
                aria-label="Rechercher une ressource médicale"
              />
            </div>
          </div>

          {/* Toggle vue compacte - Mobile : pill "Liste" / "Cartes" pour bien distinguer du menu */}
          <button
            type="button"
            onClick={() => setCompact(!isCompact)}
            className={`lg:hidden shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-full border-2 touch-manipulation transition-colors ${
              isCompact
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
            aria-label={isCompact ? 'Revenir à la vue cartes' : 'Passer en vue liste'}
          >
            {isCompact ? (
              <>
                <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden />
                <span className="text-xs font-semibold">Cartes</span>
              </>
            ) : (
              <>
                <List className="w-4 h-4 shrink-0" aria-hidden />
                <span className="text-xs font-semibold">Liste</span>
              </>
            )}
          </button>

          {/* Toggle vue compacte - Desktop : discret, proportionné à la barre de recherche */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`hidden lg:flex items-center gap-2 shrink-0 pl-2.5 pr-1.5 py-1 rounded-full border transition-colors cursor-pointer h-9 ${
                    isCompact
                      ? 'bg-teal-50 border-teal-300 text-teal-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                  onClick={() => setCompact(!isCompact)}
                  onKeyDown={(e) => e.key === 'Enter' && setCompact(!isCompact)}
                  role="button"
                  tabIndex={0}
                  aria-label="Vue compacte : réduire la taille des blocs"
                >
                  <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="text-xs font-medium whitespace-nowrap">Compact</span>
                  <Switch
                    checked={isCompact}
                    onCheckedChange={setCompact}
                    aria-label="Passer en vue compacte"
                    className="data-[state=checked]:bg-teal-600 scale-90 origin-center"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Réduire la taille des blocs pour parcourir plus vite
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <Link to="/" onClick={onGoHome} className="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
                <div className="p-2 bg-teal-600 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900">Ressources MG</span>
              </Link>
              {/* Vue compacte - mobile : bien visible (fond teal quand actif) */}
              <div
                className={`flex items-center justify-between gap-3 py-3 px-4 rounded-xl border-2 mb-4 min-h-[48px] transition-colors ${
                  isCompact ? 'bg-teal-50 border-teal-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-sm font-semibold text-slate-800">Vue compacte</span>
                <Switch
                  checked={isCompact}
                  onCheckedChange={setCompact}
                  aria-label="Passer en vue compacte"
                  className="data-[state=checked]:bg-teal-600 scale-110 touch-manipulation"
                />
              </div>
              {favoritesCount > 0 && onShowOnlyFavoritesChange && (
                <button
                  type="button"
                  onClick={() => onShowOnlyFavoritesChange(!showOnlyFavorites)}
                  className={`w-full flex items-center justify-between gap-3 py-3 px-4 rounded-xl border-2 mb-6 min-h-[48px] transition-colors ${
                    showOnlyFavorites ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-800 inline-flex items-center gap-2">
                    <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
                    Favoris ({favoritesCount})
                  </span>
                </button>
              )}
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                  Spécialités
                </p>
                {categories.map((category) => {
                  const IconComponent = iconComponents[category.icon] || Circle;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleCategoryClick(category.id);
                        showOnlyFavorites && onShowOnlyFavoritesChange?.(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id && !showOnlyFavorites
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-xs text-slate-400">{category.resources.length}</span>
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Pills - Desktop avec indicateurs de scroll */}
        <div className="hidden lg:flex items-center pb-3 gap-1">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => {
                categoriesScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              className="shrink-0 p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors shadow-sm self-center"
              aria-label="Défiler les catégories vers la gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="relative flex-1 min-w-0">
            {canScrollLeft && (
              <div className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r ${isScrolled ? 'from-white/95' : 'from-white'} to-transparent pointer-events-none z-10 rounded-l`} aria-hidden />
            )}
            {canScrollRight && (
              <div className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l ${isScrolled ? 'from-white/95' : 'from-white'} to-transparent pointer-events-none z-10 rounded-r`} aria-hidden />
            )}
            <div
              ref={categoriesScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 py-1 relative"
            >
            <button
              onClick={() => {
                onCategorySelect(null);
                onShowOnlyFavoritesChange?.(false);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === null && !showOnlyFavorites
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toutes
            </button>
            {favoritesCount > 0 && onShowOnlyFavoritesChange && (
              <button
                onClick={() => onShowOnlyFavoritesChange(!showOnlyFavorites)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 inline-flex items-center gap-1.5 ${
                  showOnlyFavorites
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
                Favoris ({favoritesCount})
              </button>
            )}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryClick(category.id);
                  showOnlyFavorites && onShowOnlyFavoritesChange?.(false);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === category.id && !showOnlyFavorites
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.name}
              </button>
            ))}
            </div>
          </div>
          {canScrollRight && (
            <button
              type="button"
              onClick={() => {
                categoriesScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
              }}
              className="shrink-0 p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors shadow-sm self-center"
              aria-label="Défiler les catégories vers la droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
