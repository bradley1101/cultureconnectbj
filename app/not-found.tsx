// ─────────────────────────────────────────────────────────────
// Page 404 : affichée quand une adresse n'existe pas
// (ou quand une page appelle notFound(), ex. artiste introuvable).
// Le requin du roi Béhanzin se dessine au centre.
// ─────────────────────────────────────────────────────────────
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motif } from "@/components/motifs/motif";

export default function PageIntrouvable() {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <Motif nom="requin" className="w-56 text-ocre sm:w-72" epaisseur={2.2} />
        <p className="mt-4 text-sm font-bold tracking-[0.2em] text-terre uppercase">Erreur 404</p>
        <h1 className="mt-3 font-display text-[40px] leading-tight font-extrabold tracking-[-0.02em] sm:text-[52px]">
          Cette page s&apos;est perdue en mer
        </h1>
        <p className="mt-4 max-w-md text-taupe">
          L&apos;adresse est peut-être mal écrite, ou la page a été retirée. Revenez sur la terre ferme :
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full bg-terre px-6 font-bold text-sable hover:bg-ebene"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex min-h-12 items-center rounded-full border border-ligne px-6 font-bold hover:text-terre"
          >
            Voir les œuvres
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}