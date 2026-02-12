import { useState } from 'react';
import { iconComponents, AVAILABLE_ICONS } from '@/lib/categoryIcons';
import { Input } from '@/components/ui/input';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? AVAILABLE_ICONS.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : AVAILABLE_ICONS;

  return (
    <div className={className}>
      <Input
        placeholder="Rechercher une icône..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
      />
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
