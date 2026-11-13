// ─────────────────────────────────────────────────────────────
// Onglets du profil artiste : Portfolio / Œuvres en vente / Événements.
// "use client" : ce composant tourne dans le navigateur, car il réagit
// aux clics (il mémorise l'onglet ouvert avec useState).
// ─────────────────────────────────────────────────────────────
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { storageUrl } from "@/lib/supabase/public";
import { formatDay, formatFcfa } from "@/lib/format";

// Fond beige rayé quand il n'y a pas encore d'image.
const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

// Forme des données reçues de la page (TypeScript vérifie qu'on ne se trompe pas).
type Props = {
  portfolio: { id: string; title: string | null; image_path: string | null; media_url: string | null; year: number | null }[];
  artworks: { id: string; slug: string; title: string; category: string; price_fcfa: number; image_paths: string[] }[];
  events: { id: string; title: string; starts_at: string; city: string; venue: string | null }[];
};

// Liste des onglets : identifiant, texte du bouton, titre affiché au-dessus du contenu.
const onglets = [
  { id: "portfolio", label: "Portfolio", titre: "Portfolio" },
  { id: "vente", label: "Œuvres en vente", titre: "Œuvres en vente" },
  { id: "events", label: "Événements", titre: "Prochains événements" },
] as const;
// Type qui vaut "portfolio" | "vente" | "events".
type Onglet = (typeof onglets)[number]["id"];

export function ProfileTabs({ portfolio, artworks, events }: Props) {
  // Onglet ouvert : « portfolio » au départ.
  const [actif, setActif] = useState<Onglet>("portfolio");
  // Infos de l'onglet ouvert (pour afficher son titre).
  const courant = onglets.find((o) => o.id === actif)!;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Barre d'onglets. Les attributs role/aria-* indiquent aux
             lecteurs d'écran qu'il s'agit d'onglets. ── */}
      <div role="tablist" aria-label="Sections du profil" className="flex flex-wrap gap-2 border-b border-ligne">
        {onglets.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            id={`onglet-${o.id}`}
            aria-selected={actif === o.id}
            aria-controls={`panneau-${o.id}`}
            // Au clic, on change d'onglet.
            onClick={() => setActif(o.id)}
            // Onglet actif : texte foncé + soulignement ocre. Sinon : texte taupe.
            className={`-mb-px min-h-11 cursor-pointer border-b-[3px] px-[18px] py-3.5 font-bold ${
              actif === o.id ? "border-ocre text-ebene" : "border-transparent text-taupe hover:text-ebene"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* ── Contenu de l'onglet ouvert ── */}
      <div role="tabpanel" id={`panneau-${actif}`} aria-labelledby={`onglet-${actif}`} className="flex flex-col gap-6">
        <h2 className="font-display text-[32px] font-extrabold">{courant.titre}</h2>

        {/* Onglet PORTFOLIO : grille d'images (ou message si vide). */}
        {actif === "portfolio" &&
          (portfolio.length > 0 ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {portfolio.map((p) => (
                <li key={p.id} className="flex flex-col gap-2.5">
                  <div className={`relative aspect-square overflow-hidden rounded-2xl ${hachure}`}>
                    {p.image_path && (
                      <Image src={storageUrl("portfolio", p.image_path)} alt={p.title ?? ""} fill sizes="(min-width: 1024px) 260px, 50vw" className="object-cover" />
                    )}
                  </div>
                  {p.title && <span className="font-bold">{p.title}</span>}
                  {p.year && <span className="text-sm text-taupe">{p.year}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-taupe">Le portfolio sera bientôt complété.</p>
          ))}

        {/* Onglet ŒUVRES EN VENTE : cartes cliquables vers la fiche œuvre. */}
        {actif === "vente" &&
          (artworks.length > 0 ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {artworks.map((a) => (
                <li key={a.id}>
                  <Link href={`/marketplace/${a.slug}`} className="group flex flex-col gap-2.5">
                    <div className={`relative aspect-square overflow-hidden rounded-2xl ${hachure}`}>
                      {a.image_paths[0] && (
                        <Image src={storageUrl("artworks", a.image_paths[0])} alt="" fill sizes="(min-width: 1024px) 260px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      )}
                    </div>
                    <span className="font-bold group-hover:text-terre">{a.title}</span>
                    <span className="text-sm text-taupe">{formatFcfa(a.price_fcfa)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-taupe">Aucune œuvre en vente pour le moment.</p>
          ))}

        {/* Onglet ÉVÉNEMENTS : liste avec petit calendrier brun. */}
        {actif === "events" &&
          (events.length > 0 ? (
            <ul className="flex flex-col gap-3.5">
              {events.map((e) => {
                const { day, month } = formatDay(e.starts_at);
                return (
                  <li key={e.id} className="flex items-center gap-[18px] rounded-2xl border border-ligne p-5">
                    <div className="w-16 flex-none rounded-xl bg-ebene py-2 text-center text-sable">
                      <div className="font-display text-2xl font-extrabold leading-none">{day}</div>
                      <div className="text-xs font-bold uppercase">{month}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[17px] font-bold">{e.title}</span>
                      <span className="text-sm text-taupe">
                        {e.venue ? `${e.venue} · ` : ""}
                        {e.city}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-taupe">Aucun événement annoncé pour le moment.</p>
          ))}
      </div>
    </div>
  );
}