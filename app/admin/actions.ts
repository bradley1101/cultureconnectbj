// ─────────────────────────────────────────────────────────────
// Actions serveur du back-office : valider ou refuser
// un compte, une œuvre, un événement, une opportunité.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";

type Decision = "approved" | "rejected";

// Le bouton cliqué envoie decision=approved (Valider) ou decision=rejected (Refuser).
const lireDecision = (formData: FormData): Decision =>
  formData.get("decision") === "approved" ? "approved" : "rejected";

// ── Compte (artiste ou professionnel) ──
export async function deciderProfil(formData: FormData) {
  // Chaque action revérifie que c'est bien un admin (sécurité).
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const decision = lireDecision(formData);

  await supabase.from("profiles").update({ status: decision }).eq("id", id);

  // Case « Badge vérifié » cochée + validation → on active le badge bleu.
  if (decision === "approved" && formData.get("verifie") === "on") {
    await supabase.from("artists").update({ is_verified: true }).eq("id", id);
  }
  // Annuaire, accueil et profils publics se mettent à jour.
  updateTag("artists");
}

// ── Œuvre ──
export async function deciderOeuvre(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("artworks").update({ status: lireDecision(formData) }).eq("id", String(formData.get("id")));
  updateTag("artworks");
}

// ── Événement ──
export async function deciderEvenement(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").update({ status: lireDecision(formData) }).eq("id", String(formData.get("id")));
  updateTag("events");
}

// ── Opportunité ──
export async function deciderOpportunite(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("opportunities").update({ status: lireDecision(formData) }).eq("id", String(formData.get("id")));
  updateTag("opportunities");
}