// ─────────────────────────────────────────────────────────────
// Lecture des textes légaux (stockés dans la table « settings »).
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Les 4 colonnes possibles.
export type ChampLegal = "legal_mentions" | "terms_of_use" | "terms_of_sale" | "privacy_policy";

export async function getTexteLegal(champ: ChampLegal) {
  "use cache";
  cacheLife("days"); // ces textes changent rarement
  cacheTag("settings"); // vidé quand l'admin enregistre les réglages

  const { data } = await createPublicClient()
    .from("settings")
    .select("legal_mentions, terms_of_use, terms_of_sale, privacy_policy, updated_at")
    .single();

  // data?.[champ] : lit la colonne demandée (ex. data.terms_of_use).
  return { texte: data?.[champ] ?? null, majLe: data?.updated_at ?? null };
}