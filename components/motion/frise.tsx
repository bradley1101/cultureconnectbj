// ─────────────────────────────────────────────────────────────
// La frise béninoise « vivante » (le fil culturel du site).
//
// Deux mouvements, tous deux pilotés par le défilement :
//  1. DÉROULÉ : quand la frise arrive à l'écran, elle se déroule de gauche
//     à droite, au rythme du doigt / de la molette (et se ré-enroule si on remonte).
//  2. DÉFILEMENT DU MOTIF : pendant qu'on fait défiler la page, le motif
//     glisse doucement vers la droite, comme un tissu qui avance avec vous.
//
// derouler={false} : pour la frise du bandeau d'accueil, qui a déjà
// sa propre animation d'entrée (hero-motion.tsx).
// Rien ne bouge si l'utilisateur a demandé « moins d'animations ».
// ─────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { MEDIA, gsap, useGSAP } from "@/lib/motion";

// Accepte aussi les attributs normaux d'un <div> (ex. data-hero="motif").
type Props = { derouler?: boolean } & React.HTMLAttributes<HTMLDivElement>;

export function Frise({ derouler = true, className = "", ...reste }: Props) {
  const frise = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = frise.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add(MEDIA.mouvement, () => {
      // 1. Déroulé, lié au défilement (scrub) : 0 % quand la frise apparaît
      //    en bas de l'écran, 100 % quand elle est montée de 20 %.
      if (derouler) {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 80%", scrub: 0.8 },
          },
        );
      }

      // 2. Le motif glisse vers la droite sur toute la hauteur de la page.
      //    352 px = 4 fois la largeur du motif (88 px) : le raccord est invisible.
      gsap.fromTo(
        el,
        { backgroundPosition: "0px 0px" },
        {
          backgroundPosition: "352px 0px",
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
        },
      );
    });
  });

  return <div ref={frise} className={`motif ${className}`} {...reste} />;
}