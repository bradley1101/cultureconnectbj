// ─────────────────────────────────────────────────────────────
// Lecture des données des pages Agenda, Opportunités et Ressources.
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Enums } from "@/lib/supabase/database.types";

// ── AGENDA : événements validés et à venir (filtre ville optionnel) ──
export async function getEvents(ville: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  let requete = createPublicClient()
    .from("events")
    // artist:artists(...) : récupère aussi le nom et l'adresse de l'artiste lié.
    .select("id, title, description, starts_at, city, venue, link, artist:artists(slug, stage_name)")
    .eq("status", "approved")
    .gte("starts_at", new Date().toISOString()) // seulement à partir de maintenant
    .order("starts_at") // du plus proche au plus lointain
    .limit(100);

  if (ville) requete = requete.eq("city", ville);

  const { data } = await requete;
  return data ?? [];
}

// ── OPPORTUNITÉS : la sécurité de la base ne renvoie déjà que celles
//    qui sont validées ET dont la date limite n'est pas passée. ──
export async function getOpportunities(type: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("opportunities");

  let requete = createPublicClient()
    .from("opportunities")
    .select("id, type, title, organizer, description, deadline, link, contact")
    .order("deadline") // les plus urgentes d'abord
    .limit(100);

  // « as Enums<...> » : on indique à TypeScript que c'est un type d'opportunité valide.
  if (type) requete = requete.eq("type", type as Enums<"opportunity_type">);

  const { data } = await requete;
  return data ?? [];
}

// ── RESSOURCES : liste des guides publiés (les plus récents d'abord) ──
export async function getResources() {
  "use cache";
  cacheLife("hours");
  cacheTag("resources");

  const { data } = await createPublicClient()
    .from("resources")
    .select("id, slug, title, category, excerpt, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return data ?? [];
}

// ── Un guide complet, pour sa page de lecture ──
export async function getResourceBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("resources", `resource-${slug}`);

  const { data } = await createPublicClient()
    .from("resources")
    .select("id, slug, title, category, excerpt, content, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle(); // null si le guide n'existe pas ou n'est pas publié

  return data;
}