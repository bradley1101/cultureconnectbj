// ─────────────────────────────────────────────────────────────
// Actions serveur : épingler / désépingler un élément sur l'accueil.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Liste fermée des sections : nom envoyé par le formulaire → table et cache.
// Sécurité : on n'accepte QUE ces 5 valeurs (impossible de viser une autre table).
const SECTIONS = {
  artistes: { table: "artists", tag: "artists" },
  oeuvres: { table: "artworks", tag: "artworks" },
  agenda: { table: "events", tag: "events" },
  opportunites: { table: "opportunities", tag: "opportunities" },
  ressources: { table: "resources", tag: "resources" },
} as const;
type Section = keyof typeof SECTIONS;

function lireSection(formData: FormData) {
  const s = String(formData.get("section"));
  return s in SECTIONS ? SECTIONS[s as Section] : null;
}

// ══════════ ÉPINGLER ══════════
export async function epingler(formData: FormData) {
  const { supabase } = await requireAdmin();
  const section = lireSection(formData);
  const id = String(formData.get("id") ?? "");
  if (!section || !id) return;

  // Durée choisie : 7 ou 30 jours, ou 0 = « sans limite » (on met l'an 2100).
  const jours = Number(formData.get("duree"));
  const jusquau = jours > 0 ? new Date(Date.now() + jours * 86_400_000) : new Date("2100-01-01T00:00:00Z");

  await supabase.from(section.table).update({ featured_until: jusquau.toISOString() }).eq("id", id);
  // L'accueil se met à jour immédiatement.
  updateTag(section.tag);
}

// ══════════ DÉSÉPINGLER ══════════
// featured_until = null → l'élément redevient « automatique ».
export async function desepingler(formData: FormData) {
  const { supabase } = await requireAdmin();
  const section = lireSection(formData);
  if (!section) return;
  await supabase.from(section.table).update({ featured_until: null }).eq("id", String(formData.get("id")));
  updateTag(section.tag);
}