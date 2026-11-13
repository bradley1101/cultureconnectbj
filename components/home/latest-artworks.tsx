// ─────────────────────────────────────────────────────────────
// Section « Œuvres à acquérir » de la page d'accueil.
// Affiche jusqu'à 10 œuvres validées et en stock (épinglées d'abord),
// lues dans la base Supabase, en rangée horizontale.
// ─────────────────────────────────────────────────────────────

// Image : composant de Next.js qui optimise les photos
// (taille adaptée à l'écran, chargement progressif).
import Image from "next/image";
// Link : lien interne rapide (pas de rechargement complet de la page).
import Link from "next/link";
import { ViewTransition } from "react";
// Fonction qui va chercher les œuvres dans la base (déjà dans lib/home-data.ts).
import { getLatestArtworks } from "@/lib/home-data";
import { Motif } from "@/components/motifs/motif";
import { GalerieHorizontale } from "@/components/motion/galerie-horizontale";
// Transforme un nombre en prix lisible : 150000 → « 150 000 FCFA ».
import { formatFcfa } from "@/lib/format";
// Construit l'adresse publique d'une image stockée dans Supabase.
import { storageUrl } from "@/lib/supabase/public";

// Fond beige rayé affiché tant qu'une œuvre n'a pas de photo
// (même style que les emplacements de la maquette).
const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

// « async » : le composant attend les données de la base avant de s'afficher.
// Il s'exécute sur le serveur, donc le visiteur reçoit une page déjà remplie.
export async function LatestArtworks() {
  // On récupère les œuvres (tableau vide s'il n'y en a pas encore).
  const oeuvres = await getLatestArtworks();

  return (
    // Bande beige (bg-sable) sur toute la largeur de l'écran.
    // relative isolate overflow-hidden : le filigrane reste derrière le contenu, sans dépasser.
    <section className="relative isolate overflow-hidden bg-sable">
      {/* Motif d'Abomey en filigrane : il se dessine pendant qu'on fait défiler. */}
      <Motif
        nom="buffle"
        anime="defilement"
        epaisseur={1.6}
        className="pointer-events-none absolute top-6 -right-8 lg:right-10 -z-10 w-56 text-terre/15 sm:w-80"
      />
      {/* Conteneur centré, largeur max 1280 px, marges de 24 px sur les côtés. */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-12">
        {/* ── En-tête de la section : titre + sous-titre à gauche, lien à droite ── */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 data-reveal="titre" className="font-display text-[40px] font-extrabold tracking-[-0.02em]">
              Œuvres à acquérir
            </h2>
            <p className="text-[17px] text-taupe">
              Commande et paiement Mobile Money via notre WhatsApp officiel.
            </p>
          </div>
          <Link href="/marketplace" className="font-bold text-terre hover:text-ebene">
            Toute la marketplace →
          </Link>
        </div>

        {/* ── S'il y a des œuvres : on affiche la rangée de cartes ── */}
        {oeuvres.length > 0 ? (
          // Rangée horizontale :
          //  • téléphone / tablette : on la fait glisser au doigt (snap = la carte se cale)
          //  • ordinateur (lg:) : elle glisse toute seule pendant qu'on défile (GalerieHorizontale)
          <GalerieHorizontale>
          <ul
            data-piste
            data-reveal="vague"
            className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:none] pointer-fine:cursor-grab"
          >
            {/* .map() répète le bloc ci-dessous pour chaque œuvre « o ». */}
            {oeuvres.map((o) => (
              // « key » : identifiant unique demandé par React pour chaque élément d'une liste.
              // Largeur fixe de chaque carte : 78 % de l'écran sur téléphone, 300 px sur tablette et ordinateur.
              <li key={o.id} data-epingle={o.epingle || undefined} className="w-[78%] shrink-0 snap-start sm:w-[300px]">
                {/* « group » permet d'animer l'image au survol de toute la carte. */}
                <article data-carte className="lumineux group flex h-full flex-col overflow-hidden rounded-[18px] bg-creme">
                  {/* Image cliquable. tabIndex={-1} et aria-hidden : on évite un lien
                      en double pour le clavier et les lecteurs d'écran (le titre est déjà un lien). */}
                  {/* Nom partagé avec la grande image de la fiche : la vignette « voyage » jusqu'à elle. */}
                  <ViewTransition name={`oeuvre-${o.slug}`} share="morph" default="none">
                  <Link
                    href={`/marketplace/${o.slug}`}
                    className={`relative block aspect-square overflow-hidden ${hachure}`}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {/* On n'affiche l'image que si l'œuvre en a au moins une. */}
                    {o.image_paths[0] && (
                      <Image
                        src={storageUrl("artworks", o.image_paths[0])}
                        alt=""
                        fill
                        // Indique au navigateur la taille réelle d'affichage
                        // pour qu'il télécharge une image ni trop grande ni trop petite.
                        sizes="(min-width: 640px) 300px, 78vw"
                        
                        className="object-cover"
                      />
                    )}
                  </Link>
                  </ViewTransition>

                  {/* ── Texte de la carte ── */}
                  <div className="flex flex-col gap-1.5 px-[18px] pt-4 pb-[18px]">
                    {/* Type d'œuvre en petites capitales, + « numérique » si c'est un fichier. */}
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-terre">
                      {o.category}
                      {o.kind === "digital" ? " · numérique" : ""}
                    </span>
                    {/* Titre de l'œuvre = lien vers sa fiche. */}
                    <h3 className="font-display text-[19px] font-bold">
                      <Link href={`/marketplace/${o.slug}`} className="hover:text-terre">
                        {o.title}
                      </Link>
                    </h3>
                    {/* Nom de l'artiste, s'il est disponible. */}
                    {o.artist && (
                      <span className="text-sm text-taupe">par {o.artist.stage_name}</span>
                    )}
                    {/* Prix affiché (commission déjà incluse). */}
                    <span className="mt-1.5 text-lg font-bold">{formatFcfa(o.price_fcfa)}</span>
                  </div>
                </article>
              </li>
            ))}
            {/* Dernière « carte » : le lien vers toute la marketplace */}
            <li className="w-[78%] shrink-0 snap-start sm:w-[300px]">
              <Link
                href="/marketplace"
                data-carte
                className="group flex h-full min-h-[300px] flex-col justify-between rounded-[18px] bg-terre p-7 text-sable"
              >
                <span className="text-xs font-bold tracking-[0.08em] uppercase text-or">Marketplace</span>
                <span className="font-display text-[32px] leading-tight font-extrabold">
                  Voir toutes les œuvres
                </span>
                <span className="grid size-12 place-items-center rounded-full bg-sable text-terre transition-transform duration-300 group-hover:translate-x-1.5">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </li>
          </ul>
          </GalerieHorizontale>
        ) : (
          // ── Sinon (base encore vide) : message d'attente avec lien vers l'inscription ──
          <p className="rounded-[18px] border border-dashed border-ligne bg-creme px-6 py-12 text-center text-taupe">
            Les premières œuvres arrivent bientôt. Vous êtes artiste ?{" "}
            <Link href="/inscription" className="font-bold text-terre underline underline-offset-4">
              Publiez les vôtres
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}