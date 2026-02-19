import { useMemo } from 'react';
import type { Category } from '@/types/resources';

const BASE_URL = 'https://ressourcesmg.vercel.app';

interface SchemaOrgResourcesProps {
  generalCategories: Category[];
  medicalSpecialties: Category[];
}

/**
 * Injecte le JSON-LD ItemList pour les ressources (Schema.org).
 * Améliore le SEO en signalant la structure des listes à Google.
 */
export function SchemaOrgResources({ generalCategories, medicalSpecialties }: SchemaOrgResourcesProps) {
  const jsonLd = useMemo(() => {
    const allCategories = [...generalCategories, ...medicalSpecialties];
    const itemListElements: Array<{ '@type': string; position: number; name: string; url: string; description?: string }> = [];
    let position = 1;
    for (const cat of allCategories) {
      for (const res of cat.resources) {
        if (res.isHidden !== true) {
          itemListElements.push({
            '@type': 'ListItem',
            position: position++,
            name: res.name,
            url: res.url,
            description: res.description || undefined,
          });
        }
      }
    }
    if (itemListElements.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Ressources médicales pour médecine générale',
      description: 'Outils web utiles pour la pratique en médecine générale, organisés par spécialité',
      url: `${BASE_URL}/`,
      numberOfItems: itemListElements.length,
      itemListElement: itemListElements.slice(0, 100).map(item => ({
        '@type': 'ListItem',
        position: item.position,
        item: {
          '@type': 'WebSite' as const,
          name: item.name,
          url: item.url,
          ...(item.description && { description: item.description }),
        },
      })),
    };
  }, [generalCategories, medicalSpecialties]);

  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
