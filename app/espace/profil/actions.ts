// ─────────────────────────────────────────────────────────────
// Action serveur : crée ou met à jour la fiche artiste
// (textes + envoi des photos dans le stockage Supabase).
// ─────────────────────────────────────────────────────────────
"use server";

// updateTag : vide le cache des pages publiques concernées
// pour que les changements apparaissent tout de suite.
import { updateTag } from "next/cache";
import { DISCIPLINES, VILLES } from "@/lib/constants";
import { extension, verifierImage } from "@/lib/images";
import { getSession } from "@/lib/session";

export type EtatProfil = { erreur?: string; succes?: string };

// Réseaux sociaux acceptés (= noms des champs du formulaire).
const RESEAUX = ["youtube", "instagram", "facebook", "tiktok", "audiomack", "applemusic", "spotify"] as const;

// Transforme un nom en adresse web : « Kofi Mensah-Adé » → « kofi-mensah-ade ».
function versSlug(texte: string) {
  return texte
    .normalize("NFD") // sépare les lettres de leurs accents (é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // tout ce qui n'est pas lettre/chiffre → « - »
    .replace(/^-+|-+$/g, "") // pas de « - » au début ni à la fin
    .slice(0, 50); // 50 caractères maximum
}

export async function enregistrerProfil(_: EtatProfil, formData: FormData): Promise<EtatProfil> {
  // Personne connectée (si personne → renvoi vers /connexion).
  const { supabase, user, artiste } = await getSession();

  // ── 1. Lecture des champs ──
  const nomDeScene = String(formData.get("nomDeScene") ?? "").trim();
  // getAll : toutes les cases cochées. On ne garde que les disciplines connues (sécurité).
  const disciplines = formData.getAll("disciplines").map(String).filter((d) => DISCIPLINES.includes(d));
  const ville = String(formData.get("ville") ?? "");
  const bio = String(formData.get("bio") ?? "").trim();
  const photo = formData.get("photo") as File | null;
  const banniere = formData.get("banniere") as File | null;

  // ── 2. Vérifications ──
  if (nomDeScene.length < 2) return { erreur: "Indiquez votre nom d'artiste." };
  if (disciplines.length === 0) return { erreur: "Choisissez au moins une discipline." };
  if (disciplines.length > 3) return { erreur: "3 disciplines maximum." };
  if (!VILLES.includes(ville)) return { erreur: "Choisissez votre ville." };
  if (bio.length > 1500) return { erreur: "La biographie ne doit pas dépasser 1 500 caractères." };

  // Liens des réseaux : on ignore les vides, et on exige https:// (sécurité).
  const reseaux: Record<string, string> = {};
  for (const r of RESEAUX) {
    const url = String(formData.get(r) ?? "").trim();
    if (!url) continue;
    if (!/^https:\/\/\S+$/.test(url)) return { erreur: `Le lien ${r} doit commencer par https://` };
    reseaux[r] = url;
  }

  // « ?? » : si la photo est correcte (null), on vérifie la bannière.
  const erreurImage = verifierImage(photo) ?? verifierImage(banniere);
  if (erreurImage) return { erreur: erreurImage };

  // ── 3. Envoi des images dans le stockage ──
  // Chemin : <id de l'artiste>/photo-<horodatage>.jpg
  // La base n'autorise l'envoi QUE dans le dossier portant son propre id.
  async function envoyer(fichier: File | null, bucket: "avatars" | "covers", nom: string) {
    if (!fichier || fichier.size === 0) return undefined; // pas de nouvelle image
    const chemin = `${user.id}/${nom}-${Date.now()}.${extension(fichier)}`;
    const { error } = await supabase.storage.from(bucket).upload(chemin, fichier, { contentType: fichier.type });
    if (error) throw new Error("upload");
    return chemin;
  }

  let avatar_path: string | undefined;
  let banner_path: string | undefined;
  try {
    avatar_path = await envoyer(photo, "avatars", "photo");
    banner_path = await envoyer(banniere, "covers", "banniere");
  } catch {
    return { erreur: "L'envoi de l'image a échoué. Réessayez." };
  }

  // ── 4. Données à enregistrer ──
  // « ...(condition && {...}) » : ajoute le champ seulement si une nouvelle image a été envoyée.
  const donnees = {
    stage_name: nomDeScene,
    disciplines,
    city: ville,
    bio: bio || null,
    social_links: reseaux,
    ...(avatar_path && { avatar_path }),
    ...(banner_path && { banner_path }),
  };

  let slug = artiste?.slug;

  if (artiste) {
    // ── 5a. Fiche existante : mise à jour (l'adresse ne change pas) ──
    const { error } = await supabase.from("artists").update(donnees).eq("id", user.id);
    if (error) return { erreur: "L'enregistrement a échoué. Réessayez." };
  } else {
    // ── 5b. Nouvelle fiche : création avec une adresse unique ──
    // Si « kofi-mensah » est déjà pris, on essaie « kofi-mensah-x7k2 », etc.
    const base = versSlug(nomDeScene) || "artiste";
    for (let essai = 0; essai < 3; essai++) {
      const candidat = essai === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { error } = await supabase.from("artists").insert({ id: user.id, slug: candidat, ...donnees });
      if (!error) {
        slug = candidat;
        break;
      }
      // 23505 = « déjà utilisé » ; toute autre erreur est un vrai problème.
      if (error.code !== "23505") return { erreur: "La création du profil a échoué. Réessayez." };
    }
    if (!slug) return { erreur: "Ce nom d'artiste est déjà très utilisé. Essayez une variante." };
  }

  // ── 6. On vide le cache : annuaire, accueil et page publique de l'artiste ──
  updateTag("artists");
  if (slug) updateTag(`artist-${slug}`);

  return {
    succes: artiste ? "Profil mis à jour." : "Profil créé ! Il sera visible publiquement après validation par notre équipe.",
  };
}