// ─────────────────────────────────────────────────────────────
// Section « Ressources pour les artistes » de l'accueil.
// Affiche les guides de la base (épinglés, puis derniers publiés).
// S'il n'y a encore AUCUN guide publié, on montre les 3 guides
// par défaut ci-dessous, pour ne jamais laisser la section vide.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { getHomeResources } from "@/lib/home-data";

// Guides de secours (mêmes adresses que les guides rédigés).
const GUIDES_PAR_DEFAUT = [
  { slug: "inscription-bubedra", category: "Droits d'auteur", title: "S'inscrire au BUBEDRA et déclarer ses œuvres" },
  { slug: "publier-sa-musique-en-streaming", category: "Streaming", title: "Publier sa musique sur les plateformes internationales" },
  { slug: "trouver-un-financement", category: "Financements", title: "Trouver une bourse, une résidence ou un appel à projets" },
];

// « async » : le composant lit maintenant la base.
export async function Resources() {
  const publies = await getHomeResources();
  const guides = publies.length > 0 ? publies : GUIDES_PAR_DEFAUT;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-[72px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h2 data-reveal="titre" className="font-display text-[40px] font-extrabold tracking-[-0.02em]">Ressources pour les artistes</h2>
        <Link href="/ressources" className="font-bold text-terre hover:text-ebene">Tous les guides →</Link>
      </div>

      <ul data-reveal="vague" className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/ressources/${g.slug}`}
              data-tremble className="lumineux flex h-full flex-col gap-2.5 rounded-[20px] border border-ligne p-7 transition-colors hover:border-ocre"
            >
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-terre">{g.category}</span>
              <span className="font-display text-[22px] font-bold leading-[1.2]">{g.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}