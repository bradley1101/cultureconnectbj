// ─────────────────────────────────────────────────────────────
// Actions serveur de la fiche artiste (back-office) :
// statut du compte, badge vérifié, et suppressions
// (œuvre, élément du portfolio, événement, artiste entier).
// Chaque action revérifie que la personne est admin.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

// Réponse affichée sous un bouton de suppression (message d'erreur).
export type Etat = { erreur?: string };

// Code d'erreur Postgres quand une ligne est encore utilisée ailleurs
// (ex. une œuvre qui a des commandes).
const ENCORE_UTILISE = "23503";

// ── Statut du compte : valider, suspendre (= refusé) ou remettre en attente ──
export async function changerStatutArtiste(formData: FormData) {
  const { supabase } = await requireAdmin();
  const statut = String(formData.get("statut"));
  if (!["approved", "rejected", "pending"].includes(statut)) return;
  await supabase
    .from("profiles")
    .update({ status: statut as "approved" | "rejected" | "pending" })
    .eq("id", String(formData.get("id")));
  // Le profil ET ses œuvres apparaissent / disparaissent du site.
  updateTag("artists");
  updateTag("artworks");
}

// ── Badge « Artiste vérifié » : on l'active ou on le retire ──
export async function basculerBadge(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("artists")
    .update({ is_verified: formData.get("actuel") !== "true" })
    .eq("id", String(formData.get("id")));
  updateTag("artists");
}

// ── Œuvre : publier ou masquer (sans la supprimer) ──
export async function changerStatutOeuvre(formData: FormData) {
  const { supabase } = await requireAdmin();
  const statut = formData.get("statut") === "approved" ? "approved" : "rejected";
  await supabase.from("artworks").update({ status: statut }).eq("id", String(formData.get("id")));
  updateTag("artworks");
}

// ── Supprimer une œuvre (et ses images) ──
export async function supprimerOeuvre(_avant: Etat, formData: FormData): Promise<Etat> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));

  // On lit les images avant de supprimer la ligne.
  const { data: oeuvre } = await supabase.from("artworks").select("image_paths").eq("id", id).single();
  const { error } = await supabase.from("artworks").delete().eq("id", id);
  if (error) {
    return {
      erreur:
        error.code === ENCORE_UTILISE
          ? "Cette œuvre a des commandes : elle ne peut pas être supprimée. Masquez-la plutôt."
          : "La suppression a échoué. Réessayez.",
    };
  }
  if (oeuvre?.image_paths.length) await supabase.storage.from("artworks").remove(oeuvre.image_paths);
  updateTag("artworks");
  return {};
}

// ── Supprimer un élément du portfolio (et son image) ──
export async function supprimerPortfolio(_avant: Etat, formData: FormData): Promise<Etat> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: element } = await supabase.from("portfolio_items").select("image_path").eq("id", id).single();
  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) return { erreur: "La suppression a échoué. Réessayez." };
  if (element?.image_path) await supabase.storage.from("portfolio").remove([element.image_path]);
  updateTag("artists"); // le portfolio s'affiche sur le profil public
  return {};
}

// ── Supprimer un événement (et son affiche) ──
export async function supprimerEvenement(_avant: Etat, formData: FormData): Promise<Etat> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: evenement } = await supabase.from("events").select("cover_path").eq("id", id).single();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { erreur: "La suppression a échoué. Réessayez." };
  if (evenement?.cover_path) await supabase.storage.from("covers").remove([evenement.cover_path]);
  updateTag("events");
  return {};
}

// ── Supprimer l'artiste ENTIER : compte, profil, œuvres, portfolio, événements, fichiers ──
export async function supprimerArtiste(_avant: Etat, formData: FormData): Promise<Etat> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));

  // 1. On repère ses fichiers (chaque artiste a un dossier à son nom dans chaque espace de stockage).
  const espaces = ["avatars", "portfolio", "artworks", "covers"] as const;
  const fichiers = await Promise.all(
    espaces.map(async (espace) => {
      const { data } = await supabase.storage.from(espace).list(id, { limit: 1000 });
      return { espace, chemins: (data ?? []).map((f) => `${id}/${f.name}`) };
    }),
  );

  // 2. Suppression dans la base (fonction sécurisée, qui refuse s'il y a des commandes).
  const { error } = await supabase.rpc("admin_delete_artist", { p_id: id });
  if (error) {
    if (error.message.includes("A_DES_COMMANDES")) {
      return { erreur: "Cet artiste a des commandes : il ne peut pas être supprimé. Suspendez-le plutôt." };
    }
    return { erreur: error.message || "La suppression a échoué. Réessayez." };
  }

  // 3. On efface ses fichiers.
  await Promise.all(
    fichiers.filter((f) => f.chemins.length).map((f) => supabase.storage.from(f.espace).remove(f.chemins)),
  );

  updateTag("artists");
  updateTag("artworks");
  updateTag("events");
  // Retour à la liste (la fiche n'existe plus).
  redirect("/admin/artistes");
}