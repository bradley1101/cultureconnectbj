// ─────────────────────────────────────────────────────────────
// Révélations au défilement (ScrollTrigger).
// À placer UNE fois dans une page : il cherche les éléments marqués
// data-reveal="…" et les fait apparaître quand ils entrent à l'écran.
//
//   data-reveal="titre"  → le titre monte ligne par ligne depuis un masque
//   data-reveal="vague"  → les enfants (cartes, pastilles…) arrivent en vague
//   data-reveal="bloc"   → un bloc seul monte et apparaît
//   data-reveal="rideau" → la section s'ouvre en suivant le défilement
//
// Règles : tout monte (le « courant » du site va vers le haut) ;
// ce qui est déjà à l'écran au chargement n'est PAS animé (pas de clignotement) ;
// rien ne bouge si l'utilisateur a demandé « moins d'animations ».
// ─────────────────────────────────────────────────────────────
"use client";

import { DUREE, MEDIA, ScrollTrigger, SplitText, gsap, useGSAP } from "@/lib/motion";

export function ScrollReveal() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MEDIA.mouvement, () => {
      // Vrai si l'élément est déjà visible au chargement → on le laisse tel quel.
      const dejaVisible = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.92;
      const decoupes: SplitText[] = [];

      // ── 1. TITRES : lignes qui montent depuis un masque ──
      gsap.utils.toArray<HTMLElement>("[data-reveal='titre']").forEach((titre) => {
        if (dejaVisible(titre)) return;
        const decoupe = SplitText.create(titre, { type: "lines", mask: "lines" });
        decoupes.push(decoupe);
        gsap.from(decoupe.lines, {
          yPercent: 110,
          duration: 0.9,
          ease: "site.out",
          stagger: DUREE.decalage,
          scrollTrigger: { trigger: titre, start: "top 88%", once: true },
          onComplete: () => decoupe.revert(), // redevient un texte normal
        });
      });

      // ── 2. VAGUES : les enfants d'une liste arrivent l'un après l'autre ──
      gsap.utils.toArray<HTMLElement>("[data-reveal='vague']").forEach((liste) => {
        const enfants = Array.from(liste.children).filter((el) => !dejaVisible(el));
        if (enfants.length === 0) return;
        gsap.set(enfants, { autoAlpha: 0, y: 48 });
        // batch : les éléments qui entrent à l'écran en même temps forment une vague.
        ScrollTrigger.batch(enfants, {
          start: "top 92%",
          once: true,
          onEnter: (lot) =>
            gsap.to(lot, {
              autoAlpha: 1,
              y: 0,
              duration: DUREE.entree,
              ease: "site.out",
              stagger: DUREE.decalage,
              overwrite: true,
            }),
        });
      });

      // ── 3. BLOCS : un élément seul qui monte ──
      gsap.utils.toArray<HTMLElement>("[data-reveal='bloc']").forEach((bloc) => {
        if (dejaVisible(bloc)) return;
        gsap.from(bloc, {
          autoAlpha: 0,
          y: 56,
          duration: DUREE.entree,
          ease: "site.out",
          scrollTrigger: { trigger: bloc, start: "top 88%", once: true },
        });
      });

      // ── 4. RIDEAU : la section s'élargit jusqu'aux bords en suivant le défilement ──
      // (réservé au bandeau final « Vous êtes artiste ? » : la conclusion s'élève.)
      gsap.utils.toArray<HTMLElement>("[data-reveal='rideau']").forEach((section) => {
        gsap.fromTo(
          section,
          { clipPath: "inset(10% 4% 0% 4% round 40px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 40%", scrub: 0.8 },
          },
        );
      });

      // Nettoyage : on recolle les titres découpés si on quitte la page.
      return () => decoupes.forEach((d) => d.revert());
    });
  });

  // Ce composant n'affiche rien : il ne fait qu'animer.
  return null;
}