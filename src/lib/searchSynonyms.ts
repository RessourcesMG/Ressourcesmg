/**
 * Mots vides à ignorer lors de la recherche (articles, prépositions, conjonctions, etc.)
 * Seuls les mots clés significatifs sont pris en compte.
 */
const STOP_WORDS = new Set([
  // Articles
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', "d'", 'ce', 'cet', 'cette', 'ces',
  // Prépositions
  'à', 'au', 'aux', 'en', 'dans', 'sur', 'pour', 'avec', 'sans', 'sous', 'par', 'entre', 'vers', 'chez', 'avant', 'après', 'pendant', 'depuis',
  // Conjonctions
  'et', 'ou', 'mais', 'donc', 'ni', 'que', 'qui', 'quoi', 'si', 'comme', 'car', 'lorsque', 'quand', 'alors',
  // Pronoms et déterminants courants
  'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'cela', 'ça',
  // Verbes auxiliaires et modaux
  'est', 'sont', 'être', 'avoir', 'fait', 'faire', 'a', 'ont', 'sera', 'seraient', 'été',
  // Adverbes et mots courants
  'ne', 'pas', 'plus', 'très', 'trop', 'aussi', 'bien', 'mal', 'peu', 'beaucoup', 'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'même', 'mêmes', 'seulement', 'encore', 'déjà', 'toujours', 'souvent', 'jamais',
  // Mots grammaticaux
  'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'y', 'lui', 'eux',
]);

/** Version normalisée (sans accents) pour les comparaisons */
const STOP_WORDS_NORMALIZED = new Set(
  [...STOP_WORDS].map((w) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
);

/**
 * Dictionnaire de synonymes pour la recherche de ressources médicales.
 * Les termes sont en minuscules pour une recherche insensible à la casse.
 * Chaque clé possède un tableau de termes équivalents (incluant la clé).
 */
const SYNONYMS: Record<string, string[]> = {
  // Prescription et ordonnances
  ordonnance: ['ordonnance', 'prescription', 'prescrire'],
  prescription: ['ordonnance', 'prescription', 'prescrire'],
  ordotype: ['ordonnance', 'prescription', 'ordotype'],
  recomed: ['recommandation', 'recomed', 'algorithme', 'traitement'],

  // Antibiotiques et infectiologie
  antibiotique: ['antibiotique', 'antibiotiques', 'antibio', 'atb', 'infectiologie'],
  antibio: ['antibiotique', 'antibiotiques', 'antibio'],
  infectiologie: ['antibiotique', 'infection', 'infectiologie', 'microbiologie'],
  vaccination: ['vaccination', 'vaccin', 'vaccins'],
  vaccin: ['vaccination', 'vaccin', 'vaccins'],

  // Imagerie et radiologie
  imagerie: ['imagerie', 'radiologie', 'radio', 'scanner', 'irm', 'échographie', 'écho'],
  radiologie: ['imagerie', 'radiologie', 'radio', 'scanner'],
  radio: ['imagerie', 'radiologie', 'radio', 'radiopédiatrique'],
  scanner: ['imagerie', 'scanner', 'tomodensitométrie'],
  irm: ['imagerie', 'irm', 'résonance', 'magnétique'],
  échographie: ['imagerie', 'échographie', 'écho', 'échographique'],
  écho: ['échographie', 'écho'],

  // Biologie et analyses
  biologie: ['biologie', 'bio', 'analyse', 'analyses', 'labo', 'laboratoire'],
  bio: ['biologie', 'bio', 'analyse'],
  analyse: ['biologie', 'analyse', 'analyses'],
  hémogramme: ['hémogramme', 'numération', 'nfs', 'biologie'],

  // Intelligence artificielle
  ia: ['ia', 'intelligence artificielle', 'artificielle'],
  intelligence: ['ia', 'intelligence artificielle'],
  artificielle: ['ia', 'intelligence artificielle'],

  // Spécialités - Allergologie
  allergie: ['allergie', 'allergologie', 'allergologique', 'éviction'],
  allergologie: ['allergie', 'allergologie', 'allergologique'],

  // Spécialités - Cardiologie
  cardiologie: ['cardiologie', 'cœur', 'cardiaque', 'cardiovasculaire'],
  cœur: ['cardiologie', 'cœur', 'cardiaque'],
  cardiaque: ['cardiologie', 'cardiaque', 'cardiovasculaire'],
  ecg: ['ecg', 'électrocardiogramme', 'cardiologie'],

  // Spécialités - Dermatologie
  dermatologie: ['dermatologie', 'dermato', 'peau', 'cutané'],

  // Spécialités - Endocrinologie / Diabète
  diabète: ['diabète', 'diabétique', 'glycémie', 'endocrinologie'],
  glycémie: ['diabète', 'glycémie', 'endocrinologie'],
  thyroïde: ['thyroïde', 'tsh', 'nodule', 'endocrinologie'],

  // Spécialités - Pédiatrie
  pédiatrie: ['pédiatrie', 'pédiatrique', 'enfant', 'enfants', 'bébé'],
  enfant: ['pédiatrie', 'enfant', 'enfants', 'pédiatrique'],
  pédiatrique: ['pédiatrie', 'pédiatrique', 'enfant'],

  // Spécialités - Gynécologie
  gynécologie: ['gynécologie', 'gynéco', 'grossesse', 'obstétrique'],
  grossesse: ['grossesse', 'gestation', 'gynécologie', 'prénatal'],
  allaitement: ['allaitement', 'lactation', 'sein', 'nourrisson'],

  // Spécialités - Psychiatrie
  psychiatrie: ['psychiatrie', 'psy', 'psychologique', 'mental'],
  psychiatrique: ['psychiatrie', 'psychiatrique', 'psychotrope'],
  antidépresseur: ['antidépresseur', 'antidépresseurs', 'dépression', 'psychiatrie'],
  addiction: ['addiction', 'addictologie', 'dépendance'],

  // Spécialités - Néphrologie / Rein (racine → formes dérivées)
  rein: ['rein', 'reins', 'rénal', 'rénale', 'rénaux', 'néphrologie', 'néphro', 'néphrologique', 'insuffisance rénale', 'irc'],
  rénal: ['rein', 'reins', 'rénal', 'rénale', 'rénaux', 'néphrologie', 'néphro'],
  néphrologie: ['rein', 'rénal', 'néphrologie', 'néphro', 'néphrologique'],
  néphro: ['rein', 'rénal', 'néphrologie', 'néphro'],

  // Autres racines anatomiques / cliniques (précis, pas trop large)
  foie: ['foie', 'hépatique', 'hépatologie', 'hépatite'],
  hépatique: ['foie', 'hépatique', 'hépatologie', 'hépatite'],
  poumon: ['poumon', 'poumons', 'pulmonaire', 'pneumologie', 'respiratoire'],
  pulmonaire: ['poumon', 'pulmonaire', 'pneumologie', 'respiratoire'],
  pneumologie: ['poumon', 'pulmonaire', 'pneumologie', 'respiratoire'],
  sang: ['sang', 'sanguin', 'sanguine', 'hématologie', 'nfs', 'hémogramme'],
  sanguin: ['sang', 'sanguin', 'hématologie', 'hémogramme'],
  os: ['os', 'osseux', 'osseuse', 'orthopédie', 'squelette', 'fracture'],
  osseux: ['os', 'osseux', 'orthopédie', 'squelette'],
  muscle: ['muscle', 'musculaire', 'myopathie', 'rhumatologie'],
  musculaire: ['muscle', 'musculaire', 'myopathie'],
  ventre: ['ventre', 'abdominal', 'abdomen', 'digestif', 'gastro'],
  abdominal: ['ventre', 'abdominal', 'abdomen', 'digestif'],
  digestif: ['ventre', 'digestif', 'digestion', 'gastro', 'gastro-entérologie'],
  gastro: ['digestif', 'gastro', 'gastro-entérologie', 'estomac', 'intestin'],
  intestin: ['intestin', 'intestinal', 'digestif', 'gastro', 'colon'],
  gorge: ['gorge', 'pharynx', 'orl', 'angine', 'larynx'],
  vessie: ['vessie', 'vésical', 'urologie', 'uro', 'urinaire'],
  urinaire: ['vessie', 'urinaire', 'urologie', 'uro', 'rénal'],
  uro: ['vessie', 'urologie', 'uro', 'urinaire'],
  urologie: ['vessie', 'urologie', 'uro', 'urinaire', 'rénal'],
  thyroide: ['thyroïde', 'thyroidien', 'tsh', 'nodule', 'endocrinologie'],
  tension: ['tension', 'hta', 'hypertension', 'cardiovasculaire', 'cardiaque'],
  hta: ['tension', 'hta', 'hypertension', 'cardiovasculaire'],
  hypertension: ['tension', 'hta', 'hypertension', 'cardiovasculaire'],
  douleur: ['douleur', 'douleurs', 'antalgique', 'douleurs', 'algie'],
  antalgique: ['douleur', 'antalgique', 'antidouleur', 'analgésique'],
  asthme: ['asthme', 'asthmatique', 'respiratoire', 'bronchique', 'poumon'],
  peau: ['dermatologie', 'peau', 'cutané', 'dermatologique', 'dermato'],
  sommeil: ['sommeil', 'insomnie', 'somnologie', 'dormir'],
  dos: ['dos', 'rachis', 'lombaire', 'dorsal', 'rhumatologie', 'vertèbre'],
  lombaire: ['dos', 'lombaire', 'rachis', 'lombalgie'],
  tête: ['tête', 'céphalée', 'céphalique', 'crâne', 'migraine', 'neurologie'],
  céphalée: ['tête', 'céphalée', 'migraine', 'mal de tête', 'neurologie'],
  maux: ['douleur', 'maux', 'mal', 'symptôme'],
  mal: ['douleur', 'mal', 'maux', 'symptôme'],

  // Spécialités - Autres
  neurologie: ['neurologie', 'neurologique', 'céphalée', 'migraine', 'tête'],
  rhumatologie: ['rhumatologie', 'rhumato', 'articulation', 'ostéoporose', 'os', 'muscle'],
  orl: ['orl', 'oreille', 'otoscope', 'vertige', 'tympan', 'gorge'],
  ophtalmologie: ['ophtalmologie', 'œil', 'vue', 'vision'],
  dentaire: ['dentaire', 'dent', 'cmf', 'maxillo', 'maxillofacial'],
  gériatrie: ['gériatrie', 'gériatrique', 'senior', 'sénior', 'âgé', 'démence'],
  oncologie: ['oncologie', 'cancer', 'oncologique', 'tumeur'],
  cancer: ['oncologie', 'cancer', 'tumeur'],

  // Outils et concepts
  calculateur: ['calculateur', 'calcul', 'échelle', 'score'],
  certificat: ['certificat', 'certificats', 'médical'],
  recommandation: ['recommandation', 'recommandations', 'has', 'guidelines'],
  médicament: ['médicament', 'médicaments', 'médicamenteux', 'pharmacologie'],
  interaction: ['interaction', 'interactions', 'médicamenteuse'],
};

/**
 * Normalise un terme pour la recherche (minuscules, sans accents pour la clé)
 */
function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Normalise un texte complet pour la recherche (minuscules, sans accents)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Trouve les synonymes d'un terme dans le dictionnaire (recherche insensible aux accents).
 * Gère aussi le préfixe : "rein" matche la clé "rein" donc on retourne [rein, rénal, ...].
 */
function findSynonyms(term: string): string[] {
  const normalized = normalizeTerm(term);
  if (!normalized || normalized.length < 2) return [term.toLowerCase()];

  // Recherche exacte (clé ou membre d'un groupe)
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (normalizeTerm(key) === normalized) return synonyms;
    if (synonyms.some((s) => normalizeTerm(s) === normalized)) return synonyms;
  }

  // Recherche par préfixe (termes d'au moins 3 caractères) pour proposer rénal quand on tape "rein"
  if (normalized.length >= 3) {
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      const keyNorm = normalizeTerm(key);
      if (keyNorm.startsWith(normalized) || normalized.startsWith(keyNorm)) return synonyms;
      if (synonyms.some((s) => normalizeTerm(s).startsWith(normalized) || normalized.startsWith(normalizeTerm(s))))
        return synonyms;
    }
  }

  return [term.toLowerCase()];
}

/**
 * Extrait le mot significatif (retire d', l', qu', etc. en début de mot).
 */
function extractKeyword(word: string): string {
  const lower = word.toLowerCase().replace(/^['']|['']$/g, '');
  const withoutElision = lower.replace(/^(d|j|l|n|qu|s|m|c)['']/, '');
  return withoutElision;
}

/**
 * Décompose une requête en groupes de synonymes (un groupe par mot).
 * Les mots vides sont inclus mais seront matchés en mot entier uniquement
 * (ex: "sur" ne matche pas "surveillance", donc 0 résultat).
 */
export function getSearchTermGroups(query: string): string[][] {
  const rawWords = query.toLowerCase().split(/[\s,;.!?]+/);
  const words = rawWords
    .map((w) => extractKeyword(w.replace(/^['']|['']$/g, '')))
    .filter((w) => w.length >= 2);

  return words.map((word) => {
    const synonyms = findSynonyms(word);
    const group = new Set<string>([word, ...synonyms.map(s => s.toLowerCase())]);
    return Array.from(group);
  });
}

/**
 * Vérifie si un terme est un mot de liaison (stop word).
 * Ces termes sont matchés en mot entier uniquement (pas en sous-chaîne).
 */
function isStopWordTerm(term: string): boolean {
  const normalized = normalizeTerm(term);
  return STOP_WORDS_NORMALIZED.has(normalized) || STOP_WORDS.has(term.toLowerCase());
}

/**
 * Distance de Levenshtein pour la tolérance aux fautes de frappe.
 */
function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  const matrix: number[][] = Array(an + 1).fill(null).map(() => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

/** Retourne true si le terme matche le texte (exact ou fuzzy avec 1-2 caractères d'écart). */
function termMatchesText(normalizedText: string, normalizedTerm: string, fuzzy: boolean): boolean {
  if (normalizedText.includes(normalizedTerm)) return true;
  if (!fuzzy || normalizedTerm.length < 3) return false;
  const maxDist = normalizedTerm.length <= 5 ? 1 : 2;
  const words = normalizedText.split(/[^a-z0-9]+/).filter(Boolean);
  for (const word of words) {
    if (word.length < 2) continue;
    if (levenshtein(normalizedTerm, word) <= maxDist) return true;
  }
  return false;
}

/**
 * Vérifie si un texte correspond à la requête de recherche.
 * Pour les mots de liaison (sur, à, etc.) : match en mot entier uniquement
 * (ex: "sur" ne matche pas "surveillance" → 0 résultat).
 * Pour les mots clés : match en sous-chaîne comme avant.
 */
export function matchesSearch(text: string, termGroups: string[][]): boolean {
  return matchesSearchInternal(text, termGroups, false);
}

/**
 * Comme matchesSearch mais avec tolérance aux fautes de frappe (fuzzy).
 */
export function matchesSearchFuzzy(text: string, termGroups: string[][]): boolean {
  return matchesSearchInternal(text, termGroups, true);
}

function matchesSearchInternal(text: string, termGroups: string[][], fuzzy: boolean): boolean {
  if (termGroups.length === 0) return true;

  const normalizedText = normalizeText(text);

  return termGroups.every(group =>
    group.some(term => {
      const normalizedTerm = normalizeTerm(term);
      if (normalizedTerm.length < 2) return false;

      if (isStopWordTerm(term)) {
        const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundaryRegex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
        return wordBoundaryRegex.test(normalizedText);
      }

      return termMatchesText(normalizedText, normalizedTerm, fuzzy);
    })
  );
}

/** Contexte pour scorer la pertinence (nom de catégorie, ressource, etc.) */
export interface SearchableContext {
  categoryName?: string;
  name: string;
  description: string;
  note?: string;
}

/**
 * Score de pertinence (plus c'est élevé, plus le résultat est pertinent).
 * Priorité : nom de la ressource > catégorie > description > note.
 */
export function scoreSearchMatch(context: SearchableContext, termGroups: string[][]): number {
  if (termGroups.length === 0) return 0;

  let score = 0;
  const norm = (s: string) => normalizeText(s || '');

  for (const group of termGroups) {
    let best = 0;
    for (const term of group) {
      const n = normalizeTerm(term);
      if (n.length < 2 || isStopWordTerm(term)) continue;

      if (context.categoryName && norm(context.categoryName).includes(n)) best = Math.max(best, 30);
      if (norm(context.name).includes(n)) {
        const nameNorm = norm(context.name);
        const idx = nameNorm.indexOf(n);
        const atWordStart = idx >= 0 && (idx === 0 || !/[\w]/.test(nameNorm[idx - 1]));
        best = Math.max(best, atWordStart ? 100 : 70);
      }
      if (context.description && norm(context.description).includes(n)) best = Math.max(best, 20);
      if (context.note && norm(context.note).includes(n)) best = Math.max(best, 15);
    }
    score += best;
  }
  return score;
}

/**
 * Retourne les termes associés à la requête (synonymes / dérivés) pour les proposer à l'utilisateur.
 * Ex: "rein" → ["rénal", "néphrologie", "néphro"] (à afficher comme "Rechercher aussi : rénal, néphrologie").
 * Limité et dédupliqué pour rester précis.
 */
export function getRelatedTermSuggestions(query: string, maxSuggestions = 5): string[] {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const rawWords = q.toLowerCase().split(/[\s,;.!?]+/).filter((w) => w.length >= 2);
  const seen = new Set<string>();
  const normalizedTyped = new Set(rawWords.map((w) => normalizeTerm(w)));
  const result: string[] = [];

  for (const word of rawWords) {
    const group = findSynonyms(word);
    for (const term of group) {
      const n = normalizeTerm(term);
      if (normalizedTyped.has(n)) continue;
      if (seen.has(n)) continue;
      seen.add(n);
      result.push(term);
      if (result.length >= maxSuggestions) return result;
    }
  }
  return result;
}

/**
 * Suggère des corrections "Vous vouliez dire ?" à partir d'un vocabulaire.
 * Retourne au plus maxSuggestions termes les plus proches de la requête.
 */
export function getDidYouMeanSuggestions(
  query: string,
  vocabulary: string[],
  maxSuggestions = 3
): string[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const normalizedQuery = normalizeTerm(q);
  const uniqueVocab = [...new Set(vocabulary)].map((v) => v.toLowerCase().trim()).filter((v) => v.length >= 2);

  const withDistance: { term: string; dist: number }[] = uniqueVocab.map((term) => {
    const norm = normalizeTerm(term);
    const dist = Math.min(
      levenshtein(normalizedQuery, norm),
      ...normalizedQuery.split(/\s+/).filter((w) => w.length >= 2).map((w) => levenshtein(w, norm))
    );
    return { term, dist };
  });

  return withDistance
    .filter(({ dist }) => dist > 0 && dist <= 3)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, maxSuggestions)
    .map(({ term }) => term);
}
