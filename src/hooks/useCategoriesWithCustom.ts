import { useMemo } from 'react';
import type { Category, Resource } from '@/types/resources';
import { getCustomResources } from '@/lib/customResources';

/**
 * Fusionne les catégories statiques avec les ressources personnalisées (localStorage).
 */
export function useCategoriesWithCustom(
  generalCategories: Category[],
  medicalSpecialties: Category[]
): { generalCategories: Category[]; medicalSpecialties: Category[] } {
  return useMemo(() => {
    const custom = getCustomResources();

    const mergeCustomInto = (category: Category): Category => {
      const customInCategory = custom.filter((r) => r.categoryId === category.id);
      if (customInCategory.length === 0) return category;
      const baseResources: Resource[] = [...category.resources];
      const merged = customInCategory.reduce(
        (acc, r) => {
          acc.push({
            id: r.id,
            name: r.name,
            description: r.description,
            url: r.url,
            requiresAuth: r.requiresAuth,
            note: r.note,
          });
          return acc;
        },
        [...baseResources]
      );
      return { ...category, resources: merged };
    };

    return {
      generalCategories: generalCategories.map(mergeCustomInto),
      medicalSpecialties: medicalSpecialties.map(mergeCustomInto),
    };
  }, [generalCategories, medicalSpecialties]);
}
