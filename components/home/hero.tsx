// ─────────────────────────────────────────────────────────────
// Grand bandeau de l'accueil : photo d'artiste en fond + voile marron.
// Le contenu reste rendu côté serveur ; l'animation d'entrée est gérée
// par <HeroMotion> grâce aux attributs data-hero="…".
// ─────────────────────────────────────────────────────────────

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { getFeaturedArtists, getLatestArtworks } from "@/lib/home-data";
import { formatFcfa } from "@/lib/format";
import { storageUrl } from "@/lib/supabase/public";
import { HeroMotion } from "@/components/motion/hero-motion";
import { Frise } from "@/components/motion/frise";

const disciplines = [
  "Musique",
  "Arts visuels",
  "Danse",
  "Littérature",
  "Artisanat d'art",
];

// ── Photo de fond du bandeau ─────────────────────────────────
// Deux photos : paysage pour ordinateur, portrait pour téléphone.
// getImageProps : Next.js prépare des versions optimisées (WebP/AVIF,
// plusieurs tailles) ; <picture> choisit la bonne selon l'écran.
const photoCommune = { alt: "", sizes: "100vw" } as const;
const {
  props: { srcSet: photoPaysage },
} = getImageProps({ ...photoCommune, src: "/images/bandeau-ordinateur.jpg", width: 1376, height: 768 });
const {
  props: { srcSet: photoPortrait, ...photoReste },
} = getImageProps({ ...photoCommune, src: "/images/bandeau-mobile.jpg", width: 768, height: 1376, priority: true });

function PhotoDeFond() {
  return (
    // aria-hidden : image purement décorative (le texte du bandeau suffit).
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <picture>
        {/* Écran plus large que haut (ordinateur, tablette couchée) → photo paysage. */}
        <source media="(orientation: landscape)" srcSet={photoPaysage} />
        {/* Sinon (téléphone) → photo portrait. */}
        <source media="(orientation: portrait)" srcSet={photoPortrait} />
        {/* landscape:-scale-x-100 : sur ordinateur (écran en largeur), la photo est
            retournée en miroir, donc le peintre passe de la droite à la gauche.
            Sur téléphone (écran en hauteur), la photo verticale reste telle quelle. */}
        <img {...photoReste} alt="" className="size-full object-cover landscape:-scale-x-100" />
      </picture>
      {/* Voile marron transparent : on voit la photo, le texte reste lisible.
          Ordinateur : plus foncé à gauche (côté texte). Téléphone : plus foncé en haut. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(43_26_16/0.85)_0%,rgb(43_26_16/0.7)_55%,rgb(43_26_16/0.45)_100%)] landscape:bg-[linear-gradient(90deg,rgb(43_26_16/0.88)_0%,rgb(43_26_16/0.7)_45%,rgb(43_26_16/0.4)_100%)]" />
    </div>
  );
}

// « async » : le bandeau va chercher un artiste et une œuvre dans la base
// (les mêmes listes que les sections « à la une », déjà en cache).
export async function Hero() {
  const [artistes, oeuvres] = await Promise.all([getFeaturedArtists(), getLatestArtworks()]);
  // Le premier artiste qui a une photo, et la première œuvre qui a une image
  // (les épinglés passent en premier dans ces listes).
  const artiste = artistes.find((a) => a.avatar_path);
  const oeuvre = oeuvres.find((o) => o.image_paths[0]);

  return (
    // relative + isolate : la photo (-z-10) reste derrière le contenu, dans le bandeau.
    <HeroMotion className="relative isolate overflow-hidden bg-ebene text-sable">
      <PhotoDeFond />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-6 pt-20 pb-[72px]">
        {/* Colonne gauche : texte + recherche */}
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
          <p data-hero="accroche" className="text-[13px] font-bold uppercase tracking-[0.14em] text-or">
            La plateforme des artistes du Bénin
          </p>
          <h1 data-hero="titre" className="font-display text-[clamp(40px,6vw,76px)] font-extrabold leading-none tracking-[-0.03em]">
            La création béninoise à votre portée.
          </h1>
          <p data-hero="texte" className="max-w-[560px] text-[19px] leading-[1.55] text-[#E8DCCB]">
            Musiciens, peintres, sculpteurs, danseurs, auteurs : trouvez un
            artiste, commandez une œuvre, et suivez les événements
            culturels près de chez vous.
          </p>

          <form
            action="/artistes"
            role="search"
            data-hero="recherche"
            className="flex max-w-[620px] flex-wrap gap-2 rounded-2xl bg-creme p-2"
          >
            <label htmlFor="q" className="sr-only">
              Rechercher un artiste ou une œuvre
            </label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Un artiste, une œuvre, une ville…"
              className="min-h-11 min-w-0 flex-[1_1_220px] rounded-[10px] bg-transparent px-3.5 text-base text-ebene placeholder:text-taupe focus-visible:outline-2 focus-visible:outline-ocre"
            />
            <label htmlFor="discipline" className="sr-only">
              Discipline
            </label>
            <select
              id="discipline"
              name="discipline"
              defaultValue=""
              className="min-h-11 rounded-[10px] bg-sable px-3 text-[15px] text-ebene"
            >
              <option value="">Toutes disciplines</option>
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="lumineux min-h-11 cursor-pointer rounded-[10px] bg-ocre px-[22px] text-[15px] font-bold text-ebene transition-colors hover:bg-or"
            >
              Rechercher
            </button>
          </form>
        </div>

        {/* Colonne droite : mosaïque (2 colonnes) */}
        <div className="grid min-w-0 flex-[1_1_420px] grid-cols-2 gap-3.5">
          {/* Grande tuile : un artiste à la une (photo + nom). Sans artiste : emplacement rayé. */}
          {artiste ? (
            <Link
              href={`/artistes/${artiste.slug}`}
              data-hero="tuile"
              data-carte
              className="group relative row-span-2 flex min-h-[360px] items-end overflow-hidden rounded-[20px] p-4"
            >
              <Image
                src={storageUrl("avatars", artiste.avatar_path!)}
                alt=""
                fill
                priority // visible dès l'ouverture : chargée en priorité
                sizes="(min-width: 1024px) 300px, 50vw"
                className="object-cover"
              />
              {/* Dégradé sombre en bas pour lire le texte sur la photo */}
              <span className="absolute inset-0 bg-linear-to-t from-ebene/85 via-ebene/10 to-transparent" />
              <span className="relative flex flex-col">
                <span className="text-xs font-bold tracking-[0.08em] text-or uppercase">À la une</span>
                <span className="font-display text-xl leading-tight font-bold">{artiste.stage_name}</span>
                <span className="text-[13px] text-[#E8DCCB]">
                  {[artiste.disciplines[0], artiste.city].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          ) : (
            <div data-hero="tuile" className="hachure row-span-2 flex min-h-[360px] items-end rounded-[20px] p-4 text-[13px] text-[#5A3A22]">
              [Photo d&apos;artiste — portrait]
            </div>
          )}

          {/* Petite tuile en haut à droite : une œuvre à acquérir (image + titre + prix). */}
          {oeuvre ? (
            <Link
              href={`/marketplace/${oeuvre.slug}`}
              data-hero="tuile"
              data-carte
              className="group relative flex min-h-[170px] items-end overflow-hidden rounded-[20px] p-4"
            >
              <Image
                src={storageUrl("artworks", oeuvre.image_paths[0])}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 300px, 50vw"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-linear-to-t from-ebene/85 via-ebene/10 to-transparent" />
              <span className="relative flex flex-col">
                <span className="line-clamp-1 text-[15px] leading-tight font-bold">{oeuvre.title}</span>
                <span className="text-[13px] text-or">{formatFcfa(oeuvre.price_fcfa)}</span>
              </span>
            </Link>
          ) : (
            <div data-hero="tuile" className="hachure flex min-h-[170px] items-end rounded-[20px] p-4 text-[13px] text-[#5A3A22]">
              [Œuvre — tableau]
            </div>
          )}

          {/* Petite tuile en bas à droite : Inscription gratuite */}
          <div data-hero="tuile" className="flex min-h-[170px] flex-col justify-end rounded-[20px] bg-ocre p-5 text-ebene">
            <span className="font-display text-[28px] font-extrabold leading-[1.05]">
              Inscription gratuite
            </span>
            <span className="mt-1.5 text-sm">pour tous les artistes béninois</span>
          </div>
        </div>
      </div>
      {/* derouler={false} : le déroulé d'entrée est déjà joué par HeroMotion. */}
      <Frise derouler={false} data-hero="motif" />
    </HeroMotion>
  );
}