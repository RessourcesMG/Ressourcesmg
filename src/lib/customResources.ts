import type { Resource } from '@/types/resources';

const STORAGE_KEY = 'ressourcesmg_custom_resources';

export interface CustomResourceInput {
  categoryId: string;
  name: string;
  description: string;
  url: string;
  requiresAuth?: boolean;
  note?: string;
}

export interface CustomResource extends Resource, CustomResourceInput {
  id: string;
}

function loadCustomResources(): CustomResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCustomResources(items: CustomResource[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCustomResources(): CustomResource[] {
  return loadCustomResources();
}

export function addCustomResource(input: CustomResourceInput): CustomResource {
  const items = loadCustomResources();
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const resource: CustomResource = {
    id,
    ...input,
  };
  items.push(resource);
  saveCustomResources(items);
  return resource;
}

export function removeCustomResource(id: string): void {
  const items = loadCustomResources().filter((r) => r.id !== id);
  saveCustomResources(items);
}
