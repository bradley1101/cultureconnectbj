// ─────────────────────────────────────────────────────────────
// Grille animée (GSAP Flip) pour l'annuaire et la marketplace.
//
// Quand on filtre ou qu'on trie :
//  - les cartes qui restent GLISSENT de leur ancienne place à la nouvelle ;
//  - les nouvelles cartes apparaissent en montant ;
//  - celles qui ne correspondent plus disparaissent.
//
// Principe de Flip : on « photographie » la position des cartes juste avant
// le changement (au moment où l'on clique sur Filtrer), puis, une fois la
// nouvelle liste affichée, Flip fait glisser chaque carte depuis sa position
// photographiée. Chaque carte est reconnue grâce à data-flip-id.
//
// Le formulaire de filtres doit porter l'attribut data-flip-filtres.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { DUREE, Flip, MEDIA, gsap } from "@/lib/motion";

// La « photo » des positions, prise juste avant le changement.
let photo: Flip.FlipState | null = null;

type Props = { className?: string; children: React.ReactNode };

export function GrilleFlip({ className, children }: Props) {
  const grille = useRef<HTMLUListElement>(null);

  // 1. Au clic sur « Filtrer » / « Réinitialiser » : on photographie les cartes.
  useEffect(() => {
    const photographier = (e: Event) => {
      const cible = e.target as Element;
      if (!cible.closest("[data-flip-filtres]")) return; // seulement le formulaire de filtres
      if (!grille.current || window.matchMedia(MEDIA.reduit).matches) return;
      photo = Flip.getState(grille.current.querySelectorAll("[data-flip-id]"));
    };
    // « capture » : on photographie AVANT que Next.js ne lance le changement de page.
    document.addEventListener("submit", photographier, true);
    document.addEventListener("click", photographier, true);
    return () => {
      document.removeEventListener("submit", photographier, true);
      document.removeEventListener("click", photographier, true);
      // La grille disparaît (ex. aucun résultat) : on oublie la photo.
      photo = null;
    };
  }, []);

  // 2. Après chaque affichage : s'il y a une photo, on anime vers les nouvelles places.
  // useLayoutEffect : s'exécute avant que l'écran soit dessiné (pas de saut visible).
  useLayoutEffect(() => {
    if (!photo || !grille.current) return;
    const etat = photo;
    photo = null; // une photo ne sert qu'une fois

    Flip.from(etat, {
      targets: grille.current.querySelectorAll("[data-flip-id]"),
      duration: 0.7,
      ease: "site.inOut",
      stagger: 0.02,
      // Cartes nouvelles : elles montent en apparaissant.
      onEnter: (nouvelles) =>
        gsap.fromTo(
          nouvelles,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: DUREE.entree, ease: "site.out", stagger: DUREE.decalage, delay: 0.15 },
        ),
    });
  });

  return (
    <ul ref={grille} className={className}>
      {children}
    </ul>
  );
}