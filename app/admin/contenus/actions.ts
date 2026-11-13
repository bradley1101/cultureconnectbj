// ─────────────────────────────────────────────────────────────
// Actions serveur de la rubrique « Contenus » (back-office) :
// publier / masquer et supprimer les événements et opportunités.
// (Pour les œuvres, on réutilise les actions de la fiche artiste.)
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import type { Etat } from "@/app/admin/artistes/actions";
import { requireAdmin } from "@/lib/admin";

// « approved » = publié sur le site ; tout le reste = masqué (refusé).
const lireStatut = (formData: FormData) => (formData.get("statut") === "approved" ? "approved" : "rejected");

// ── Événement : publier ou masquer ──
export async function changerStatutEvenement(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").update({ status: lireStatut(formData) }).eq("id", String(formData.get("id")));
  updateTag("events");
}

// ── Opportunité : publier ou masquer ──
export async function changerStatutOpportunite(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("opportunities").update({ status: lireStatut(formData) }).eq("id", String(formData.get("id")));
  updateTag("opportunities");
}

// ── Opportunité : supprimer ──
export async function supprimerOpportunite(_avant: Etat, formData: FormData): Promise<Etat> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("opportunities").delete().eq("id", String(formData.get("id")));
  if (error) return { erreur: "La suppression a échoué. Réessayez." };
  updateTag("opportunities");
  return {};
}