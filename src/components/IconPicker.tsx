import { useState } from 'react';
import { iconComponents, AVAILABLE_ICONS, MEDICAL_ICONS } from '@/lib/categoryIcons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [medicalOnly, setMedicalOnly] = useState(false);

  const baseList = medicalOnly
    ? MEDICAL_ICONS
    : [...MEDICAL_ICONS, ...AVAILABLE_ICONS.filter((n) => !MEDICAL_ICONS.includes(n))];
  const filtered = search.trim()
    ? baseList.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : baseList;

  return (
    <div className={className}>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Rechercher (ex: heart, pill, medical...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant={medicalOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMedicalOnly(!medicalOnly)}
          title="Afficher uniquement les icônes médicales"
        >
          Médical
        </Button>
      </div>
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-2 border rounded-md bg-slate-50">
        {filtered.map((name) => {
          const Icon = iconComponents[name];
          if (!Icon) return null;
          const isSelected = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`p-2 rounded transition-colors ${
                isSelected
                  ? 'bg-teal-100 ring-2 ring-teal-600'
                  : 'hover:bg-slate-200'
              }`}
              title={name}
            >
              <Icon className="w-5 h-5 mx-auto" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
