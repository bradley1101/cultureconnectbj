// ─────────────────────────────────────────────────────────────
// Actions serveur des commandes : avancer, annuler, noter.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { ETAPE_SUIVANTE, type StatutCommande } from "@/lib/commandes";

// ══════════════ PASSER À L'ÉTAPE SUIVANTE ══════════════
export async function avancerCommande(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  // Statut affiché au moment du clic.
  const actuel = String(formData.get("actuel")) as StatutCommande;
  const etape = ETAPE_SUIVANTE[actuel];
  if (!etape) return; // statut final : rien à faire

  // .eq("status", actuel) : on ne modifie QUE si la commande est encore à ce statut.
  // Un double clic ne peut donc pas sauter deux étapes.
  // .select("artwork_id") : on récupère l'œuvre concernée.
  const { data: commande } = await supabase
    .from("orders")
    .update({ status: etape.vers })
    .eq("id", id)
    .eq("status", actuel)
    .select("artwork_id")
    .maybeSingle();

  // Paiement reçu → une œuvre physique perd un exemplaire en stock.
  // (Stock 0 = elle disparaît automatiquement de la Marketplace.)
  if (commande && etape.vers === "paid") {
    const { data: oeuvre } = await supabase.from("artworks").select("kind, stock").eq("id", commande.artwork_id).single();
    if (oeuvre && oeuvre.kind === "physical" && oeuvre.stock > 0) {
      await supabase.from("artworks").update({ stock: oeuvre.stock - 1 }).eq("id", commande.artwork_id);
      updateTag("artworks");
    }
  }
}

// ══════════════ ANNULER ══════════════
// Seulement si la commande n'est pas encore payée (new ou confirmed).
export async function annulerCommande(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", String(formData.get("id")))
    .in("status", ["new", "confirmed"]);
}

// ══════════════ NOTE INTERNE ══════════════
// Ex. « MoMo n° 1234567 reçu le 12/11 » ou « Livré par Koffi ».
export async function noterCommande(formData: FormData) {
  const { supabase } = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim().slice(0, 500); // 500 caractères max
  await supabase.from("orders").update({ admin_note: note || null }).eq("id", String(formData.get("id")));
}