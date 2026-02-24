import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface CatalogEntry {
  categoryName: string;
  resources: Array< { name: string; description: string; url: string } >;
}

export interface AiSuggestBody {
  question: string;
  catalog: CatalogEntry[];
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

function buildCatalogText(catalog: CatalogEntry[]): string {
  return catalog
    .map((cat) => {
      const resources = cat.resources
        .map((r) => `- ${r.name}: ${r.description || '(sans description)'} (${r.url})`)
        .join('\n');
      return `[${cat.categoryName}]\n${resources}`;
    })
    .join('\n\n');
}

async function callOpenAI(catalogText: string, question: string): Promise<AiSuggestion[]> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY non configurée');

  const systemPrompt = `Tu es un assistant pour des médecins généralistes. On te donne un catalogue de sites web médicaux (nom, courte description, URL) organisés par catégorie. Ta tâche : pour une question clinique posée par l'utilisateur, recommander les sites du catalogue qui peuvent y répondre.

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, de la forme :
{"suggestions":[{"resourceName":"Nom du site","resourceUrl":"https://...","categoryName":"Nom de la catégorie","reason":"Une phrase courte expliquant pourquoi ce site est pertinent"}]}

Règles :
- Ne recommande que des sites qui sont dans le catalogue fourni. Utilise exactement le nom et l'URL du catalogue.
- Maximum 5 suggestions, par ordre de pertinence.
- reason doit être en français, une phrase courte.
- Si aucun site ne correspond vraiment, retourne {"suggestions":[]}.`;

  const userMessage = `Catalogue des ressources disponibles :\n\n${catalogText}\n\n---\nQuestion clinique de l'utilisateur :\n${question}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Réponse OpenAI vide');

  const parsed = JSON.parse(content) as { suggestions?: AiSuggestion[] };
  const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  return suggestions.filter(
    (s) => s && typeof s.resourceName === 'string' && typeof s.resourceUrl === 'string'
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  if (!OPENAI_API_KEY) {
    return res.status(503).json({
      suggestions: [],
      error: 'Recherche par IA non disponible (configuration manquante).',
    } as AiSuggestResponse);
  }

  const body = req.body as AiSuggestBody | undefined;
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const catalog = Array.isArray(body?.catalog) ? body.catalog : [];

  if (!question || question.length < 5) {
    return res.status(400).json({
      suggestions: [],
      error: 'Veuillez poser une question plus précise (au moins quelques mots).',
    } as AiSuggestResponse);
  }

  if (catalog.length === 0) {
    return res.status(400).json({
      suggestions: [],
      error: 'Catalogue des ressources indisponible.',
    } as AiSuggestResponse);
  }

  try {
    const catalogText = buildCatalogText(catalog);
    const suggestions = await callOpenAI(catalogText, question);
    return res.status(200).json({ suggestions } as AiSuggestResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la suggestion';
    return res.status(500).json({
      suggestions: [],
      error: message,
    } as AiSuggestResponse);
  }
}
