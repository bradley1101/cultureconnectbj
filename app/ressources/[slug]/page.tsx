// ─────────────────────────────────────────────────────────────
// Page de lecture d'un guide, adresse : /ressources/[slug]
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatDate } from "@/lib/format";
import { getResourceBySlug } from "@/lib/pages-data";

type Params = { params: Promise<{ slug: string }> };

// Titre de l'onglet = titre du guide.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const g = await getResourceBySlug(slug);
  return g ? { title: g.title, description: g.excerpt ?? undefined } : { title: "Guide introuvable" };
}

export default function GuidePage({ params }: Params) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        <Suspense fallback={<p className="mx-auto max-w-3xl px-6 py-24 text-taupe">Chargement du guide…</p>}>
          <Guide params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function Guide({ params }: Params) {
  const { slug } = await params;
  const g = await getResourceBySlug(slug);
  if (!g) notFound(); // guide inexistant ou non publié → 404

  return (
    // max-w-3xl : colonne étroite (~770 px), plus confortable pour lire un long texte.
    <article className="mx-auto max-w-3xl px-6 pt-10 pb-[72px]">
      <Link href="/ressources" className="font-bold text-terre hover:text-ebene">
        ← Tous les guides
      </Link>
      <p className="mt-8 text-[13px] font-bold uppercase tracking-[0.08em] text-terre">{g.category}</p>
      <h1 className="mt-3 font-display text-[clamp(32px,5vw,48px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
        {g.title}
      </h1>
      {g.published_at && <p className="mt-4 text-sm text-taupe">Publié le {formatDate(g.published_at)}</p>}
      {/* Chapeau : résumé en plus gros, avant le texte. */}
      {g.excerpt && <p className="mt-6 text-xl leading-relaxed text-taupe">{g.excerpt}</p>}
      {/* Texte du guide. whitespace-pre-line respecte les retours à la ligne
          tapés dans le back-office (paragraphes). */}
      <div className="mt-8 whitespace-pre-line text-[17px] leading-[1.75] text-[#3A2618]">{g.content}</div>
    </article>
  );
}