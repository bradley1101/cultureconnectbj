// ─────────────────────────────────────────────────────────────
// Back-office › Ressources › Modifier un guide
//
// Navigation INSTANTANÉE : le lien retour et le titre s'affichent tout de suite,
// le formulaire (rempli avec le guide lu dans la base) arrive dans un <Suspense>.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { supprimerRessource } from "../actions";
import { FormRessource } from "@/components/admin/form-ressource";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Modifier le guide" };

// L'identifiant du guide vient de l'URL : /admin/ressources/<id>
type Props = { params: Promise<{ id: string }> };

// ── La page : lien retour + titre → affichage immédiat.
export default function ModifierGuidePage({ params }: Props) {
  return (
    <div className="flex max-w-4xl flex-col gap-7">
      <Link href="/admin/ressources" className="font-bold text-terre hover:text-ebene">← Ressources</Link>
      <h1 className="font-display text-[36px] font-extrabold leading-none">Modifier le guide</h1>

      <Suspense fallback={<Squelette />}>
        <Edition params={params} />
      </Suspense>
    </div>
  );
}

// ── Squelette : quelques champs + la zone de contenu qui « pulsent ».
function Squelette() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Chargement du guide…</span>
      <div className="h-14 animate-pulse rounded-xl bg-creme" />
      <div className="h-14 animate-pulse rounded-xl bg-creme" />
      <div className="h-80 animate-pulse rounded-[20px] bg-creme" />
    </div>
  );
}

// ── Formulaire d'édition + zone de suppression (lecture de la base, dans le Suspense).
async function Edition({ params }: Props) {
  // Vérifie que l'utilisateur est admin (sinon redirection).
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const { data: ressource } = await supabase
    .from("resources")
    .select("id, title, category, slug, excerpt, content, published")
    .eq("id", id)
    .maybeSingle();

  // Guide introuvable → page 404.
  if (!ressource) notFound();

  return (
    <>
      <FormRessource ressource={ressource} />

      {/* Zone « danger » : suppression définitive */}
      <form
        action={supprimerRessource}
        className="flex flex-wrap items-center gap-3 rounded-[20px] border-2 border-dashed border-[#E1CEB4] p-5"
      >
        <input type="hidden" name="id" value={ressource.id} />
        <span className="flex-[1_1_260px] text-taupe">
          Supprimer définitivement ce guide. Cette action est irréversible.
        </span>
        <button
          type="submit"
          className="min-h-10 cursor-pointer rounded-full border border-terre px-4 text-sm font-bold text-terre hover:bg-terre hover:text-creme"
        >
          Supprimer
        </button>
      </form>
    </>
  );
}