// ─────────────────────────────────────────────────────────────
// Page Portfolio de l'artiste, adresse : /espace/portfolio
// Formulaire d'ajout + grille des éléments.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
  import { Suspense } from "react";
  import { Squelette } from "@/components/espace/squelette";
import Image from "next/image";
import Link from "next/link";
import { retirerDuPortfolio } from "./actions";
import { FormPortfolio } from "@/components/espace/form-portfolio";
import { getSession } from "@/lib/session";
import { storageUrl } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Portfolio" };

// La page s'affiche tout de suite (titre + squelette), puis le contenu
// lu dans la base remplace le squelette dès qu'il est prêt.
export default function PortfolioPage() {
  return (
    <Suspense fallback={<Squelette titre="Portfolio" sousTitre="Jusqu'à 20 images et des liens audio ou vidéo." />}>
      <ContenuPortfolio />
    </Suspense>
  );
}

// Contenu réel de la page (lecture de la base).
async function ContenuPortfolio() {
  const { supabase, user, artiste } = await getSession();

  // Éléments du portfolio, dans l'ordre d'affichage.
  const { data } = await supabase
    .from("portfolio_items")
    .select("id, title, year, image_path, media_url")
    .eq("artist_id", user.id)
    .order("position");
  const elements = data ?? [];

  return (
    <div className="flex max-w-5xl flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Portfolio</h1>
        {/* Compteur : 3/20 utilisés */}
        <p className="text-taupe">Jusqu&apos;à 20 images et des liens audio ou vidéo. {elements.length}/20 utilisés.</p>
      </div>

      {!artiste ? (
        <p className="rounded-2xl border-2 border-dashed border-ocre px-5 py-4">
          Créez d&apos;abord votre <Link href="/espace/profil" className="font-bold text-terre underline">profil d&apos;artiste</Link>.
        </p>
      ) : (
        // <> … </> : on renvoie deux blocs (formulaire + grille).
        <>
          <FormPortfolio />

          {elements.length > 0 ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {elements.map((e) => (
                <li key={e.id} className="flex flex-col overflow-hidden rounded-[18px] bg-creme">
                  {/* Image, ou mention « Lien audio / vidéo » si l'élément n'a qu'un lien. */}
                  <span className="relative block aspect-square bg-[#E9D9C2]">
                    {e.image_path ? (
                      <Image src={storageUrl("portfolio", e.image_path)} alt="" fill sizes="240px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-taupe">Lien audio / vidéo</span>
                    )}
                  </span>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="font-bold">
                      {e.title ?? "Sans titre"}
                      {e.year ? <span className="font-normal text-taupe"> · {e.year}</span> : null}
                    </span>
                    {/* truncate : coupe les liens trop longs avec « … » */}
                    {e.media_url && (
                      <a href={e.media_url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-terre underline">
                        {e.media_url}
                      </a>
                    )}
                    <form action={retirerDuPortfolio}>
                      <input type="hidden" name="id" value={e.id} />
                      <button type="submit" className="min-h-10 cursor-pointer rounded-full border border-ligne px-4 text-sm hover:border-terre hover:text-terre">
                        Retirer
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-[18px] border border-dashed border-ligne bg-creme px-6 py-10 text-center text-taupe">Votre portfolio est vide.</p>
          )}
        </>
      )}
    </div>
  );
}