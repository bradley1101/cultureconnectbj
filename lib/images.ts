// ─────────────────────────────────────────────────────────────
// Vérification des images envoyées (photos de profil, bannières, œuvres).
// ─────────────────────────────────────────────────────────────

// Formats acceptés et taille maximale (5 Mo).
export const TYPES_IMAGE = ["image/jpeg", "image/png", "image/webp"];
export const TAILLE_MAX = 5 * 1024 * 1024; // 5 × 1024 × 1024 octets

// Renvoie un message d'erreur si l'image ne convient pas, sinon null.
// Pas de fichier choisi = pas d'erreur (on garde l'image actuelle).
export function verifierImage(fichier: File | null): string | null {
  if (!fichier || fichier.size === 0) return null;
  if (!TYPES_IMAGE.includes(fichier.type)) return "Format d'image non accepté (JPG, PNG ou WEBP uniquement).";
  if (fichier.size > TAILLE_MAX) return "Image trop lourde (5 Mo maximum).";
  return null;
}

// Extension du fichier selon son type (pour nommer le fichier stocké).
export function extension(fichier: File) {
  return fichier.type === "image/png" ? "png" : fichier.type === "image/webp" ? "webp" : "jpg";
}