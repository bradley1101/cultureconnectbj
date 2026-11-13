// ─────────────────────────────────────────────────────────────
// Actions serveur des événements : proposer et annuler.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { VILLES } from "@/lib/constants";
import { getSession } from "@/lib/session";

export type EtatEvenement = { erreur?: string; succes?: string };

// ══════════════ PROPOSER ══════════════
export async function proposerEvenement(_: EtatEvenement, formData: FormData): Promise<EtatEvenement> {
  const { supabase, user, artiste } = await getSession();

  const titre = String(formData.get("titre") ?? "").trim();
  // Le champ date+heure renvoie « 2026-11-20T19:30 » (sans fuseau horaire).
  const dateHeure = String(formData.get("dateHeure") ?? "");
  const ville = String(formData.get("ville") ?? "");
  const lieu = String(formData.get("lieu") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const lien = String(formData.get("lien") ?? "").trim();

  if (titre.length < 3) return { erreur: "Indiquez le nom de l'événement." };

  // On précise l'heure du Bénin (+01:00) pour que l'heure enregistrée soit la bonne.
  const debut = new Date(`${dateHeure}:00+01:00`);
  if (!dateHeure || Number.isNaN(debut.getTime())) return { erreur: "Indiquez la date et l'heure." };
  if (debut.getTime() < Date.now()) return { erreur: "La date doit être dans le futur." };
  if (!VILLES.includes(ville)) return { erreur: "Choisissez la ville." };
  if (lien && !/^https:\/\/\S+$/.test(lien)) return { erreur: "Le lien doit commencer par https://" };

  // Statut non envoyé : la base le met automatiquement « en attente ».
  const { error } = await supabase.from("events").insert({
    submitted_by: user.id,
    // Si la personne a une fiche artiste, l'événement est lié à son profil.
    artist_id: artiste ? user.id : null,
    title: titre,
    starts_at: debut.toISOString(),
    city: ville,
    venue: lieu || null,
    description: description || null,
    link: lien || null,
  });
  if (error) return { erreur: "L'envoi a échoué. Réessayez." };

  updateTag("events");
  return { succes: "Événement envoyé ! Il apparaîtra dans l'agenda après validation." };
}

// ══════════════ ANNULER ══════════════
export async function annulerEvenement(formData: FormData) {
  const { supabase, user } = await getSession();
  // Seulement un événement proposé par la personne connectée.
  await supabase.from("events").delete().eq("id", String(formData.get("id"))).eq("submitted_by", user.id);
  updateTag("events");
}