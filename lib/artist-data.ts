// ─────────────────────────────────────────────────────────────
// Lecture des données d'un artiste pour sa page de profil.
// Tout passe par le client public : la sécurité de la base (RLS)
// ne renvoie que ce qui est validé et visible par tous.
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Récupère un artiste à partir de son « slug » (la fin de l'adresse,
// ex. /artistes/kofi-mensah → slug = "kofi-mensah"),
// avec son portfolio, ses œuvres en vente et ses prochains événements.
export async function getArtistBySlug(slug: string) {
  // "use cache" : le résultat est gardé en mémoire pour ne pas
  // interroger la base à chaque visite.
  "use cache";
  cacheLife("hours"); // rafraîchi toutes les heures environ
  // Étiquettes : permettront de vider ce cache quand l'artiste modifie son profil.
  cacheTag("artists", `artist-${slug}`);

  const supabase = createPublicClient();

  // 1. L'artiste lui-même. maybeSingle() renvoie null s'il n'existe pas
  //    (ou s'il n'est pas encore validé, grâce à la RLS).
  const { data: artist } = await supabase
    .from("artists")
    .select("id, slug, stage_name, disciplines, city, bio, avatar_path, banner_path, social_links, is_verified")
    .eq("slug", slug)
    .maybeSingle();

  // Artiste introuvable : on s'arrête là (la page affichera une erreur 404).
  if (!artist) return null;

  // 2. Les trois listes, lues en même temps pour aller plus vite.
  const [portfolio, artworks, events] = await Promise.all([
    // Portfolio, dans l'ordre choisi par l'artiste.
    supabase
      .from("portfolio_items")
      .select("id, title, image_path, media_url, year")
      .eq("artist_id", artist.id)
      .order("position"),
    // Œuvres validées, les plus récentes d'abord.
    supabase
      .from("artworks")
      .select("id, slug, title, category, price_fcfa, image_paths")
      .eq("artist_id", artist.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    // Événements validés et à venir (date >= maintenant).
    supabase
      .from("events")
      .select("id, title, starts_at, city, venue")
      .eq("artist_id", artist.id)
      .eq("status", "approved")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at"),
  ]);

  // « ?? [] » : si une liste n'a pas pu être lue, on renvoie une liste vide.
  return {
    artist,
    portfolio: portfolio.data ?? [],
    artworks: artworks.data ?? [],
    events: events.data ?? [],
  };
}

// Numéro WhatsApp officiel de la plateforme (stocké dans la table « settings »).
// Tous les contacts passent par lui, pas par le numéro personnel de l'artiste.
export async function getWhatsappNumber() {
  "use cache";
  cacheLife("days"); // change rarement
  cacheTag("settings");
  const { data } = await createPublicClient()
    .from("settings")
    .select("whatsapp_number")
    .single();
  return data?.whatsapp_number ?? "";
}