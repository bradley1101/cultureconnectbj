// ─────────────────────────────────────────────────────────────
// Actions serveur du portfolio : ajouter et retirer un élément.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { extension, verifierImage } from "@/lib/images";
import { getSession } from "@/lib/session";

export type EtatPortfolio = { erreur?: string; succes?: string };

// Nombre maximum d'éléments (prévu dans le cahier des charges).
const MAX = 20;

// ══════════════ AJOUTER ══════════════
export async function ajouterAuPortfolio(_: EtatPortfolio, formData: FormData): Promise<EtatPortfolio> {
  const { supabase, user, artiste } = await getSession();
  if (!artiste) return { erreur: "Créez d'abord votre profil d'artiste." };

  // Lecture des champs.
  const titre = String(formData.get("titre") ?? "").trim();
  const annee = Number(formData.get("annee")) || null;
  const lien = String(formData.get("lien") ?? "").trim();
  const image = formData.get("image") as File | null;
  const aUneImage = Boolean(image && image.size > 0);

  // Il faut au moins une image OU un lien.
  if (!aUneImage && !lien) return { erreur: "Ajoutez une image ou un lien (YouTube, Audiomack…)." };
  if (lien && !/^https:\/\/\S+$/.test(lien)) return { erreur: "Le lien doit commencer par https://" };
  const erreurImage = verifierImage(image);
  if (erreurImage) return { erreur: erreurImage };

  // Combien d'éléments l'artiste a déjà ? (count + head : on compte sans tout télécharger)
  const { count } = await supabase
    .from("portfolio_items")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", user.id);
  if ((count ?? 0) >= MAX) return { erreur: `Votre portfolio est complet (${MAX} éléments maximum). Retirez-en un d'abord.` };

  // Envoi de l'image dans le stockage « portfolio », dossier de l'artiste.
  let image_path: string | null = null;
  if (aUneImage && image) {
    image_path = `${user.id}/${Date.now()}.${extension(image)}`;
    const { error } = await supabase.storage.from("portfolio").upload(image_path, image, { contentType: image.type });
    if (error) return { erreur: "L'envoi de l'image a échoué. Réessayez." };
  }

  // Enregistrement. position = rang d'affichage (le nouvel élément va à la fin).
  const { error } = await supabase.from("portfolio_items").insert({
    artist_id: user.id,
    title: titre || null,
    year: annee,
    image_path,
    media_url: lien || null,
    position: (count ?? 0) + 1,
  });
  if (error) return { erreur: "L'ajout a échoué. Réessayez." };

  // La page publique de l'artiste doit se mettre à jour.
  updateTag(`artist-${artiste.slug}`);
  return { succes: "Ajouté au portfolio." };
}

// ══════════════ RETIRER ══════════════
export async function retirerDuPortfolio(formData: FormData) {
  const { supabase, user, artiste } = await getSession();
  // On ne supprime que si l'élément appartient bien à l'artiste.
  await supabase.from("portfolio_items").delete().eq("id", String(formData.get("id"))).eq("artist_id", user.id);
  if (artiste) updateTag(`artist-${artiste.slug}`);
}