// ─────────────────────────────────────────────────────────────
// Actions serveur des œuvres de l'artiste : publier et retirer.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { extension, verifierImage } from "@/lib/images";
import { getSession } from "@/lib/session";

export type EtatOeuvre = { erreur?: string };

// Même fonction que pour le profil : « Soleil de Ouidah » → « soleil-de-ouidah ».
function versSlug(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// ══════════════ PUBLIER UNE ŒUVRE ══════════════
export async function publierOeuvre(_: EtatOeuvre, formData: FormData): Promise<EtatOeuvre> {
  const { supabase, user, artiste } = await getSession();
  // Une œuvre doit appartenir à une fiche artiste.
  if (!artiste) return { erreur: "Créez d'abord votre profil d'artiste." };

  // ── 1. Lecture des champs ──
  const titre = String(formData.get("titre") ?? "").trim();
  const format = formData.get("format") === "digital" ? "digital" : "physical";
  const categorie = String(formData.get("categorie") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const technique = String(formData.get("technique") ?? "").trim();
  const dimensions = String(formData.get("dimensions") ?? "").trim();
  const annee = Number(formData.get("annee")) || null; // vide → null
  const prix = Math.round(Number(formData.get("prix"))); // arrondi au franc
  // Numérique : stock « illimité » (999). Physique : au moins 1 exemplaire.
  const stock = format === "digital" ? 999 : Math.max(1, Math.round(Number(formData.get("stock")) || 1));
  // Photos choisies (on ignore les champs vides).
  const photos = (formData.getAll("photos") as File[]).filter((f) => f.size > 0);

  // ── 2. Vérifications ──
  if (titre.length < 2) return { erreur: "Indiquez le titre de l'œuvre." };
  if (!CATEGORIES.includes(categorie)) return { erreur: "Choisissez une catégorie." };
  if (!Number.isFinite(prix) || prix < 1000) return { erreur: "Le prix doit être d'au moins 1 000 FCFA." };
  if (annee && (annee < 1900 || annee > new Date().getFullYear())) return { erreur: "Année invalide." };
  if (photos.length === 0) return { erreur: "Ajoutez au moins une photo de l'œuvre." };
  if (photos.length > 4) return { erreur: "4 photos maximum." };
  for (const p of photos) {
    const e = verifierImage(p);
    if (e) return { erreur: e };
  }

  // ── 3. Envoi des photos dans le stockage « artworks », dossier de l'artiste ──
  const chemins: string[] = [];
  // entries() donne le numéro (i) de chaque photo : 1, 2, 3, 4.
  for (const [i, photo] of photos.entries()) {
    const chemin = `${user.id}/${Date.now()}-${i + 1}.${extension(photo)}`;
    const { error } = await supabase.storage.from("artworks").upload(chemin, photo, { contentType: photo.type });
    if (error) return { erreur: "L'envoi d'une photo a échoué. Réessayez." };
    chemins.push(chemin);
  }

  // ── 4. Enregistrement ──
  // Adresse unique : titre + 4 caractères au hasard (ex. soleil-de-ouidah-k3x9).
  const slug = `${versSlug(titre) || "oeuvre"}-${Math.random().toString(36).slice(2, 6)}`;
  // Le statut n'est pas envoyé : la base le force à « pending » (en attente).
  const { error } = await supabase.from("artworks").insert({
    artist_id: user.id,
    slug,
    title: titre,
    kind: format,
    category: categorie,
    description: description || null,
    technique: technique || null,
    dimensions: dimensions || null,
    year: annee,
    price_fcfa: prix,
    stock,
    image_paths: chemins,
  });
  if (error) return { erreur: "La publication a échoué. Réessayez." };

  // ── 5. Cache vidé, puis retour à la liste avec un message de confirmation ──
  updateTag("artworks");
  redirect("/espace/oeuvres?publiee=1");
}

// ══════════════ RETIRER UNE ŒUVRE ══════════════
export async function retirerOeuvre(formData: FormData) {
  const { supabase, user } = await getSession();
  const id = String(formData.get("id") ?? "");

  // On essaie de supprimer (seulement si elle appartient bien à l'artiste).
  const { error } = await supabase.from("artworks").delete().eq("id", id).eq("artist_id", user.id);

  // 23503 = l'œuvre est liée à des commandes : on ne peut pas l'effacer
  // (il faut garder l'historique), donc on la met simplement hors vente (stock 0).
  if (error?.code === "23503") {
    await supabase.from("artworks").update({ stock: 0 }).eq("id", id).eq("artist_id", user.id);
  }

  updateTag("artworks");
  redirect("/espace/oeuvres");
}