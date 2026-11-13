// ─────────────────────────────────────────────────────────────
// Données de la page d'accueil.
// Pour chaque section :
//   1. d'abord les éléments ÉPINGLÉS par l'admin (featured_until dans le futur),
//   2. puis on complète avec la RÈGLE AUTOMATIQUE (inchangée).
// ─────────────────────────────────────────────────────────────

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Liste d'identifiants au format attendu par Supabase pour « pas dans » : (id1,id2,…)
const exclure = (ids: string[]) => `(${ids.join(",")})`;

// ══════════ ARTISTES À LA UNE (10) ══════════
export async function getFeaturedArtists() {
  "use cache";
  cacheLife("hours");
  cacheTag("artists");

  const supabase = createPublicClient();
  const maintenant = new Date().toISOString();
  const colonnes = "id, slug, stage_name, disciplines, city, avatar_path, is_verified, featured_until";

  // 1. Épinglés (mise en avant encore valable), les plus récemment prolongés d'abord.
  const { data: epingles } = await supabase
    .from("artists")
    .select(colonnes)
    .gt("featured_until", maintenant)
    .order("featured_until", { ascending: false })
    .limit(10);
  // epingle: true → la carte « tremble » sur l'accueil (façon iPhone).
  const liste = (epingles ?? []).map((x) => ({ ...x, epingle: true }));
  if (liste.length >= 10) return liste; // section déjà pleine

  // 2. Complément automatique : vérifiés d'abord, puis derniers inscrits,
  //    en excluant ceux déjà épinglés (pour ne pas les afficher deux fois).
  let auto = supabase
    .from("artists")
    .select(colonnes)
    .order("is_verified", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10 - liste.length);
  if (liste.length) auto = auto.not("id", "in", exclure(liste.map((a) => a.id)));
  const { data } = await auto;

  // [...a, ...b] : on met les deux listes bout à bout (épinglés en premier).
  return [...liste, ...(data ?? []).map((x) => ({ ...x, epingle: false }))];
}

// ══════════ ŒUVRES À ACQUÉRIR (10) ══════════
export async function getLatestArtworks() {
  "use cache";
  cacheLife("hours");
  cacheTag("artworks");

  const supabase = createPublicClient();
  const maintenant = new Date().toISOString();
  const colonnes = "id, slug, title, category, kind, price_fcfa, image_paths, featured_until, artist:artists(stage_name, slug, city)";

  // 1. Épinglées — mais toujours validées ET en stock (une œuvre vendue disparaît même épinglée).
  const { data: epingles } = await supabase
    .from("artworks")
    .select(colonnes)
    .eq("status", "approved")
    .gt("stock", 0)
    .gt("featured_until", maintenant)
    .order("featured_until", { ascending: false })
    .limit(10);
    // epingle: true → la carte « tremble » sur l'accueil (façon iPhone).
  const liste = (epingles ?? []).map((x) => ({ ...x, epingle: true }));
  if (liste.length >= 10) return liste;

  // 2. Complément : les plus récentes.
  let auto = supabase
    .from("artworks")
    .select(colonnes)
    .eq("status", "approved")
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(10 - liste.length);
  if (liste.length) auto = auto.not("id", "in", exclure(liste.map((o) => o.id)));
  const { data } = await auto;
    return [...liste, ...(data ?? []).map((x) => ({ ...x, epingle: false }))];
}

// ══════════ AGENDA (3) ══════════
export async function getUpcomingEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag("events");

  const supabase = createPublicClient();
  const maintenant = new Date().toISOString();
  const colonnes = "id, title, starts_at, city, venue, link, featured_until";

  // 1. Épinglés et à venir (un événement passé disparaît même épinglé).
  const { data: epingles } = await supabase
    .from("events")
    .select(colonnes)
    .eq("status", "approved")
    .gte("starts_at", maintenant)
    .gt("featured_until", maintenant)
    .order("starts_at")
    .limit(3);
  const liste = epingles ?? [];
  if (liste.length >= 3) return liste;

  // 2. Complément : les plus proches.
  let auto = supabase
    .from("events")
    .select(colonnes)
    .eq("status", "approved")
    .gte("starts_at", maintenant)
    .order("starts_at")
    .limit(3 - liste.length);
  if (liste.length) auto = auto.not("id", "in", exclure(liste.map((e) => e.id)));
  const { data } = await auto;
  return [...liste, ...(data ?? [])];
}

// ══════════ OPPORTUNITÉS (3) ══════════
// La sécurité de la base ne renvoie déjà que les opportunités validées et non expirées.
export async function getOpenOpportunities() {
  "use cache";
  cacheLife("hours");
  cacheTag("opportunities");

  const supabase = createPublicClient();
  const maintenant = new Date().toISOString();
  const colonnes = "id, title, type, organizer, deadline, link, featured_until";

  const { data: epingles } = await supabase
    .from("opportunities")
    .select(colonnes)
    .gt("featured_until", maintenant)
    .order("deadline")
    .limit(3);
  const liste = epingles ?? [];
  if (liste.length >= 3) return liste;

  // Complément : les dates limites les plus proches.
  let auto = supabase.from("opportunities").select(colonnes).order("deadline").limit(3 - liste.length);
  if (liste.length) auto = auto.not("id", "in", exclure(liste.map((o) => o.id)));
  const { data } = await auto;
  return [...liste, ...(data ?? [])];
}

// ══════════ RESSOURCES (3) — nouveau : lues dans la base ══════════
export async function getHomeResources() {
  "use cache";
  cacheLife("hours");
  cacheTag("resources");

  const supabase = createPublicClient();
  const maintenant = new Date().toISOString();
  const colonnes = "id, slug, title, category, featured_until";

  const { data: epingles } = await supabase
    .from("resources")
    .select(colonnes)
    .eq("published", true)
    .gt("featured_until", maintenant)
    .order("featured_until", { ascending: false })
    .limit(3);
  const liste = epingles ?? [];
  if (liste.length >= 3) return liste;

  // Complément : les derniers guides publiés.
  let auto = supabase
    .from("resources")
    .select(colonnes)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3 - liste.length);
  if (liste.length) auto = auto.not("id", "in", exclure(liste.map((r) => r.id)));
  const { data } = await auto;
  return [...liste, ...(data ?? [])];
}

// ══════════ TAUX DE COMMISSION ══════════
export async function getCommissionRate() {
  "use cache";
  cacheLife("days");
  cacheTag("settings");
  const { data } = await createPublicClient().from("settings").select("commission_rate").single();
  return data?.commission_rate ?? 0.1;
}

