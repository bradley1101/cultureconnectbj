// ─────────────────────────────────────────────────────────────
// Agenda culturel, adresse : /agenda (filtre : /agenda?ville=Cotonou)
// Les événements à venir, regroupés par mois.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { EtatVide } from "@/components/motifs/etat-vide";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBanner } from "@/components/shared/page-banner";
import { VILLES } from "@/lib/directory-data"; // même liste de villes que l'annuaire
import { formatDay } from "@/lib/format";
import { getEvents } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Agenda culturel",
  description: "Concerts, expositions, spectacles : les prochains événements culturels au Bénin.",
};

type Props = { searchParams: Promise<{ ville?: string }> };

export default function AgendaPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        <PageBanner
          titre="Agenda culturel"
          texte="Concerts, expositions, spectacles, festivals : les prochains rendez-vous de la culture au Bénin."
        />
        <Suspense fallback={<p className="mx-auto max-w-7xl px-6 py-16 text-taupe">Chargement de l&apos;agenda…</p>}>
          <ListeEvenements searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function ListeEvenements({ searchParams }: Props) {
  const { ville = "" } = await searchParams;
  const evenements = await getEvents(ville);

  // Regroupement par mois : on range chaque événement sous « novembre 2026 », etc.
  // Une Map garde l'ordre d'ajout, donc les mois restent dans l'ordre chronologique.
  const parMois = new Map<string, typeof evenements>();
  for (const e of evenements) {
    const mois = new Date(e.starts_at).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
      timeZone: "Africa/Porto-Novo", // heure du Bénin
    });
    parMois.set(mois, [...(parMois.get(mois) ?? []), e]);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pt-8 pb-[72px]">
      {/* ── Filtre par ville ── */}
      <form action="/agenda" className="mb-8 flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-[0_1_260px] flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-bold">Ville</label>
          <select id="ville" name="ville" defaultValue={ville} className="min-h-11 rounded-[10px] border border-ligne bg-creme px-3.5 text-[15px]">
            <option value="">Toutes les villes</option>
            {VILLES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="min-h-11 cursor-pointer rounded-[10px] bg-ebene px-6 font-bold text-creme hover:bg-terre">
          Filtrer
        </button>
        {ville && (
          <Link href="/agenda" className="flex min-h-11 items-center px-2 font-bold text-terre hover:text-ebene">
            Réinitialiser
          </Link>
        )}
      </form>

      {parMois.size > 0 ? (
        <div className="flex flex-col gap-12">
          {/* [...parMois] transforme la Map en liste de paires [mois, événements]. */}
          {[...parMois].map(([mois, liste]) => (
            <div key={mois}>
              {/* capitalize : « novembre 2026 » → « Novembre 2026 » */}
              <h2 className="mb-4 font-display text-[28px] font-extrabold capitalize">{mois}</h2>
              <ul className="flex flex-col gap-3.5">
                {liste.map((e) => {
                  const { day, month, time } = formatDay(e.starts_at);
                  return (
                    <li key={e.id} className="flex flex-wrap items-start gap-5 rounded-[20px] border border-ligne p-5">
                      {/* Calendrier indigo : jour + mois */}
                      <div className="w-[72px] flex-none rounded-xl bg-indigo py-2.5 text-center text-sable">
                        <div className="font-display text-[28px] font-extrabold leading-none">{day}</div>
                        <div className="text-xs font-bold uppercase">{month}</div>
                      </div>
                      {/* Infos de l'événement */}
                      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1.5">
                        <h3 className="text-xl font-bold">{e.title}</h3>
                        <p className="text-taupe">
                          {time} · {e.venue ? `${e.venue}, ` : ""}
                          {e.city}
                        </p>
                        {/* Artiste lié (si l'événement en a un), cliquable. */}
                        {e.artist && (
                          <Link href={`/artistes/${e.artist.slug}`} className="self-start font-bold text-terre hover:text-ebene">
                            {e.artist.stage_name}
                          </Link>
                        )}
                        {e.description && <p className="mt-1 leading-relaxed text-[#4A3426]">{e.description}</p>}
                        {e.link && (
                          <a href={e.link} target="_blank" rel="noopener noreferrer" className="self-start font-bold text-terre underline underline-offset-4">
                            Plus d&apos;infos
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <EtatVide motif="buffle">
          Aucun événement à venir{ville ? ` à ${ville}` : ""} pour le moment.
        </EtatVide>
      )}
    </section>
  );
}