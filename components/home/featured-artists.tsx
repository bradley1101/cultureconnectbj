// ─────────────────────────────────────────────────────────────
// Section « Artistes à la une » de la page d'accueil.
// Jusqu'à 10 artistes (épinglés d'abord), en rangée horizontale :
//  • ordinateur : la section se fige et les portraits glissent pendant qu'on défile
//  • téléphone / tablette : on fait glisser la rangée au doigt
// ─────────────────────────────────────────────────────────────
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { getFeaturedArtists } from "@/lib/home-data";
import { Motif } from "@/components/motifs/motif";
import { GalerieHorizontale } from "@/components/motion/galerie-horizontale";
import { storageUrl } from "@/lib/supabase/public";

const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

export async function FeaturedArtists() {
  const artistes = await getFeaturedArtists();

  return (
    // Section sur toute la largeur : overflow-hidden coupe proprement la rangée
    // qui dépasse sur les côtés (sinon la page défilerait de travers).
    <section className="overflow-hidden">
      {/* relative isolate : le motif en filigrane se place derrière le contenu. */}
      <div className="relative isolate mx-auto max-w-7xl px-6 py-12">
        {/* Motif d'Abomey en filigrane : il se dessine pendant qu'on fait défiler. */}
        <Motif
          nom="lion"
          anime="defilement"
          epaisseur={1.6}
          className="pointer-events-none absolute top-0 right-0 lg:right-6 -z-10 w-56 text-terre/15 sm:w-80"
        />
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 data-reveal="titre" className="font-display text-[40px] font-extrabold tracking-[-0.02em]">
            Artistes à la une
          </h2>
          <Link href="/artistes" className="font-bold text-terre hover:text-ebene">
            Voir l&apos;annuaire →
          </Link>
        </div>

        {artistes.length > 0 ? (
          // Même rangée horizontale que « Œuvres à acquérir » (voir GalerieHorizontale).
          <GalerieHorizontale>
          <ul
            data-piste
            data-reveal="vague"
            className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] pointer-fine:cursor-grab"
          >
            {artistes.map((a) => (
              // Largeur fixe : 70 % de l'écran sur téléphone, 260 px sur tablette et ordinateur.
              <li key={a.id} data-epingle={a.epingle || undefined} className="w-[70%] shrink-0 snap-start sm:w-[260px]">
                <Link href={`/artistes/${a.slug}`} data-carte className="group flex flex-col gap-3">
                  {/* Nom partagé avec la photo du profil : la photo « voyage » jusqu'à elle. */}
                  <ViewTransition name={`artiste-${a.slug}`} share="morph" default="none">
                  <div className={`lumineux relative aspect-[4/5] overflow-hidden rounded-[18px] ${hachure}`}>
                    {a.avatar_path && (
                      <Image
                        src={storageUrl("avatars", a.avatar_path)}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 260px, 70vw"
                        
                        className="object-cover"
                      />
                    )}
                  </div>
                  </ViewTransition>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold">{a.stage_name}</span>
                    {a.is_verified && (
                      <svg width="18" height="18" viewBox="0 0 24 24" role="img" aria-label="Artiste vérifié">
                        <circle cx="12" cy="12" r="10" fill="#23395B" />
                        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#FCFAF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[15px] text-taupe">
                    {[a.disciplines[0], a.city].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
            {/* Dernière « carte » : le lien vers tout l'annuaire (même hauteur que les portraits) */}
            <li className="w-[70%] shrink-0 snap-start sm:w-[260px]">
              <Link
                href="/artistes"
                data-carte
                className="group flex aspect-[4/5] flex-col justify-between rounded-[18px] bg-indigo p-7 text-sable"
              >
                <span className="text-xs font-bold tracking-[0.08em] uppercase text-or">Annuaire</span>
                <span className="font-display text-[30px] leading-tight font-extrabold">
                  Découvrir tous les artistes
                </span>
                <span className="grid size-12 place-items-center rounded-full bg-sable text-indigo transition-transform duration-300 group-hover:translate-x-1.5">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </li>
          </ul>
          </GalerieHorizontale>
        ) : (
          <p className="rounded-[18px] border border-dashed border-ligne px-6 py-12 text-center text-taupe">
            Les premiers artistes arrivent bientôt.{" "}
            <Link href="/inscription" className="font-bold text-terre underline underline-offset-4">
              Créez votre profil
            </Link>{" "}
            pour être parmi eux.
          </p>
        )}
      </div>
    </section>
  );
}