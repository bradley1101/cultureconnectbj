// ─────────────────────────────────────────────────────────────
// Un motif d'Abomey qui se dessine tout seul.
//  • anime="entree"      : le trait se trace une fois, quand le motif arrive à l'écran
//  • anime="defilement"  : le trait se trace au rythme du défilement (filigrane),
//                          et le motif glisse doucement (effet de profondeur)
//  • anime="aucun"       : dessin fixe
// Rien ne bouge si l'utilisateur a demandé « moins d'animations ».
// ─────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { MEDIA, gsap, useGSAP } from "@/lib/motion";
import { MOTIFS, type NomMotif } from "./dessins";

type Props = {
  nom: NomMotif;
  anime?: "entree" | "defilement" | "aucun";
  epaisseur?: number; // épaisseur du trait (en unités du dessin : 120 = toute la largeur)
  className?: string; // taille et couleur (le trait prend la couleur du texte : text-…)
};

export function Motif({ nom, anime = "entree", epaisseur = 2.6, className = "" }: Props) {
  const svg = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const el = svg.current;
    if (!el || anime === "aucun") return;
    const traits = el.querySelectorAll("path");
    // On annule la sécurité CSS (qui affiche le dessin si le JavaScript ne marche pas).
    gsap.set(traits, { animation: "none" });
    const mm = gsap.matchMedia();

    mm.add(MEDIA.mouvement, () => {
      if (anime === "entree") {
        // Les traits se dessinent l'un après l'autre (1 = trait caché, 0 = trait complet).
        gsap.fromTo(traits, { strokeDashoffset: 1 }, {
          strokeDashoffset: 0, duration: 1.4, ease: "site.inOut", stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      } else {
        // Filigrane : le dessin avance avec le défilement…
        gsap.fromTo(traits, { strokeDashoffset: 1 }, {
          strokeDashoffset: 0, ease: "none", stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 35%", scrub: 0.8 },
        });
        // … et le motif monte un peu moins vite que la page (profondeur).
        gsap.fromTo(el, { y: 40 }, {
          y: -40, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });
    // Moins d'animations : le dessin est affiché complet tout de suite.
    mm.add(MEDIA.reduit, () => gsap.set(traits, { strokeDashoffset: 0 }));
  });

  return (
    <svg
      ref={svg}
      viewBox="0 0 120 120"
      aria-hidden="true" // décoratif : ignoré par les lecteurs d'écran
      data-trace={anime === "aucun" ? undefined : ""}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {MOTIFS[nom].traits.map((d) => (
        // pathLength={1} : chaque trait mesure « 1 », ce qui permet de le dessiner de 0 à 1.
        <path key={d} d={d} pathLength={1} />
      ))}
    </svg>
  );
}

// ── Séparateur de sections : ligne — motif — ligne ──
// Les deux lignes partent du motif vers les bords, et le motif se dessine.
export function Separateur({ nom }: { nom: NomMotif }) {
  const bloc = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = bloc.current;
    if (!el) return;
    const lignes = el.querySelectorAll("[data-ligne]");
    gsap.set(lignes, { animation: "none" });
    const mm = gsap.matchMedia();
    mm.add(MEDIA.mouvement, () => {
      gsap.fromTo(lignes, { scaleX: 0 }, {
        scaleX: 1, duration: 1.2, ease: "site.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    mm.add(MEDIA.reduit, () => gsap.set(lignes, { scaleX: 1 }));
  });

  return (
    <div ref={bloc} data-separateur className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-6 text-ocre">
      {/* origin-right : la ligne de gauche part du motif vers la gauche */}
      <span data-ligne className="h-0.5 flex-1 origin-right bg-linear-to-r from-transparent to-ocre" />
      <Motif nom={nom} className="size-16 shrink-0 sm:size-20" epaisseur={2.8} />
      <span data-ligne className="h-0.5 flex-1 origin-left bg-linear-to-r from-ocre to-transparent" />
    </div>
  );
}