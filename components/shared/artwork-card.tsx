// ─────────────────────────────────────────────────────────────
// Carte d'une œuvre : image carrée, catégorie, titre, artiste, prix.
// Composant partagé (Marketplace, et réutilisable ailleurs).
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { formatFcfa } from "@/lib/format";
import { storageUrl } from "@/lib/supabase/public";

const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

// Les informations dont la carte a besoin.
type Oeuvre = {
  slug: string;
  title: string;
  category: string;
  kind: "physical" | "digital";
  price_fcfa: number;
  image_paths: string[];
  artist: { stage_name: string } | null;
};

export function ArtworkCard({ oeuvre: o }: { oeuvre: Oeuvre }) {
  return (
    // border : fine bordure pour que la carte se détache du fond clair de la page.
    <article data-carte className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-ligne bg-creme">
      {/* Image cliquable (cachée au clavier : le titre est déjà un lien). */}
            {/* Nom partagé avec la grande image de la fiche : la vignette « voyage » jusqu'à elle. */}
      <ViewTransition name={`oeuvre-${o.slug}`} share="morph" default="none">
      <Link
        href={`/marketplace/${o.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block aspect-square overflow-hidden ${hachure}`}
      >
        {o.image_paths[0] && (
          <Image
            src={storageUrl("artworks", o.image_paths[0])}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </Link>
      </ViewTransition>

      {/* Texte de la carte. */}
      <div className="flex flex-col gap-1.5 px-[18px] pt-4 pb-[18px]">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-terre">
          {o.category}
          {o.kind === "digital" ? " · numérique" : ""}
        </span>
        <h3 className="font-display text-[19px] font-bold">
          <Link href={`/marketplace/${o.slug}`} className="hover:text-terre">{o.title}</Link>
        </h3>
        {o.artist && <span className="text-sm text-taupe">par {o.artist.stage_name}</span>}
        <span className="mt-1.5 text-lg font-bold">{formatFcfa(o.price_fcfa)}</span>
      </div>
    </article>
  );
}