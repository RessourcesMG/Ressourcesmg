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
  peau: ['dermatologie', 'peau', 'cutané', 'dermatologique'],

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

  // Spécialités - Autres
  neurologie: ['neurologie', 'neurologique', 'céphalée', 'migraine'],
  rhumatologie: ['rhumatologie', 'rhumato', 'articulation', 'ostéoporose'],
  orl: ['orl', 'oreille', 'otoscope', 'vertige', 'tympan'],
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
 * Trouve les synonymes d'un terme dans le dictionnaire (recherche insensible aux accents)
 */
function findSynonyms(term: string): string[] {
  const normalized = normalizeTerm(term);
  if (!normalized || normalized.length < 2) return [term.toLowerCase()];

  // Recherche exacte
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (normalizeTerm(key) === normalized) {
      return synonyms;
    }
    if (synonyms.some(s => normalizeTerm(s) === normalized)) {
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
 * Vérifie si un mot est un mot vide (à ignorer).
 */
function isStopWord(word: string): boolean {
  const cleaned = extractKeyword(word);
  return STOP_WORDS.has(cleaned) || STOP_WORDS.has(word.toLowerCase()) || cleaned.length < 2;
}

/**
 * Décompose une requête en groupes de synonymes (un groupe par mot clé).
 * Ignore les mots vides (articles, prépositions, etc.).
 * Ex: "aide à la prescription d'antibiotiques" -> [["aide"], ["prescription", ...], ["antibiotique", "antibio", ...]]
 */
export function getSearchTermGroups(query: string): string[][] {
  const rawWords = query.toLowerCase().split(/[\s,;.!?]+/);
  const words = rawWords
    .map((w) => extractKeyword(w.replace(/^['']|['']$/g, '')))
    .filter((w) => w.length >= 2 && !isStopWord(w));

  return words.map((word) => {
    const synonyms = findSynonyms(word);
    const group = new Set<string>([word, ...synonyms.map(s => s.toLowerCase())]);
    return Array.from(group);
  });
}

/**
 * Vérifie si un texte correspond à la requête de recherche.
 * Pour une requête multi-mots : chaque mot (ou un de ses synonymes) doit être présent.
 * Ex: "aide antibiotique" matche si le texte contient ("aide") ET ("antibiotique" OU "antibio" OU "atb")
 */
export function matchesSearch(text: string, termGroups: string[][]): boolean {
  if (termGroups.length === 0) return true;

  const normalizedText = normalizeText(text);

  return termGroups.every(group =>
    group.some(term => {
      const normalizedTerm = normalizeTerm(term);
      if (normalizedTerm.length < 2) return false;
      return normalizedText.includes(normalizedTerm);
    })
  );
}
