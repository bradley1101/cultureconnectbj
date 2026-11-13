// ─────────────────────────────────────────────────────────────
// Page « Mes événements », adresse : /espace/evenements
// Formulaire + liste des événements proposés par la personne.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
  import { Suspense } from "react";
  import { Squelette } from "@/components/espace/squelette";
import { annulerEvenement } from "./actions";
import { FormEvenement } from "@/components/espace/form-evenement";
import { formatDay } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Mes événements" };

// Statut → texte et couleurs de la pastille.
const STATUTS = {
  pending: { texte: "En attente de validation", style: "bg-[#FBE7C6] text-[#6B3E00]" },
  approved: { texte: "Publié", style: "bg-[#E3EEDC] text-[#2E5A1C]" },
  rejected: { texte: "Refusé", style: "bg-[#F3E1DC] text-terre" },
} as const;

// La page s'affiche tout de suite (titre + squelette), puis le contenu
// lu dans la base remplace le squelette dès qu'il est prêt.
export default function MesEvenementsPage() {
  return (
    <Suspense fallback={<Squelette titre="Mes événements" sousTitre="Proposez vos concerts, expositions et spectacles." />}>
      <ContenuMesEvenements />
    </Suspense>
  );
}

// Contenu réel de la page (lecture de la base).
async function ContenuMesEvenements() {
  const { supabase, user } = await getSession();

  // Événements proposés par la personne, du plus récent au plus ancien.
  const { data } = await supabase
    .from("events")
    .select("id, title, starts_at, city, venue, status")
    .eq("submitted_by", user.id)
    .order("starts_at", { ascending: false });
  const evenements = data ?? [];
  const maintenant = Date.now();

  return (
    <div className="flex max-w-4xl flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Mes événements</h1>
        <p className="text-taupe">
          Proposez vos concerts, expositions et spectacles. Ils apparaissent dans l&apos;agenda après validation.
        </p>
      </div>

      <FormEvenement />

      {evenements.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {evenements.map((e) => {
            const { day, month, time } = formatDay(e.starts_at);
            // Événement déjà passé ?
            const passe = new Date(e.starts_at).getTime() < maintenant;
            return (
              // opacity-60 : un événement passé est grisé.
              <li key={e.id} className={`flex flex-wrap items-center gap-4 rounded-[18px] bg-creme p-4 ${passe ? "opacity-60" : ""}`}>
                {/* Petit calendrier brun */}
                <div className="w-16 flex-none rounded-xl bg-ebene py-2 text-center text-sable">
                  <div className="font-display text-2xl font-extrabold leading-none">{day}</div>
                  <div className="text-xs font-bold uppercase">{month}</div>
                </div>
                <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
                  <span className="font-bold">{e.title}</span>
                  <span className="text-sm text-taupe">
                    {time} · {e.venue ? `${e.venue}, ` : ""}
                    {e.city}
                    {passe ? " · passé" : ""}
                  </span>
                </div>
                <span className={`rounded-full px-3 py-1 text-[13px] font-bold ${STATUTS[e.status].style}`}>{STATUTS[e.status].texte}</span>
                {/* On ne peut annuler qu'un événement à venir. */}
                {!passe && (
                  <form action={annulerEvenement}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="min-h-10 cursor-pointer rounded-full border border-ligne px-4 text-sm hover:border-terre hover:text-terre">
                      Annuler
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-[18px] border border-dashed border-ligne bg-creme px-6 py-10 text-center text-taupe">
          Aucun événement proposé pour le moment.
        </p>
      )}
    </div>
  );
} 