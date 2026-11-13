// ─────────────────────────────────────────────────────────────
// Listes fixes utilisées partout sur le site.
// Fichier « neutre » : il peut être importé aussi bien par le serveur
// que par les composants du navigateur ("use client").
// ─────────────────────────────────────────────────────────────

export const DISCIPLINES = [
  "Musique", "Arts visuels", "Peinture", "Sculpture", "Danse",
  "Théâtre", "Littérature", "Photographie", "Cinéma", "Artisanat d'art",
];

export const VILLES = [
  "Cotonou", "Porto-Novo", "Abomey-Calavi", "Abomey", "Ouidah",
  "Parakou", "Bohicon", "Natitingou", "Lokossa", "Djougou",
];

// Catégories d'œuvres (utilisées par la Marketplace ET le formulaire de publication).
export const CATEGORIES = [
  "Tableau", "Sculpture", "Photographie", "Musique",
  "Textile", "Artisanat d'art", "Livre", "Numérique",
];

// Catégories des guides de la rubrique Ressources.
export const CATEGORIES_RESSOURCES = [
  "Droits d'auteur", "Streaming", "Financements", "Formations", "Vendre son art", "Juridique",
];


// Champs communs des aperçus de partage (WhatsApp, Facebook…) : nom du site et langue.
export const OG_BASE = { siteName: "CultureConnectBJ", locale: "fr_FR", type: "website" as const };