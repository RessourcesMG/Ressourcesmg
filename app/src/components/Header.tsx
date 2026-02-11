import { useState, useEffect } from 'react';
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
  Circle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { categories } from '@/types/resources';
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
  // Icônes médicales personnalisées
  ThyroidIcon,
  UterusIcon,
  ToothIcon,
  TestTubeIcon,
  PregnantWomanIcon,
};

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

export function Header({ onSearch, onCategorySelect, selectedCategory }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      onCategorySelect(null);
    } else {
      onCategorySelect(categoryId);
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2 bg-teal-600 rounded-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg hidden sm:block">Ressources MG</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher une ressource..."
                value={searchValue}
                onChange={handleSearchChange}
                className="pl-10 pr-4 w-full bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-teal-600 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900">Ressources MG</span>
              </div>
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                  Spécialités
                </p>
                {categories.map((category) => {
                  const IconComponent = iconComponents[category.icon] || Circle;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
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

        {/* Category Pills - Desktop */}
        <div className="hidden lg:flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Toutes
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
