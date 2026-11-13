// ─────────────────────────────────────────────────────────────
// Annuaire des artistes, adresse : /artistes
// Les filtres sont dans l'adresse, ex. /artistes?discipline=Danse&ville=Cotonou
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { EtatVide } from "@/components/motifs/etat-vide";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArtistCard } from "@/components/shared/artist-card";
import { GrilleFlip } from "@/components/motion/grille-flip";
import { DISCIPLINES, VILLES, searchArtists } from "@/lib/directory-data";

// Titre de l'onglet et description pour Google.
export const metadata: Metadata = {
  title: "Annuaire des artistes",
  description: "Trouvez un artiste béninois par discipline et par ville.",
};

// « searchParams » = ce qui suit le « ? » dans l'adresse.
type Props = { searchParams: Promise<{ q?: string; discipline?: string; ville?: string }> };

export default function ArtistesPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        {/* ── Bandeau beige avec le titre ── */}
        <section className="border-b border-ligne bg-sable">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 pt-14 pb-10">
            {/* clamp() : taille du titre qui s'adapte à l'écran (36 px à 56 px). */}
            <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-none tracking-[-0.02em]">
              Annuaire des artistes
            </h1>
            <p className="max-w-[620px] text-lg text-taupe">
              Musiciens, peintres, sculpteurs, danseurs… Trouvez un artiste béninois par discipline et par ville.
            </p>
          </div>
        </section>

        {/* Les résultats dépendent de l'adresse : chargés à part, avec un message d'attente. */}
        <Suspense fallback={<p className="mx-auto max-w-7xl px-6 py-16 text-taupe">Chargement de l&apos;annuaire…</p>}>
          <Resultats searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function Resultats({ searchParams }: Props) {
  // On lit les filtres de l'adresse (vides par défaut).
  const { q = "", discipline = "", ville = "" } = await searchParams;
  const artistes = await searchArtists(q, discipline, ville);
  // Au moins un filtre utilisé ? (pour afficher « Réinitialiser »)
  const filtreActif = Boolean(q || discipline || ville);

  // Style commun aux 3 champs du formulaire.
  const champ =
    "min-h-11 rounded-[10px] border border-ligne bg-creme px-3.5 text-[15px] text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

  return (
    <section className="mx-auto max-w-7xl px-6 pt-8 pb-[72px]">
      {/* ── Formulaire de filtres ──
          action="/artistes" sans « method » = GET : en cliquant sur Filtrer,
          le navigateur recharge /artistes?q=…&discipline=…&ville=…
          defaultValue : les champs gardent ce qui a été choisi. */}
      <Form action="/artistes" scroll={false} data-flip-filtres role="search" className="mb-8 flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-[2_1_260px] flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-bold">Nom ou ville</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Ex. Cotonou, Zinsou…" className={champ} />
        </div>

        <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
          <label htmlFor="discipline" className="text-sm font-bold">Discipline</label>
          <select id="discipline" name="discipline" defaultValue={discipline} className={champ}>
            <option value="">Toutes</option>
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-bold">Ville</label>
          <select id="ville" name="ville" defaultValue={ville} className={champ}>
            <option value="">Toutes</option>
            {VILLES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="min-h-11 cursor-pointer rounded-[10px] bg-ebene px-6 font-bold text-creme transition-colors hover:bg-terre">
          Filtrer
        </button>

        {/* Lien pour tout effacer, seulement si un filtre est actif. */}
        {filtreActif && (
          <Link href="/artistes" scroll={false} className="flex min-h-11 items-center px-2 font-bold text-terre hover:text-ebene">
            Réinitialiser
          </Link>
        )}
      </Form>

      {/* Nombre de résultats (accord au pluriel). aria-live : annoncé par les lecteurs d'écran. */}
      <p aria-live="polite" className="mb-6 text-taupe">
        {artistes.length} artiste{artistes.length > 1 ? "s" : ""}
        {filtreActif ? " trouvé" + (artistes.length > 1 ? "s" : "") : ""}
      </p>

      {/* ── Grille des artistes, ou message si aucun résultat ── */}
      {artistes.length > 0 ? (
        <GrilleFlip className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-5 gap-y-10">
          {artistes.map((a) => (
            <li key={a.id} data-flip-id={a.id}>
              <ArtistCard artiste={a} />
            </li>
          ))}
        </GrilleFlip>
      ) : (
        <EtatVide motif="lion">
          Aucun artiste ne correspond à cette recherche.
          {filtreActif && (
            <>
              {" "}
              <Link href="/artistes" className="font-bold text-terre underline underline-offset-4">
                Voir tous les artistes
              </Link>
              .
            </>
          )}
        </EtatVide>
      )}
    </section>
  );
}