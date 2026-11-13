// ─────────────────────────────────────────────────────────────
// Lecture des données d'une œuvre pour sa fiche (/marketplace/[slug]).
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export async function getArtworkBySlug(slug: string) {
  // Mise en cache (voir artist-data.ts pour l'explication).
  "use cache";
  cacheLife("hours");
  cacheTag("artworks", `artwork-${slug}`);

  const supabase = createPublicClient();

  // 1. L'œuvre, seulement si elle est validée par l'admin.
  //    « artist:artists(...) » récupère en même temps les infos de son artiste.
  const { data: artwork } = await supabase
    .from("artworks")
    .select(
      "id, slug, title, kind, category, description, technique, dimensions, year, price_fcfa, stock, image_paths, artist:artists(id, slug, stage_name, disciplines, city, avatar_path)",
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  // Œuvre introuvable ou non validée → la page affichera une 404.
  if (!artwork) return null;

  // 2. Jusqu'à 4 autres œuvres du même artiste, encore disponibles.
  const { data: autres } = await supabase
    .from("artworks")
    .select("id, slug, title, price_fcfa, image_paths")
    .eq("status", "approved")
    .eq("artist_id", artwork.artist?.id ?? "")
    .neq("id", artwork.id) // on exclut l'œuvre affichée
    .gt("stock", 0) // seulement celles en stock
    .order("created_at", { ascending: false })
    .limit(4);

  return { artwork, autres: autres ?? [] };
}