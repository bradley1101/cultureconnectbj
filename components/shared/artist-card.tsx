// ─────────────────────────────────────────────────────────────
// Carte d'un artiste : photo, nom, badge vérifié, discipline et ville.
// Composant partagé, utilisé par l'annuaire (et réutilisable ailleurs).
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { storageUrl } from "@/lib/supabase/public";

const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

// Les informations dont la carte a besoin.
type Artiste = {
  slug: string;
  stage_name: string;
  disciplines: string[];
  city: string | null;
  avatar_path: string | null;
  is_verified: boolean;
};

export function ArtistCard({ artiste: a }: { artiste: Artiste }) {
  return (
    // Toute la carte mène au profil. « group » : effets au survol de la carte entière.
    <Link href={`/artistes/${a.slug}`} data-carte className="group flex flex-col gap-3">
      {/* Photo au format portrait (4/5), légère animation de zoom au survol. */}
      {/* Nom partagé avec la photo du profil : la photo « voyage » jusqu'à elle. */}
<ViewTransition name={`artiste-${a.slug}`} share="morph" default="none">
      <div className={`relative aspect-[4/5] overflow-hidden rounded-[18px] ${hachure}`}>
        {a.avatar_path && (
          <Image
            src={storageUrl("avatars", a.avatar_path)}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      </ViewTransition>

      {/* Nom + badge bleu si l'artiste est vérifié. */}
      <div className="flex items-center gap-2">
        <span className="font-display text-xl font-bold group-hover:text-terre">{a.stage_name}</span>
        {a.is_verified && (
          <svg width="18" height="18" viewBox="0 0 24 24" role="img" aria-label="Artiste vérifié">
            <circle cx="12" cy="12" r="10" fill="#23395B" />
            <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#FCFAF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* « Peinture · Porto-Novo » (les infos vides sont ignorées). */}
      <span className="text-[15px] text-taupe">
        {[a.disciplines[0], a.city].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}