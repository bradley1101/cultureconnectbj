// ─────────────────────────────────────────────────────────────
// Opportunités, adresse : /opportunites (filtre : /opportunites?type=residence)
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { EtatVide } from "@/components/motifs/etat-vide";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBanner } from "@/components/shared/page-banner";
import { formatDate, opportunityLabels } from "@/lib/format";
import { getOpportunities } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Opportunités",
  description: "Résidences, appels à projets, concours, bourses et formations pour les artistes béninois.",
};

type Props = { searchParams: Promise<{ type?: string }> };

export default function OpportunitesPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        <PageBanner
          titre="Opportunités"
          texte="Résidences, appels à projets, concours, bourses et formations ouverts aux artistes. Les offres expirées disparaissent automatiquement."
        />
        <Suspense fallback={<p className="mx-auto max-w-7xl px-6 py-16 text-taupe">Chargement des opportunités…</p>}>
          <ListeOpportunites searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function ListeOpportunites({ searchParams }: Props) {
  const { type = "" } = await searchParams;
    // Le compte à rebours « Encore X jours » dépend de l'heure actuelle.
  await connection();
  // Sécurité : on n'accepte que les types connus (residence, contest…).
  const typeValide = type in opportunityLabels ? type : "";
  const opportunites = await getOpportunities(typeValide);

  // Nombre de jours avant la date limite (fin de journée incluse).
  // 86 400 000 = nombre de millisecondes dans une journée.
  const joursRestants = (d: string) =>
    Math.ceil((new Date(d + "T23:59:59").getTime() - Date.now()) / 86_400_000);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-8 pb-[72px]">
      {/* ── Pastilles de filtre : des liens, la pastille active est brune ── */}
      <nav aria-label="Filtrer par type" className="mb-8">
        <ul className="flex flex-wrap gap-2.5">
          {/* On ajoute « Toutes » devant la liste des types. */}
          {[["", "Toutes"], ...Object.entries(opportunityLabels)].map(([valeur, texte]) => (
            <li key={valeur}>
              <Link
                href={valeur ? `/opportunites?type=${valeur}` : "/opportunites"}
                aria-current={typeValide === valeur ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-5 font-medium transition-colors ${
                  typeValide === valeur ? "border-ebene bg-ebene text-creme" : "border-ligne bg-sable hover:border-ocre"
                }`}
              >
                {texte}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {opportunites.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {opportunites.map((o) => {
            const j = joursRestants(o.deadline);
            return (
              <li key={o.id} className="flex flex-col gap-3 rounded-[20px] border border-ligne p-6">
                {/* Ligne du haut : type à gauche, compte à rebours à droite. */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-ebene px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] text-or">
                    {opportunityLabels[o.type]}
                  </span>
                  {/* Moins de 7 jours : le texte passe en terre cuite pour attirer l'œil. */}
                  <span className={`text-sm font-bold ${j <= 7 ? "text-terre" : "text-taupe"}`}>
                    {j <= 0 ? "Dernier jour" : `Encore ${j} jour${j > 1 ? "s" : ""}`}
                  </span>
                </div>
                <h2 className="font-display text-[22px] font-bold leading-[1.2]">{o.title}</h2>
                <p className="text-sm text-taupe">
                  {o.organizer} · Date limite : {formatDate(o.deadline)}
                </p>
                {o.description && <p className="leading-relaxed text-[#4A3426]">{o.description}</p>}
                {/* mt-auto : pousse les liens en bas de la carte. */}
                <div className="mt-auto flex flex-wrap gap-4 pt-2">
                  {o.link && (
                    <a href={o.link} target="_blank" rel="noopener noreferrer" className="font-bold text-terre underline underline-offset-4">
                      Voir l&apos;appel
                    </a>
                  )}
                  {o.contact && <span className="text-sm text-taupe">Contact : {o.contact}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
      <EtatVide motif="poisson">
        Aucune opportunité ouverte dans cette catégorie pour le moment.
        </EtatVide>
      )}
    </section>
  );
}