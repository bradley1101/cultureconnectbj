// ─────────────────────────────────────────────────────────────
// Marketplace, adresse : /marketplace
// Filtres dans l'adresse, ex. /marketplace?categorie=Tableau&prix=100000&tri=prix_asc
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { EtatVide } from "@/components/motifs/etat-vide";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArtworkCard } from "@/components/shared/artwork-card";
import { GrilleFlip } from "@/components/motion/grille-flip";
import { CATEGORIES, TRIS, type Tri, searchArtworks } from "@/lib/catalog-data";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Achetez des œuvres d'artistes béninois : tableaux, sculptures, photographies, musique.",
};

// Paliers proposés pour le prix maximum (en FCFA).
const PRIX = [25000, 50000, 100000, 250000, 500000];

type Props = { searchParams: Promise<{ categorie?: string; format?: string; prix?: string; tri?: string }> };

export default function MarketplacePage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        {/* ── Bandeau beige ── */}
        <section className="border-b border-ligne bg-sable">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 pt-14 pb-10">
            <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-none tracking-[-0.02em]">
              Marketplace
            </h1>
            <p className="max-w-[620px] text-lg text-taupe">
              Œuvres originales d&apos;artistes béninois. Commande et paiement Mobile Money via notre WhatsApp officiel.
            </p>
          </div>
        </section>

        {/* Le catalogue dépend de l'adresse : chargé à part. */}
        <Suspense fallback={<p className="mx-auto max-w-7xl px-6 py-16 text-taupe">Chargement des œuvres…</p>}>
          <Catalogue searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function Catalogue({ searchParams }: Props) {
  // Filtres lus dans l'adresse (valeurs par défaut si absents).
  const { categorie = "", format = "", prix = "", tri = "recent" } = await searchParams;

  // Sécurité : si « tri » n'est pas une valeur prévue, on revient à « recent ».
  const triValide: Tri = tri in TRIS ? (tri as Tri) : "recent";
  // Number("") = 0 → pas de limite de prix.
  const prixMax = Number(prix) > 0 ? Number(prix) : null;

  const oeuvres = await searchArtworks(categorie, format, prixMax, triValide);
  const filtreActif = Boolean(categorie || format || prixMax || triValide !== "recent");

  const champ =
    "min-h-11 rounded-[10px] border border-ligne bg-creme px-3.5 text-[15px] text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

  return (
    <section className="mx-auto max-w-7xl px-6 pt-8 pb-[72px]">
      {/* ── Filtres (formulaire GET : les choix vont dans l'adresse) ── */}
      <Form action="/marketplace" scroll={false} data-flip-filtres className="mb-8 flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
          <label htmlFor="categorie" className="text-sm font-bold">Catégorie</label>
          <select id="categorie" name="categorie" defaultValue={categorie} className={champ}>
            <option value="">Toutes</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-[1_1_160px] flex-col gap-1.5">
          <label htmlFor="format" className="text-sm font-bold">Format</label>
          <select id="format" name="format" defaultValue={format} className={champ}>
            <option value="">Tous</option>
            <option value="physical">Œuvre physique</option>
            <option value="digital">Œuvre numérique</option>
          </select>
        </div>

        <div className="flex min-w-0 flex-[1_1_160px] flex-col gap-1.5">
          <label htmlFor="prix" className="text-sm font-bold">Prix maximum</label>
          <select id="prix" name="prix" defaultValue={prix} className={champ}>
            <option value="">Sans limite</option>
            {PRIX.map((p) => (
              // toLocaleString : 100000 → « 100 000 ».
              <option key={p} value={p}>{p.toLocaleString("fr-FR")} FCFA</option>
            ))}
          </select>
        </div>

        <div className="flex min-w-0 flex-[1_1_160px] flex-col gap-1.5">
          <label htmlFor="tri" className="text-sm font-bold">Trier par</label>
          <select id="tri" name="tri" defaultValue={triValide} className={champ}>
            {/* Object.entries transforme TRIS en paires [code, texte]. */}
            {Object.entries(TRIS).map(([valeur, texte]) => (
              <option key={valeur} value={valeur}>{texte}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="min-h-11 cursor-pointer rounded-[10px] bg-ebene px-6 font-bold text-creme transition-colors hover:bg-terre">
          Filtrer
        </button>

        {filtreActif && (
          <Link href="/marketplace" scroll={false} className="flex min-h-11 items-center px-2 font-bold text-terre hover:text-ebene">
            Réinitialiser
          </Link>
        )}
      </Form>

      {/* Nombre d'œuvres (avec accord au pluriel). */}
      <p aria-live="polite" className="mb-6 text-taupe">
        {oeuvres.length} œuvre{oeuvres.length > 1 ? "s" : ""} disponible{oeuvres.length > 1 ? "s" : ""}
      </p>

      {/* ── Grille des œuvres, ou message si aucun résultat ── */}
      {oeuvres.length > 0 ? (
        <GrilleFlip className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {oeuvres.map((o) => (
            <li key={o.id} data-flip-id={o.id}>
              <ArtworkCard oeuvre={o} />
            </li>
          ))}
        </GrilleFlip>
      ) : (
        <EtatVide motif="cameleon">
          Aucune œuvre ne correspond à ces critères.
          {filtreActif && (
            <>
              {" "}
              <Link href="/marketplace" className="font-bold text-terre underline underline-offset-4">
                Voir toutes les œuvres
              </Link>
              .
            </>
          )}
        </EtatVide>
      )}
    </section>
  );
}