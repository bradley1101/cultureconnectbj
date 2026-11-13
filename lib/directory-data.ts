// ─────────────────────────────────────────────────────────────
// Données de l'annuaire des artistes : listes des filtres
// + recherche dans la base.
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Les listes sont maintenant dans lib/constants.ts ; on les ré-exporte ici
// pour que les pages qui les importaient depuis ce fichier continuent de marcher.
export { DISCIPLINES, VILLES } from "@/lib/constants";

// Cherche les artistes selon 3 critères (chacun peut être vide = « tous »).
export async function searchArtists(q: string, discipline: string, ville: string) {
  "use cache";
  // Cache court (quelques minutes) : chaque combinaison de filtres est gardée à part.
  cacheLife("minutes");
  cacheTag("artists");

  // Requête de base : artistes vérifiés d'abord, puis par ordre alphabétique.
  // limit(60) : on évite de charger des centaines d'artistes d'un coup.
  let requete = createPublicClient()
    .from("artists")
    .select("id, slug, stage_name, disciplines, city, avatar_path, is_verified")
    .order("is_verified", { ascending: false })
    .order("stage_name")
    .limit(60);

  // Texte tapé : on retire les caractères spéciaux qui perturberaient la recherche.
  const texte = q.replace(/[%_,()]/g, " ").trim();
  // ilike = recherche sans tenir compte des majuscules ; « or » = dans le nom OU la ville.
  if (texte) requete = requete.or(`stage_name.ilike.%${texte}%,city.ilike.%${texte}%`);
  // contains : la liste des disciplines de l'artiste contient celle choisie.
  if (discipline) requete = requete.contains("disciplines", [discipline]);
  // Ville exacte.
  if (ville) requete = requete.eq("city", ville);

  const { data } = await requete;
  return data ?? [];
}