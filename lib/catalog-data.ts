// ─────────────────────────────────────────────────────────────
// Données de la Marketplace : listes des filtres + recherche des œuvres.
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// La liste est maintenant dans lib/constants.ts ; ré-exportée ici pour la page Marketplace.
export { CATEGORIES } from "@/lib/constants";

// Options de tri : code (dans l'adresse) → texte affiché.
export const TRIS = {
  recent: "Plus récentes",
  prix_asc: "Prix croissant",
  prix_desc: "Prix décroissant",
} as const;
// Type qui vaut "recent" | "prix_asc" | "prix_desc".
export type Tri = keyof typeof TRIS;

// Cherche les œuvres selon les filtres (vide = pas de filtre).
export async function searchArtworks(categorie: string, format: string, prixMax: number | null, tri: Tri) {
  "use cache";
  cacheLife("minutes");
  cacheTag("artworks");

  // Base : œuvres validées ET en stock, avec le nom de leur artiste.
  let requete = createPublicClient()
    .from("artworks")
    .select("id, slug, title, category, kind, price_fcfa, image_paths, artist:artists(stage_name)")
    .eq("status", "approved")
    .gt("stock", 0)
    .limit(60);

  // Filtres ajoutés seulement s'ils sont choisis.
  if (categorie) requete = requete.eq("category", categorie);
  // On n'accepte que les deux valeurs prévues (sécurité).
  if (format === "physical" || format === "digital") requete = requete.eq("kind", format);
  // lte = « inférieur ou égal » au prix maximum.
  if (prixMax) requete = requete.lte("price_fcfa", prixMax);

  // Tri demandé (par défaut : les plus récentes d'abord).
  if (tri === "prix_asc") requete = requete.order("price_fcfa", { ascending: true });
  else if (tri === "prix_desc") requete = requete.order("price_fcfa", { ascending: false });
  else requete = requete.order("created_at", { ascending: false });

  const { data } = await requete;
  return data ?? [];
}