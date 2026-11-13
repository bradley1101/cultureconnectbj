// ─────────────────────────────────────────────────────────────
// Curseur personnalisé (ordinateur avec souris uniquement).
//  • un petit point qui suit la souris exactement
//  • un anneau qui le suit avec un léger retard (effet élastique)
//  • sur un lien ou un bouton : l'anneau grossit
//  • sur une carte (œuvre, artiste…) : l'anneau devient une pastille « Voir »
//  • dans un champ de texte : on retrouve la barre de saisie normale
// Point et anneau changent de couleur selon le fond (clair ou foncé)
// grâce à mix-blend-mode: difference.
// Désactivé au doigt, et si l'utilisateur a demandé « moins d'animations ».
// ─────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";

type Etat = "normal" | "lien" | "voir" | "texte";

export function Curseur() {
  const point = useRef<HTMLDivElement>(null);
  const anneau = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const p = point.current;
    const a = anneau.current;
    if (!p || !a) return;
    const html = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      html.setAttribute("data-curseur-actif", ""); // cache la flèche du système (voir globals.css)

      // quickTo : fonctions ultra-rapides pour suivre la souris sans créer d'animation à chaque pixel.
      const pointX = gsap.quickTo(p, "x", { duration: 0.08, ease: "power3.out" });
      const pointY = gsap.quickTo(p, "y", { duration: 0.08, ease: "power3.out" });
      const anneauX = gsap.quickTo(a, "x", { duration: 0.45, ease: "power3.out" });
      const anneauY = gsap.quickTo(a, "y", { duration: 0.45, ease: "power3.out" });

      let etat: Etat = "normal";
      let visible = false;

      // Change l'apparence selon ce qu'il y a sous la souris (les styles sont dans globals.css).
      const changer = (nouveau: Etat) => {
        if (nouveau === etat) return;
        etat = nouveau;
        a.dataset.etat = nouveau;
        p.dataset.etat = nouveau;
      };

      const bouge = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        if (!visible) {
          // Première apparition : on place tout de suite le curseur, sans glissement depuis le coin.
          gsap.set([p, a], { x: e.clientX, y: e.clientY });
          gsap.to([p, a], { autoAlpha: 1, duration: 0.2 });
          visible = true;
        }
        pointX(e.clientX);
        pointY(e.clientY);
        anneauX(e.clientX);
        anneauY(e.clientY);

        const cible = e.target as Element;
        if (cible.closest("input, textarea, select, [contenteditable='true']")) changer("texte");
        else if (cible.closest("[data-carte]")) changer("voir");
        else if (cible.closest("a, button, label, summary, [role='button']")) changer("lien");
        else changer("normal");
      };

      // La souris quitte la fenêtre : le curseur disparaît.
      const sort = () => {
        visible = false;
        gsap.to([p, a], { autoAlpha: 0, duration: 0.2 });
      };
      // Clic : l'anneau se resserre un instant.
      const appuie = () => gsap.to(a, { scale: 0.8, duration: 0.15, ease: "power2.out" });
      const relache = () => gsap.to(a, { scale: 1, duration: 0.4, ease: "back.out(3)" });

      window.addEventListener("pointermove", bouge, { passive: true });
      document.documentElement.addEventListener("mouseleave", sort);
      window.addEventListener("pointerdown", appuie);
      window.addEventListener("pointerup", relache);

      return () => {
        html.removeAttribute("data-curseur-actif");
        window.removeEventListener("pointermove", bouge);
        document.documentElement.removeEventListener("mouseleave", sort);
        window.removeEventListener("pointerdown", appuie);
        window.removeEventListener("pointerup", relache);
      };
    });
  });

  return (
    // aria-hidden : purement décoratif. Invisible tant que la souris n'a pas bougé.
    <div aria-hidden="true" className="curseur">
      <div ref={anneau} data-etat="normal" className="curseur-anneau">
        <span>Voir</span>
      </div>
      <div ref={point} data-etat="normal" className="curseur-point" />
    </div>
  );
}