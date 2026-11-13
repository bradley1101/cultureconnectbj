// ─────────────────────────────────────────────────────────────
// Chorégraphie d'entrée du grand bandeau de l'accueil (le « moment signature »).
//
// Ordre : la petite phrase dorée → le titre se dévoile ligne par ligne
// (chaque ligne monte depuis un masque) → le texte → la barre de recherche
// → la mosaïque se dévoile de bas en haut → la frise béninoise se déroule
// de gauche à droite et « passe le relais » à la section suivante.
//
// Les éléments animés sont repérés par l'attribut data-hero="…" dans hero.tsx.
// ─────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { FIN_INTRO, introDoitJouer } from "@/lib/intro";
import { DUREE, MEDIA, SplitText, gsap, useGSAP } from "@/lib/motion";

type Props = { className?: string; children: React.ReactNode };

export function HeroMotion({ className, children }: Props) {
  // scope : on ne cherche les data-hero qu'à l'intérieur de cette section.
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Mouvement réduit : tout s'affiche directement, sans déplacement.
      mm.add(MEDIA.reduit, () => {
        gsap.set("[data-hero]", { autoAlpha: 1 });
      });

      // ── Mouvement autorisé : la chorégraphie complète.
      mm.add(MEDIA.mouvement, () => {
        const titre = scope.current?.querySelector("[data-hero='titre']");
        if (!titre) return;
                // Le JavaScript prend la main : on annule la réapparition « de secours » prévue
        // en CSS (sauf sur les tuiles, qui gardent leur tremblement).
        gsap.set("[data-hero]:not([data-hero='tuile'])", { animation: "none" });

        // Si la vidéo d'ouverture va se jouer, on attend qu'elle se termine.
        const attendreIntro = introDoitJouer();
        // Découpe du titre en lignes, chacune dans un masque (overflow caché).
        const decoupe = SplitText.create(titre, { type: "lines", mask: "lines" });

        const tl = gsap.timeline({
          paused: attendreIntro, // en pause pendant l'intro
          defaults: { ease: "site.out", duration: DUREE.entree },
          // À la fin, on « recolle » le titre : il redevient un texte normal
          // (sélectionnable, et qui se recoupe bien si on redimensionne).
          onComplete: () => decoupe.revert(),
        });

        tl.fromTo("[data-hero='accroche']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 })
          // Le titre devient visible, ses lignes montent depuis le bas de leur masque.
          .set(titre, { autoAlpha: 1 }, "<0.1")
          .from(decoupe.lines, { yPercent: 110, stagger: DUREE.decalage, duration: 0.9 }, "<")
          .fromTo("[data-hero='texte']", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0 }, "-=0.55")
          .fromTo("[data-hero='recherche']", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0 }, "-=0.6")
          // Mosaïque : chaque tuile se dévoile de bas en haut (rideau qui monte = le courant du site).
          .fromTo(
            "[data-hero='tuile']",
            { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)", y: 40 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, stagger: 0.1, duration: 1 },
            "-=0.9",
          )
          // Frise : se déroule de gauche à droite, encore en mouvement quand on commence à défiler.
          .fromTo(
            "[data-hero='motif']",
            { autoAlpha: 1, scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.1, ease: "site.inOut" },
            "-=0.7",
          );

                // Fin de l'intro → le bandeau joue sa chorégraphie.
        const jouer = () => tl.play();
        if (attendreIntro) window.addEventListener(FIN_INTRO, jouer, { once: true });

        // Nettoyage si on quitte la page en pleine animation.
        return () => {
          window.removeEventListener(FIN_INTRO, jouer);
          decoupe.revert();
        };
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className={className}>
      {children}
    </section>
  );
}