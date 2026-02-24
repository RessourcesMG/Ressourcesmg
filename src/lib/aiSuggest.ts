export interface CatalogEntry {
  categoryName: string;
  resources: Array<{ name: string; description: string; url: string }>;
}

export interface AiSuggestion {
  resourceName: string;
  resourceUrl: string;
  categoryName: string;
  reason: string;
}

export interface AiSuggestResponse {
  suggestions: AiSuggestion[];
  error?: string;
}

export async function suggestResources(
  question: string,
  catalog: CatalogEntry[]
): Promise<AiSuggestResponse> {
  const res = await fetch('/api/ai-suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question.trim(), catalog }),
  });
  const data = (await res.json()) as AiSuggestResponse;
  if (!res.ok) {
    return { suggestions: [], error: data.error || `Erreur ${res.status}` };
  }
  return data;
}
