// ─────────────────────────────────────────────────────────────
// Liste des guides, adresse : /ressources
// Classés par catégorie (Droits d'auteur, Streaming, Financements…).
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBanner } from "@/components/shared/page-banner";
import { getResources } from "@/lib/pages-data";

export const metadata: Metadata = {
  title: "Ressources",
  description: "Guides pratiques pour les artistes béninois : droits d'auteur, streaming, financements.",
};

export default function RessourcesPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        <PageBanner
          titre="Ressources pour les artistes"
          texte="Guides pratiques pour protéger, diffuser et financer votre travail : droits d'auteur, BUBEDRA, streaming, bourses."
        />
        <Suspense fallback={<p className="mx-auto max-w-7xl px-6 py-16 text-taupe">Chargement des guides…</p>}>
          <ListeGuides />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function ListeGuides() {
  const guides = await getResources();

  // Regroupement par catégorie (même principe que les mois de l'agenda).
  const parCategorie = new Map<string, typeof guides>();
  for (const g of guides) parCategorie.set(g.category, [...(parCategorie.get(g.category) ?? []), g]);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10 pb-[72px]">
      {parCategorie.size > 0 ? (
        <div className="flex flex-col gap-12">
          {[...parCategorie].map(([categorie, liste]) => (
            <div key={categorie}>
              {/* Nom de la catégorie en petites capitales terre cuite. */}
              <h2 className="mb-5 text-[13px] font-bold uppercase tracking-[0.08em] text-terre">{categorie}</h2>
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
                {liste.map((g) => (
                  <li key={g.id}>
                    <Link href={`/ressources/${g.slug}`} className="flex h-full flex-col gap-2.5 rounded-[20px] border border-ligne p-7 transition-colors hover:border-ocre">
                      <span className="font-display text-[22px] font-bold leading-[1.2]">{g.title}</span>
                      {/* Résumé court du guide, s'il existe. */}
                      {g.excerpt && <span className="leading-relaxed text-taupe">{g.excerpt}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-[18px] border border-dashed border-ligne px-6 py-12 text-center text-taupe">
          Les premiers guides sont en cours de rédaction.
        </p>
      )}
    </section>
  );
}