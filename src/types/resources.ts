export interface Resource {
  id: string;
  name: string;
  description: string;
  url: string;
  requiresAuth?: boolean;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  resources: Resource[];
  isSpecialty?: boolean;
}

export interface MainSection {
  id: string;
  name: string;
  icon: string;
  categories?: Category[];
  resources?: Resource[];
}

// Ressources générales - Aide au diagnostic
const generalDiagnosticResources: Resource[] = [
  {
    id: "recomed",
    name: "Recomed",
    description: "Site de recommandations avec algorithmes de traitement",
    url: "https://recomedicales.fr/"
  },
  {
    id: "ordotype",
    name: "Ordotype",
    description: "Site de recommandations axé sur les ordonnances",
    url: "https://www.ordotype.fr/"
  },
  {
    id: "kitmedical",
    name: "Kit médical",
    description: "Site recensant des ressources",
    url: "https://www.kitmedical.fr/",
    requiresAuth: true
  },
  {
    id: "ebmfrance",
    name: "EBM France",
    description: "Cas cliniques en partenariat avec la HAS",
    url: "https://www.ebmfrance.net/",
    requiresAuth: true
  },
  {
    id: "biomg",
    name: "Bio MG",
    description: "Aide à la prescription de biologie pour des cas spécifiques",
    url: "https://biomg.fr/"
  },
  {
    id: "chu-tours",
    name: "CHU Tours - Urgence Imagerie",
    description: "Aide à la prescription d'imagerie",
    url: "https://urgence-imagerie.chu-tours.fr/"
  }
];

// Ressources générales - Autre
const generalOtherResources: Resource[] = [
  {
    id: "medicalement-geek",
    name: "Médicalement Geek",
    description: "Blog et newsletter sur des sujets variés et sourcés",
    url: "https://www.medicalement-geek.com/"
  },
  {
    id: "cmg",
    name: "Guides du CMG",
    description: "Productions du Collège de Médecine Générale",
    url: "https://www.cmg.fr/productions-du-cmg/"
  },
  {
    id: "ameli-pro",
    name: "Ameli Professionnels",
    description: "Rechercher un professionnel de santé",
    url: "https://authps-espacepro.ameli.fr/oauth2/authorize?response_type=code&scope=openid%20profile%20infosps%20email&client_id=csm-cen-prod_ameliprotransverse-connexionadmin_1_amtrx_i1_csm-cen-prod%2Fameliprotransverse-connexionadmin_1%2Famtrx_i1&state=0uLmiQtNwK3Oj_3bzE11SPlRnNY&redirect_uri=https%3A%2F%2Fespacepro.ameli.fr%2Fpage-accueil-ihm%2Fredirect_uri&nonce=BxK70DF6GATpBdoPi3MHhDQ1x9lFpxfTc6VEhIey1CI"
  },
  {
    id: "doocteur",
    name: "Doocteur",
    description: "Moteur de recherche spécialisé pour les médecins qui filtre des sources fiables",
    url: "https://doocteur.fr/"
  },
  {
    id: "omnidoc",
    name: "Omnidoc",
    description: "Plateforme de collaboration médicale",
    url: "https://omnidoc.fr/"
  },
  {
    id: "appthera",
    name: "App Thera",
    description: "Bibliothèque d'applications recommandées et validées pour les patients",
    url: "https://www.appthera.fr/",
    requiresAuth: true
  }
];

// Intelligence artificielle
const iaResources: Resource[] = [
  {
    id: "open-evidence",
    name: "Open Evidence",
    description: "IA se basant sur des données de la recherche pour répondre à des questions",
    url: "https://www.openevidence.com/",
    note: "Abonnement via la fac nécessaire"
  },
  {
    id: "consensus",
    name: "Consensus",
    description: "IA trouvant des sources fiables pour des biblios",
    url: "https://consensus.app/"
  },
  {
    id: "notebooklm",
    name: "Notebooklm",
    description: "IA analysant des articles scientifiques",
    url: "https://notebooklm.google/"
  },
  {
    id: "rayyan",
    name: "Rayyan",
    description: "IA permettant de faire du tri dans les articles scientifiques, screening",
    url: "https://www.rayyan.ai/"
  }
];

// Spécialités médicales
export const medicalSpecialties: Category[] = [
  {
    id: "allergologie",
    name: "Allergologie",
    icon: "Wind",
    resources: [
      {
        id: "allergodiet",
        name: "Allergodiet",
        description: "Conseils pour l'éviction",
        url: "https://allergodiet.org/espace-eviction/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "cardiologie",
    name: "Cardiologie",
    icon: "Heart",
    resources: [
      {
        id: "ecgclic",
        name: "ECG Clic",
        description: "Lecture d'ECG",
        url: "https://ecgclic.fr/"
      },
      {
        id: "e-cardiogram",
        name: "E-cardiogram",
        description: "Lecture d'ECG",
        url: "https://www.e-cardiogram.com/"
      },
      {
        id: "avkclic",
        name: "AVK Clic",
        description: "Équilibrer un INR",
        url: "https://www.mgform.org/boite-a-outils/avkclic"
      },
      {
        id: "thromboclic",
        name: "Thrombo Clic",
        description: "Gestion des anticoagulants et saignement",
        url: "https://www.thromboclic.fr/"
      },
      {
        id: "risquecv",
        name: "RisqueCV",
        description: "Calcul du risque cardiovasculaire",
        url: "https://risquecv.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "dentisterie",
    name: "CMF / Dentaire",
    icon: "ToothIcon",
    resources: [
      {
        id: "antibioest",
        name: "Antibioest",
        description: "Antibiotiques à visée dentaire",
        url: "https://guides.antibioest.org/"
      },
      {
        id: "dentibiotic",
        name: "Dentibiotic",
        description: "Antibiotiques à visée dentaire",
        url: "https://dentibiotic.fr/"
      },
      {
        id: "dentromatic",
        name: "Dentromatic",
        description: "Traumato dentaire",
        url: "https://dentromatic.fr/"
      },
      {
        id: "maxilloclic",
        name: "Maxilloclic",
        description: "Urgences CMF",
        url: "https://www.maxilloclic.com/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "dermatologie",
    name: "Dermatologie",
    icon: "ScanFace",
    resources: [
      {
        id: "dermatoclic",
        name: "Dermatoclic",
        description: "Ressources dermatologie",
        url: "https://www.dermatoclic.com/"
      },
      {
        id: "dermato-info",
        name: "Dermato Info",
        description: "Site à destination du patient pour s'informer sur les problèmes de peau",
        url: "https://dermato-info.fr/"
      },
      {
        id: "dermatokid",
        name: "Dermatokid",
        description: "Dermatologie pédiatrique",
        url: "https://dermatologiepediatrique.wordpress.com/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "endocrinologie",
    name: "Endocrinologie",
    icon: "ThyroidIcon",
    resources: [
      {
        id: "diabeclic",
        name: "Diabeclic",
        description: "Prise en charge du diabète",
        url: "https://www.diabeclic.com/"
      },
      {
        id: "thyroclic",
        name: "Thyroclic",
        description: "Prise en charge d'un nodule thyroïdien",
        url: "http://aporose.fr/thyroclic/index.html"
      },
      {
        id: "thyrocheck",
        name: "Thyrocheck",
        description: "Équilibrage TSH",
        url: "https://thyrocheck.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "geriatrie",
    name: "Gériatrie",
    icon: "User",
    resources: [
      {
        id: "geriaclic",
        name: "Gériaclic",
        description: "Axé sur la pharmacologie",
        url: "https://cptsmarseille2-3.fr/outil-iatrogenie/"
      },
      {
        id: "demenceclic",
        name: "Démence Clic",
        description: "Prise en charge des démences",
        url: "https://demenceclic.fr/index.html"
      },
      {
        id: "ernesti",
        name: "Ernesti",
        description: "Garde de séniors la nuit",
        url: "https://ernesti.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "gynecologie",
    name: "Gynécologie",
    icon: "PregnantWomanIcon",
    resources: [
      {
        id: "lecrat",
        name: "Le CRAT",
        description: "Rechercher des interactions médicamenteuses pendant la grossesse et l'allaitement",
        url: "https://www.lecrat.fr/"
      },
      {
        id: "gestaclic",
        name: "Gestaclic",
        description: "Suivi de grossesse normale",
        url: "https://gestaclic.fr/"
      },
      {
        id: "ivg-adresses",
        name: "IVG Les Adresses",
        description: "Où avorter en France",
        url: "https://ivglesadresses.org/"
      },
      {
        id: "lactaclic",
        name: "Lactaclic",
        description: "Allaitement",
        url: "https://lactaclic.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "hematologie",
    name: "Hématologie",
    icon: "TestTubeIcon",
    resources: [
      {
        id: "drepanoclic",
        name: "Drépanoclic",
        description: "Drépanocytose",
        url: "https://drepanoclic.fr/"
      },
      {
        id: "hematocell",
        name: "Hematocell",
        description: "Comprendre une anomalie de l'hémogramme",
        url: "https://www.hematocell.fr/anomalies-de-lhemogramme-et-du-myelogramme/etiologie-dune-anemie-une-leucocytose-leucopenie"
      }
    ],
    isSpecialty: true
  },
  {
    id: "infectiologie",
    name: "Infectiologie",
    icon: "Bug",
    resources: [
      {
        id: "antibioclic",
        name: "Antibioclic",
        description: "Aide à la prescription d'antibiotiques",
        url: "https://antibioclic.com/"
      },
      {
        id: "vihclic",
        name: "VIHclic",
        description: "Prise en charge du VIH",
        url: "https://vihclic.fr/"
      },
      {
        id: "antibioclic-afrique",
        name: "Antibioclic Afrique",
        description: "Aide à la prescription d'antibiotiques",
        url: "https://antibioclic-afrique.com/"
      },
      {
        id: "pasteur",
        name: "Institut Pasteur",
        description: "Départ en voyage",
        url: "https://www.pasteur.fr/fr/centre-medical/preparer-son-voyage"
      },
      {
        id: "vaccination-info",
        name: "Vaccination Info Service Pro",
        description: "Informations vaccination pour professionnels",
        url: "https://professionnels.vaccination-info-service.fr/"
      },
      {
        id: "infovac",
        name: "Info Vac",
        description: "Informations vaccination",
        url: "https://www.infovac.fr/"
      },
      {
        id: "dr-microbe",
        name: "Dr Microbe",
        description: "Ressource en microbiologie",
        url: "https://drmicrobe.com/index.php"
      },
      {
        id: "pilly",
        name: "Pilly Étudiant",
        description: "Guide simple et concis en infectiologie",
        url: "https://www.infectiologie.com/fr/pilly-etudiant-2023-disponible-a-la-vente-et-en-ligne.html"
      },
      {
        id: "vaccinclic",
        name: "Vaccin Clic",
        description: "Répondre aux idées reçues du patient sur la vaccination",
        url: "https://vaccinclic.com/"
      },
      {
        id: "sexpoz",
        name: "Sexpoz",
        description: "Prise en charge post exposition sexuelle au VIH",
        url: "https://sexpoz.vihack.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "medecine-interne",
    name: "Médecine interne",
    icon: "Search",
    resources: [
      {
        id: "filieres-mr",
        name: "Filière Maladies Rares",
        description: "Orienter un patient porteur de maladie rare",
        url: "https://www.filieresmaladiesrares.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "medecine-travail",
    name: "Médecine du travail",
    icon: "Briefcase",
    resources: [
      {
        id: "bossons-fute",
        name: "Bossons Futé",
        description: "Prévention liée au travail",
        url: "https://bossons-fute.fr/"
      },
      {
        id: "inrs-mp",
        name: "INRS - Maladies Professionnelles",
        description: "Tableau des maladies professionnelles",
        url: "https://www.inrs.fr/publications/bdd/mp.html"
      }
    ],
    isSpecialty: true
  },
  {
    id: "mpr",
    name: "MPR",
    icon: "Accessibility",
    resources: [
      {
        id: "kineclic",
        name: "Kinéclic",
        description: "Rééducation et kinésithérapie",
        url: "https://www.kineclic.fr/"
      },
      {
        id: "materiel-medical",
        name: "Guide Aides Techniques",
        description: "Aide à la prescription des dispositifs médicaux",
        url: "https://maillage92.sante-idf.fr/files/live/sites/maillage92/files/Creations/GUIDE-DES-AIDES-TECHNIQUES/GUIDE-DES-AIDES%20TECHNIQUES.pdf"
      }
    ],
    isSpecialty: true
  },
  {
    id: "neurologie",
    name: "Neurologie",
    icon: "Brain",
    resources: [
      {
        id: "cephaleeclic",
        name: "Céphaléeclic",
        description: "Prise en charge des céphalées",
        url: "https://cephaleeclic.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "nutrition",
    name: "Nutrition",
    icon: "Apple",
    resources: [
      {
        id: "nutriclic",
        name: "Nutriclic",
        description: "Conseil en nutrition",
        url: "https://nutriclic.wixsite.com/conseil"
      },
      {
        id: "prevenclic",
        name: "Prévenclic",
        description: "Orienter la consultation en nutrition",
        url: "https://www.prevenclic.fr/index-0-6-0"
      },
      {
        id: "bariaclic",
        name: "Bariaclic",
        description: "Avant la chirurgie bariatrique",
        url: "https://www.caloris.fr/bariaclic/"
      },
      {
        id: "bariamed",
        name: "Bariamed",
        description: "Après la chirurgie bariatrique",
        url: "https://bariamed.fr/"
      },
      {
        id: "vegeclic",
        name: "Vegeclic",
        description: "Alimentation végétarienne",
        url: "https://vegeclic.com/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "oncologie",
    name: "Oncologie",
    icon: "Ribbon",
    resources: [
      {
        id: "oncoclic",
        name: "Oncoclic",
        description: "Prise en charge oncologique",
        url: "https://www.oncoclic.fr/",
        requiresAuth: true
      },
      {
        id: "inca",
        name: "InCa",
        description: "Outils pour l'aide du MG à la prise en charge des cancers",
        url: "https://www.cancer.fr/professionnels-de-sante/recommandations-et-aide-a-la-pratique/outils-pour-la-pratique-des-medecins-generalistes"
      }
    ],
    isSpecialty: true
  },
  {
    id: "ophtalmologie",
    name: "Ophtalmologie",
    icon: "Eye",
    resources: [
      {
        id: "ophtalmoclic",
        name: "Ophtalmoclic",
        description: "Ressources ophtalmologie",
        url: "https://www.ophtalmoclic.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "orl",
    name: "ORL",
    icon: "Ear",
    resources: [
      {
        id: "vertigoclic",
        name: "Vertigoclic",
        description: "Prise en charge des vertiges",
        url: "https://www.vertigoclic.com/accueil"
      },
      {
        id: "acute-vertigo",
        name: "Acute Vertigo (BMJ)",
        description: "Prise en charge des vertiges",
        url: "https://www.bmj.com/content/378/bmj-2021-069850"
      },
      {
        id: "otoscopic",
        name: "Otoscopic",
        description: "Reconnaître des pathologies du tympan à l'otoscope",
        url: "https://www.otoscopic.fr/",
        note: "En construction"
      }
    ],
    isSpecialty: true
  },
  {
    id: "orthopedie",
    name: "Orthopédie",
    icon: "Bone",
    resources: [
      {
        id: "clic-de-la-main",
        name: "Clic de la Main",
        description: "Traumato de la main",
        url: "https://clicdelamain.com/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "pediatrie",
    name: "Pédiatrie",
    icon: "Baby",
    resources: [
      {
        id: "pediadoc",
        name: "Pediadoc",
        description: "La consultation standard par âge",
        url: "https://www.pediadoc.fr/"
      },
      {
        id: "pap-pediatrie",
        name: "Pas à Pas en Pédiatrie",
        description: "Prise en charge spécifique par algorithmes",
        url: "https://pap-pediatrie.fr/recherche"
      },
      {
        id: "trousseau-de-poche",
        name: "Trousseau de Poche",
        description: "Kit complet de prise en charge et d'outils",
        url: "https://trousseaudepoche.fr/",
        requiresAuth: true
      },
      {
        id: "pediatre-online",
        name: "Pédiatre Online",
        description: "Plateforme d'articles scientifiques de pédiatrie",
        url: "https://www.pediatre-online.fr/"
      },
      {
        id: "st-justine",
        name: "St Justine",
        description: "Ressource sur les éruptions cutanées de l'enfant",
        url: "https://www.hug.ch/sites/interhug/files/structures/saup_professionnels/fichiers/erruptions_cutanees_st_justine.pdf"
      },
      {
        id: "diversiclic",
        name: "Diversiclic",
        description: "Conseils sur la diversification alimentaire",
        url: "https://diversiclic.fr/professionnel"
      },
      {
        id: "autismed",
        name: "Autismed",
        description: "Dépistage de l'autisme",
        url: "https://autismed.fr/"
      },
      {
        id: "declic-langage",
        name: "Declic Langage",
        description: "Troubles du langage",
        url: "https://www.decliclangage.com/"
      },
      {
        id: "dodoclic",
        name: "Dodoclic",
        description: "Troubles du sommeil de l'enfant",
        url: "https://dodoclic.fr/"
      },
      {
        id: "laits",
        name: "Laits Infantiles",
        description: "Conseils pour les laits infantiles",
        url: "https://www.laits.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "pharmacologie",
    name: "Pharmacologie",
    icon: "Pill",
    resources: [
      {
        id: "docamed",
        name: "Docamed",
        description: "Médicament selon l'indication",
        url: "https://sfpt-fr.org/docamed"
      },
      {
        id: "base-medicaments",
        name: "Base de Données des Médicaments",
        description: "Rechercher une RCP",
        url: "https://base-donnees-publique.medicaments.gouv.fr/"
      },
      {
        id: "gpr-vidal",
        name: "GPR Vidal",
        description: "Adaptation d'un traitement à la fonction rénale",
        url: "https://www.vidal.fr/gpr.html",
        requiresAuth: true
      },
      {
        id: "toxifrise",
        name: "Toxifrise",
        description: "Retracer une suspicion de toxidermie médicamenteuse",
        url: "https://www.toxi-frise.fr/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "psychiatrie",
    name: "Psychiatrie / Addictologie",
    icon: "BrainCircuit",
    resources: [
      {
        id: "psychiatrienet",
        name: "Psychiatrienet",
        description: "Switch d'antidépresseurs",
        url: "https://wiki.psychiatrienet.nl/wiki/Main_Page"
      },
      {
        id: "psychopharma",
        name: "Psychopharma",
        description: "Switch d'antidépresseurs",
        url: "https://www.psychopharma.fr/switch"
      },
      {
        id: "cmpsy-switch",
        name: "cmpsy Switch",
        description: "Switch d'antipsychotiques",
        url: "http://cmpsy-switch.com/Le-Switch/"
      },
      {
        id: "mon-psy",
        name: "Mon Psy",
        description: "Trouver un psychologue remboursé par l'AM",
        url: "https://monsoutienpsy.ameli.fr/recherche-psychologue"
      },
      {
        id: "psychiaclic",
        name: "Psychiaclic",
        description: "Ressources psychiatrie",
        url: "https://www.psychiaclic.fr/"
      },
      {
        id: "psychotropes",
        name: "Psychotropes",
        description: "Ressources générales en psychiatrie",
        url: "https://psychotropes.fr/",
        note: "Site incomplet"
      },
      {
        id: "addictaide",
        name: "Addictaide",
        description: "Évaluer une addiction",
        url: "https://www.addictaide.fr/"
      },
      {
        id: "declicsommeil",
        name: "Declicsommeil",
        description: "Troubles du sommeil",
        url: "https://declicsommeil.com/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "radiologie",
    name: "Radiologie",
    icon: "Scan",
    resources: [
      {
        id: "radrap",
        name: "Rad Rap",
        description: "Générateur de compte rendus (utile pour l'écho)",
        url: "https://www.radrap.ch/comptesrendus"
      },
      {
        id: "pinky-bone",
        name: "Pinky Bone",
        description: "Mémos utiles en radiologie",
        url: "https://www.pinkybone.com/"
      },
      {
        id: "normal-bones",
        name: "Normal Bones",
        description: "Comparer une radiographie pédiatrique à une radio normale selon l'âge",
        url: "http://bones.getthediagnosis.org/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "rhumatologie",
    name: "Rhumatologie",
    icon: "Hand",
    resources: [
      {
        id: "aporose",
        name: "Aporose",
        description: "Gestion de l'ostéoporose",
        url: "http://aporose.fr/entrer.php",
        note: "Projet de thèse de 2014"
      },
      {
        id: "frax",
        name: "FRAX",
        description: "Calcul du risque de fracture",
        url: "https://www.fraxplus.org/calculation-tool?country=12"
      }
    ],
    isSpecialty: true
  },
  {
    id: "social",
    name: "Social / Administratif",
    icon: "FileText",
    resources: [
      {
        id: "declic-violence",
        name: "Déclic Violences",
        description: "Signaler des violences",
        url: "https://declicviolence.fr/"
      },
      {
        id: "sporticlic",
        name: "Sporticlic",
        description: "Réalisation de certificats sportifs",
        url: "https://www.sporticlic.fr/"
      },
      {
        id: "certificat-medical",
        name: "Service-Public.fr",
        description: "Besoin d'un certificat médical ?",
        url: "https://www.service-public.gouv.fr/simulateur/calcul/certificatMedical_Creche_Ecole"
      },
      {
        id: "certdc",
        name: "CertDc",
        description: "Certificat de décès en ligne",
        url: "https://certdc.inserm.fr/"
      },
      {
        id: "mdphclic",
        name: "MDPHclic",
        description: "Aide à la rédaction d'un certificat MDPH",
        url: "https://www.mdphclic.fr/"
      },
      {
        id: "traducmed",
        name: "TraducMed",
        description: "Traducteur en ligne avec phrases toutes faites",
        url: "http://www.traducmed.fr/"
      },
      {
        id: "omniprat",
        name: "Omniprat",
        description: "Aide à la cotation en MG",
        url: "https://omniprat.org/"
      },
      {
        id: "transidenticlic",
        name: "Transidenticlic",
        description: "Accompagnement des personnes transidentes",
        url: "https://transidenticlic.com/"
      }
    ],
    isSpecialty: true
  },
  {
    id: "soins-palliatifs",
    name: "Soins palliatifs",
    icon: "HeartHandshake",
    resources: [
      {
        id: "palliaclic",
        name: "Palliaclic",
        description: "Prise en charge des soins palliatifs",
        url: "https://palliaclic.com/"
      },
      {
        id: "opioconvert",
        name: "Opioconvert",
        description: "Convertisseur d'opioïdes",
        url: "https://opioconvert.fr/calculatrice"
      }
    ],
    isSpecialty: true
  }
];

// Main categories for navigation
export const categories: Category[] = [
  {
    id: "general-diagnostic",
    name: "Aide au diagnostic et à la prescription",
    icon: "Stethoscope",
    resources: generalDiagnosticResources
  },
  {
    id: "ia",
    name: "Intelligence artificielle",
    icon: "Sparkles",
    resources: iaResources
  },
  {
    id: "general-other",
    name: "Autre",
    icon: "MoreHorizontal",
    resources: generalOtherResources
  },
  ...medicalSpecialties
];

// Export for stats
export const totalResources = categories.reduce((acc, cat) => acc + cat.resources.length, 0);
export const totalCategories = categories.length;
export const specialtyCount = medicalSpecialties.length;
