// ─────────────────────────────────────────────────────────────
// Statuts des commandes : textes, couleurs et ordre du circuit.
// Partagé par la page admin (et réutilisable dans l'espace artiste).
// ─────────────────────────────────────────────────────────────

import type { Enums } from "@/lib/supabase/database.types";

// Type qui vaut "new" | "confirmed" | "paid" | "delivered" | "artist_paid" | "cancelled".
export type StatutCommande = Enums<"order_status">;

// Statut → texte affiché et couleurs de la pastille.
export const STATUTS_COMMANDE: Record<StatutCommande, { texte: string; style: string }> = {
  new: { texte: "Nouvelle", style: "bg-sable text-ebene" },
  confirmed: { texte: "Confirmée", style: "bg-[#FBE7C6] text-[#6B3E00]" },
  paid: { texte: "Payée", style: "bg-[#DCE4F0] text-indigo" },
  delivered: { texte: "Livrée", style: "bg-[#E3EEDC] text-[#2E5A1C]" },
  artist_paid: { texte: "Artiste payé", style: "bg-ebene text-or" },
  cancelled: { texte: "Annulée", style: "bg-[#F3E1DC] text-terre" },
};

// Circuit : pour chaque statut, le statut suivant et le texte du bouton.
// « Partial » : les statuts finaux (artist_paid, cancelled) n'ont pas d'étape suivante.
export const ETAPE_SUIVANTE: Partial<Record<StatutCommande, { vers: StatutCommande; bouton: string }>> = {
  new: { vers: "confirmed", bouton: "Confirmer" },
  confirmed: { vers: "paid", bouton: "Marquer payée" },
  paid: { vers: "delivered", bouton: "Marquer livrée" },
  delivered: { vers: "artist_paid", bouton: "Reverser à l'artiste" },
};