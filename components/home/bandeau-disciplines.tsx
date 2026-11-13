// ─────────────────────────────────────────────────────────────
// Bandeau défilant de l'accueil : les disciplines en très grand,
// séparées par les motifs d'Abomey, et les villes en dessous.
//  • les deux rangées défilent en continu, en sens opposés
//  • quand on fait défiler la page, elles accélèrent
//  • quand on remonte la page, elles changent de sens
// Décoratif : les lecteurs d'écran l'ignorent (les vraies pastilles
// cliquables des disciplines sont plus haut sur la page).
// ─────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { MEDIA, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { DISCIPLINES, VILLES } from "@/lib/constants";
import { Motif } from "@/components/motifs/motif";
import type { NomMotif } from "@/components/motifs/dessins";

const MOTIFS: NomMotif[] = ["requin", "lion", "cameleon", "buffle", "poisson"];

export function BandeauDisciplines() {
  const bloc = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = bloc.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add(MEDIA.mouvement, () => {
      // Chaque rangée contient son contenu en double : on la décale de -50 %
      // puis on recommence, le raccord est invisible (défilement infini).
      const rangees = [...el.querySelectorAll<HTMLElement>("[data-rangee]")].map((r) => {
        const sens = Number(r.dataset.rangee); // 1 = vers la gauche, -1 = vers la droite
        const anim = gsap.fromTo(
          r,
          { xPercent: sens > 0 ? 0 : -50 },
          { xPercent: sens > 0 ? -50 : 0, ease: "none", duration: Number(r.dataset.duree), repeat: -1 },
        );
        // On « avance » l'animation de 100 tours : elle peut ainsi tourner
        // à l'envers (timeScale négatif) sans buter sur son début.
        anim.totalTime(anim.duration() * 100);
        return anim;
      });

      let direction = 1; // 1 = on descend la page, -1 = on remonte
      let retour: gsap.core.Tween | undefined;

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          direction = self.direction;
          // Vitesse du défilement → accélération (jusqu'à 5 fois plus vite).
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 500, 4);
          rangees.forEach((a) => gsap.to(a, { timeScale: direction * boost, duration: 0.25, overwrite: true }));
          // Quand le défilement s'arrête, on revient doucement à la vitesse normale.
          retour?.kill();
          retour = gsap.delayedCall(0.15, () =>
            rangees.forEach((a) => gsap.to(a, { timeScale: direction, duration: 1.2, ease: "site.out", overwrite: true })),
          );
        },
      });
    });
  });

  // Contenu d'une rangée, répété deux fois pour le raccord.
  const disciplines = DISCIPLINES.map((d, i) => (
    <span key={d} className="flex items-center gap-8 sm:gap-12">
      {/* Un mot sur deux en contour seulement (lettres creuses) */}
      <span className={i % 2 ? "text-transparent [-webkit-text-stroke:1.5px_var(--color-terre)]" : "text-ebene"}>{d}</span>
      <Motif nom={MOTIFS[i % MOTIFS.length]} anime="aucun" epaisseur={3.2} className="size-10 shrink-0 text-ocre sm:size-14" />
    </span>
  ));
  const villes = VILLES.map((v) => (
    <span key={v} className="flex items-center gap-6">
      {v}
      <span className="size-1.5 rounded-full bg-ocre" />
    </span>
  ));

  return (
    <section ref={bloc} aria-hidden="true" className="overflow-hidden py-10 select-none sm:py-14">
      <div
        data-rangee="1"
        data-duree="45"
        className="flex w-max gap-8 font-display text-[56px] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap sm:gap-12 sm:text-[96px]"
      >
        <div className="flex gap-8 sm:gap-12">{disciplines}</div>
        <div className="flex gap-8 sm:gap-12">{disciplines}</div>
      </div>
      <div
        data-rangee="-1"
        data-duree="35"
        className="mt-5 flex w-max gap-6 text-lg font-medium tracking-[0.2em] whitespace-nowrap text-taupe uppercase sm:text-xl"
      >
        <div className="flex gap-6 pr-6">{villes}</div>
        <div className="flex gap-6 pr-6">{villes}</div>
      </div>
    </section>
  );
}