// ─────────────────────────────────────────────────────────────
// Back-office › Ressources
// Liste des guides (publiés et brouillons) + bouton « Nouveau guide ».
//
// Navigation INSTANTANÉE : le titre et le bouton s'affichent tout de suite,
// la liste (lue dans la base) arrive dans un <Suspense>.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Ressources" };

// ── La page : titre + bouton, sans lecture de données → affichage immédiat.
export default function RessourcesAdminPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[36px] font-extrabold leading-none">Ressources</h1>
          <p className="text-taupe">Guides pratiques publiés dans la rubrique Ressources.</p>
        </div>
        <Link
          href="/admin/ressources/nouvelle"
          className="inline-flex min-h-12 items-center rounded-full bg-ebene px-[22px] font-bold text-creme hover:bg-terre"
        >
          + Nouveau guide
        </Link>
      </div>

      {/* Squelette pendant le chargement, puis la liste des guides. */}
      <Suspense fallback={<Squelette />}>
        <ListeGuides />
      </Suspense>
    </div>
  );
}

// ── Squelette : 3 lignes qui « pulsent ».
function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">Chargement des guides…</span>
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-24 animate-pulse rounded-[18px] bg-creme" />
      ))}
    </div>
  );
}

// ── Liste des guides (lecture de la base, dans le Suspense).
async function ListeGuides() {
  // Vérifie que l'utilisateur est admin (sinon redirection).
  const { supabase } = await requireAdmin();

  // Tous les guides, du plus récent au plus ancien.
  const { data } = await supabase
    .from("resources")
    .select("id, slug, title, category, published, created_at")
    .order("created_at", { ascending: false });
  const guides = data ?? [];

  if (guides.length === 0) {
    return <p className="rounded-[20px] bg-creme p-6 text-taupe">Aucun guide pour le moment.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {guides.map((g) => (
        <li key={g.id} className="flex flex-wrap items-center gap-4 rounded-[18px] bg-creme p-4">
          {/* Catégorie, titre et adresse publique */}
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-terre">{g.category}</span>
            <span className="font-bold">{g.title}</span>
            <span className="text-sm text-taupe">/ressources/{g.slug}</span>
          </div>

          {/* Badge Publié / Brouillon */}
          <span
            className={`rounded-full px-3 py-1 text-[13px] font-bold ${
              g.published ? "bg-[#E3EEDC] text-[#2E5A1C]" : "bg-sable text-taupe"
            }`}
          >
            {g.published ? "Publié" : "Brouillon"}
          </span>

          {/* « Voir » seulement si le guide est en ligne */}
          {g.published && (
            <Link href={`/ressources/${g.slug}`} className="text-sm font-bold text-terre hover:text-ebene">
              Voir
            </Link>
          )}
          <Link
            href={`/admin/ressources/${g.id}`}
            className="inline-flex min-h-10 items-center rounded-full border border-ligne px-4 text-sm hover:border-ebene"
          >
            Modifier
          </Link>
        </li>
      ))}
    </ul>
  );
}