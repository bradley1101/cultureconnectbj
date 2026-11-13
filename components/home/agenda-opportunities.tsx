// ─────────────────────────────────────────────────────────────
// Double bloc de l'accueil : « Agenda culturel » (carte indigo, à gauche)
// et « Opportunités » (carte beige, à droite).
// Les deux listes sont lues dans la base Supabase.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
// Fonctions de lecture déjà présentes dans lib/home-data.ts :
// - les 3 prochains événements validés
// - les 3 opportunités ouvertes (validées et dont la date limite n'est pas passée)
import { getOpenOpportunities, getUpcomingEvents } from "@/lib/home-data";
// Outils de mise en forme :
// - formatDay : « 2026-11-14 » → { day: "14", month: "nov." }
// - formatDate : « 2026-11-30 » → « 30 novembre 2026 »
// - opportunityLabels : « residence » → « Résidence », etc.
import { formatDate, formatDay, opportunityLabels } from "@/lib/format";

export async function AgendaOpportunities() {
  // Promise.all lance les deux lectures en même temps (plus rapide
  // que de les faire l'une après l'autre).
  const [evenements, opportunites] = await Promise.all([
    getUpcomingEvents(),
    getOpenOpportunities(),
  ]);

  return (
    // Les deux cartes côte à côte ; « flex-wrap » les empile sur téléphone.
    <section data-reveal="vague" className="mx-auto flex max-w-7xl flex-wrap gap-6 px-6 pb-[72px]">
      {/* ═════════ Carte de gauche : AGENDA (fond indigo) ═════════ */}
      <div data-tremble className="lumineux flex min-w-0 flex-[1_1_480px] flex-col gap-5 rounded-3xl bg-indigo p-8 text-sable">
        {/* En-tête de la carte : titre + lien */}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[30px] font-extrabold">Agenda culturel</h2>
          <Link href="/agenda" className="font-bold text-or hover:underline">
            Tout l&apos;agenda →
          </Link>
        </div>

        {evenements.length > 0 ? (
          <ul className="flex flex-col">
            {evenements.map((e) => {
              // On découpe la date de l'événement en jour + mois pour le petit calendrier.
              const { day, month } = formatDay(e.starts_at);
              return (
                <li
                  key={e.id}
                  // Fine ligne de séparation claire au-dessus de chaque événement.
                  className="flex items-center gap-[18px] border-t border-sable/20 py-[18px]"
                >
                  {/* Petit bloc « calendrier » beige : jour en gros, mois en dessous. */}
                  <div className="w-16 flex-none rounded-xl bg-sable py-2 text-center text-ebene">
                    <div className="font-display text-2xl font-extrabold leading-none">{day}</div>
                    <div className="text-xs font-bold uppercase">{month}</div>
                  </div>
                  {/* Nom de l'événement + lieu et ville. */}
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-[17px] font-bold">{e.title}</span>
                    <span className="text-sm text-[#D4C6B2]">
                      {/* Si le lieu est renseigné, on l'affiche avant la ville. */}
                      {e.venue ? `${e.venue} · ` : ""}
                      {e.city}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          // Message si aucun événement n'est encore publié.
          <p className="border-t border-sable/20 pt-5 text-[#D4C6B2]">
            Aucun événement annoncé pour le moment.
          </p>
        )}
      </div>

      {/* ═════════ Carte de droite : OPPORTUNITÉS (fond beige) ═════════ */}
      <div data-tremble className="lumineux flex min-w-0 flex-[1_1_480px] flex-col gap-5 rounded-3xl bg-sable p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[30px] font-extrabold">Opportunités</h2>
          <Link href="/opportunites" className="font-bold text-terre hover:text-ebene">
            Toutes les opportunités →
          </Link>
        </div>

        {opportunites.length > 0 ? (
          <ul className="flex flex-col">
            {opportunites.map((o) => (
              <li key={o.id} className="flex flex-col gap-1.5 border-t border-[#E1CEB4] py-[18px]">
                {/* Pastille du type : Résidence, Concours, Bourse… */}
                <span className="self-start rounded-full bg-ebene px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] text-or">
                  {opportunityLabels[o.type]}
                </span>
                <span className="text-[17px] font-bold">{o.title}</span>
                <span className="text-sm text-taupe">
                  {o.organizer} · Date limite : {formatDate(o.deadline)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          // Message si aucune opportunité n'est ouverte.
          <p className="border-t border-[#E1CEB4] pt-5 text-taupe">
            Résidences, concours, bourses : les prochains appels seront publiés ici.
          </p>
        )}
      </div>
    </section>
  );
}