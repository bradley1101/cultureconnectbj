// ─────────────────────────────────────────────────────────────
// Récupère la personne connectée, son profil et sa fiche artiste.
// Utilisé par toutes les pages de l'espace personnel.
// Si personne n'est connecté → renvoi vers /connexion.
// ─────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
// cache() de React : si plusieurs morceaux de la page appellent getSession()
// pendant le même affichage, Supabase n'est interrogé qu'UNE fois.
// connection() : indique que ce code dépend de la visite en cours
// (personne connectée, heure actuelle) → jamais préparé à l'avance.
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getSession = cache(async () => {
    // À placer en premier : tout ce qui suit est calculé au moment de la visite.
  await connection();
  const supabase = await createClient();

  // 1. Qui est connecté ? (vérifié auprès de Supabase)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // 2. Son profil (nom, rôle, statut) et sa fiche artiste, lus en même temps.
  //    maybeSingle() : la fiche artiste peut ne pas encore exister → null.
  const [{ data: profil }, { data: artiste }] = await Promise.all([
    supabase.from("profiles").select("full_name, role, status").eq("id", user.id).single(),
    supabase.from("artists").select("slug, stage_name, avatar_path, bio, is_verified").eq("id", user.id).maybeSingle(),
  ]);
  if (!profil) redirect("/connexion");

  // On renvoie aussi « supabase » pour que les pages puissent faire leurs propres lectures
  // avec les droits de la personne connectée.
  return { supabase, user, profil, artiste };
});