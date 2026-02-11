import { useState } from 'react';
import type { Category } from '@/types/resources';
import { ResourceCard } from './ResourceCard';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp,
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
  Circle
} from 'lucide-react';
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

interface CategorySectionProps {
  category: Category;
  isExpanded?: boolean;
}

export function CategorySection({ category, isExpanded = true }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  
  const IconComponent = iconComponents[category.icon] || Circle;

  return (
    <section 
      id={category.id} 
      className="scroll-mt-24"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-100 rounded-lg">
          <IconComponent className="w-5 h-5 text-teal-700" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
        <span className="text-sm text-slate-500 ml-auto">
          {category.resources.length} ressource{category.resources.length > 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="ml-2"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {category.resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </section>
  );
}
