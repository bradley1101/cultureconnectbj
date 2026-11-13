// ─────────────────────────────────────────────────────────────
// Statuts de validation (comptes, œuvres, événements, opportunités) :
// texte affiché et couleurs de la pastille. Partagé par le back-office.
// ─────────────────────────────────────────────────────────────

import type { Enums } from "@/lib/supabase/database.types";

// Type qui vaut "pending" | "approved" | "rejected".
export type StatutValidation = Enums<"review_status">;

export const STATUTS_VALIDATION: Record<StatutValidation, { texte: string; style: string }> = {
  pending: { texte: "En attente", style: "bg-[#FBE7C6] text-[#6B3E00]" },
  approved: { texte: "Validé", style: "bg-[#E3EEDC] text-[#2E5A1C]" },
  rejected: { texte: "Refusé", style: "bg-[#F3E1DC] text-terre" },
};

// Petite pastille de statut réutilisable.
export function Pastille({ statut }: { statut: StatutValidation }) {
  const s = STATUTS_VALIDATION[statut];
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[13px] font-bold ${s.style}`}>{s.texte}</span>;
}