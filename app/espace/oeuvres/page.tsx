// ─────────────────────────────────────────────────────────────
// Liste des œuvres de l'artiste, adresse : /espace/oeuvres
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
  import { Suspense } from "react";
  import { Squelette } from "@/components/espace/squelette";
import Image from "next/image";
import Link from "next/link";
import { retirerOeuvre } from "./actions";
import { formatFcfa } from "@/lib/format";
import { getSession } from "@/lib/session";
import { storageUrl } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Mes œuvres" };

// Statut de validation → texte et couleurs de la pastille.
const STATUTS = {
  pending: { texte: "En attente de validation", style: "bg-[#FBE7C6] text-[#6B3E00]" },
  approved: { texte: "En ligne", style: "bg-[#E3EEDC] text-[#2E5A1C]" },
  rejected: { texte: "Refusée", style: "bg-[#F3E1DC] text-terre" },
} as const;

// « ?publiee=1 » dans l'adresse = on revient juste de la publication.
type Props = { searchParams: Promise<{ publiee?: string }> };

// La page s'affiche tout de suite (titre + squelette), puis le contenu
// lu dans la base remplace le squelette dès qu'il est prêt.
export default function MesOeuvresPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<Squelette titre="Mes œuvres en vente" sousTitre="Chaque œuvre est validée avant sa mise en ligne." />}>
      <ContenuMesOeuvres searchParams={searchParams} />
    </Suspense>
  );
}

// Contenu réel de la page (lecture de la base).
async function ContenuMesOeuvres({ searchParams }: Props) {
  const { supabase, user, artiste } = await getSession();
  const { publiee } = await searchParams;

  // Toutes les œuvres de l'artiste, les plus récentes d'abord.
  const { data } = await supabase
    .from("artworks")
    .select("id, slug, title, category, price_fcfa, stock, status, image_paths, created_at")
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false });
  const oeuvres = data ?? [];

  return (
    <div className="flex flex-col gap-7">
      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[36px] font-extrabold leading-none">Mes œuvres en vente</h1>
          <p className="text-taupe">Chaque œuvre est validée avant sa mise en ligne.</p>
        </div>
        {artiste && (
          <Link href="/espace/oeuvres/nouvelle" className="inline-flex min-h-12 items-center rounded-full bg-ebene px-[22px] font-bold text-creme hover:bg-terre">
            + Publier une œuvre
          </Link>
        )}
      </div>

      {/* Message de confirmation après publication. */}
      {publiee && (
        <p role="status" className="rounded-2xl bg-indigo px-5 py-4 font-bold text-sable">
          Œuvre envoyée ! Elle sera en ligne dès que notre équipe l&apos;aura validée.
        </p>
      )}

      {/* ── 3 cas : pas de fiche artiste / aucune œuvre / liste ── */}
      {!artiste ? (
        <p className="rounded-2xl border-2 border-dashed border-ocre px-5 py-4">
          Créez d&apos;abord votre{" "}
          <Link href="/espace/profil" className="font-bold text-terre underline">profil d&apos;artiste</Link> pour publier des œuvres.
        </p>
      ) : oeuvres.length === 0 ? (
        <p className="rounded-[18px] border border-dashed border-ligne bg-creme px-6 py-12 text-center text-taupe">
          Vous n&apos;avez encore publié aucune œuvre.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {oeuvres.map((o) => {
            // Stock 0 = vendue ou retirée (prioritaire sur le statut de validation).
            const s = o.stock === 0 ? { texte: "Vendue / retirée", style: "bg-sable text-taupe" } : STATUTS[o.status];
            return (
              <li key={o.id} className="flex flex-wrap items-center gap-4 rounded-[18px] bg-creme p-4">
                {/* Miniature */}
                <span className="relative size-20 flex-none overflow-hidden rounded-xl bg-[#E9D9C2]">
                  {o.image_paths[0] && (
                    <Image src={storageUrl("artworks", o.image_paths[0])} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </span>

                {/* Titre, catégorie, prix (+ nombre d'exemplaires s'il y en a plusieurs). */}
                <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
                  <span className="font-bold">{o.title}</span>
                  <span className="text-sm text-taupe">
                    {o.category} · {formatFcfa(o.price_fcfa)}
                    {o.stock > 1 && o.stock < 999 ? ` · ${o.stock} exemplaires` : ""}
                  </span>
                </div>

                {/* Pastille de statut */}
                <span className={`rounded-full px-3 py-1 text-[13px] font-bold ${s.style}`}>{s.texte}</span>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* « Voir » : seulement si l'œuvre est en ligne. */}
                  {o.status === "approved" && o.stock > 0 && (
                    <Link href={`/marketplace/${o.slug}`} className="text-sm font-bold text-terre hover:text-ebene">Voir</Link>
                  )}
                  {/* « Retirer » : petit formulaire qui envoie l'id de l'œuvre à l'action. */}
                  {o.stock > 0 && (
                    <form action={retirerOeuvre}>
                      <input type="hidden" name="id" value={o.id} />
                      <button type="submit" className="min-h-10 cursor-pointer rounded-full border border-ligne px-4 text-sm hover:border-terre hover:text-terre">
                        Retirer
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}