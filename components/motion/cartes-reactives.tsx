// ─────────────────────────────────────────────────────────────
// Cartes qui réagissent à la souris (artistes, œuvres).
// Quand la souris survole une carte marquée data-carte, la carte
// s'incline légèrement vers le pointeur et se soulève un peu,
// comme une œuvre qu'on regarde de près. Elle revient en douceur
// quand la souris s'en va.
//
// Placé UNE fois dans app/layout.tsx : il écoute toute la page
// (« délégation d'événements »), donc il marche sur toutes les pages,
// même celles chargées plus tard, sans rien re-brancher.
//
// Performance : gsap.quickTo crée UNE animation par carte et par axe,
// qu'on « réoriente » à chaque mouvement de souris (au lieu de créer
// une nouvelle animation 60 fois par seconde).
//
// Uniquement sur ordinateur (souris précise) et si l'utilisateur
// n'a pas demandé « moins d'animations ». Sur téléphone : rien.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/motion";

// Inclinaison maximale (en degrés) et soulèvement (en pixels).
const INCLINAISON_MAX = 4;
const SOULEVEMENT = -6;

// Les 3 « télécommandes » d'une carte : inclinaison X, inclinaison Y, hauteur.
type Pilotes = { rx: gsap.QuickToFunc; ry: gsap.QuickToFunc; y: gsap.QuickToFunc };
const pilotes = new WeakMap<HTMLElement, Pilotes>();

// Crée (une seule fois) les télécommandes d'une carte.
function pilotesDe(carte: HTMLElement): Pilotes {
  let p = pilotes.get(carte);
  if (!p) {
    gsap.set(carte, { transformPerspective: 900 }); // profondeur de la perspective 3D
    const reglage = { duration: 0.5, ease: "site.out" };
    p = {
      rx: gsap.quickTo(carte, "rotationX", reglage),
      ry: gsap.quickTo(carte, "rotationY", reglage),
      y: gsap.quickTo(carte, "y", reglage),
    };
    pilotes.set(carte, p);
  }
  return p;
}

// React a-t-il déjà « pris en main » cette carte (hydratation terminée) ?
// Tant que ce n'est pas le cas, on n'y touche pas : sinon React trouverait
// un style ajouté par GSAP qu'il n'a pas prévu, et afficherait une erreur
// « hydration mismatch ». React marque chaque élément pris en main
// d'une propriété dont le nom commence par « __reactProps ».
const estHydratee = (el: HTMLElement) => Object.keys(el).some((k) => k.startsWith("__reactProps"));

export function CartesReactives() {
  useEffect(() => {
    // Souris précise + mouvement autorisé, sinon on ne fait rien.
    const ok = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!ok.matches) return;

    let carteActive: HTMLElement | null = null;

    // Remet une carte à plat.
    const aPlat = (carte: HTMLElement) => {
      const p = pilotesDe(carte);
      p.rx(0);
      p.ry(0);
      p.y(0);
    };

    const surMouvement = (e: PointerEvent) => {
      const carte = (e.target as Element).closest<HTMLElement>("[data-carte]");

      // La souris a quitté la carte précédente → retour à plat.
      if (carteActive && carte !== carteActive) {
        aPlat(carteActive);
        carteActive = null;
      }
        if (!carte || !estHydratee(carte)) return; // pas encore prête : on attend
      carteActive = carte;

      // Où est la souris dans la carte ? (-0.5 = bord gauche/haut, 0.5 = bord droit/bas)
      const r = carte.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      const p = pilotesDe(carte);
      p.ry(x * INCLINAISON_MAX * 2);
      p.rx(-y * INCLINAISON_MAX * 2);
      p.y(SOULEVEMENT);
    };

    // La souris sort de la fenêtre → on remet la carte à plat.
    const surSortie = () => {
      if (!carteActive) return;
      aPlat(carteActive);
      carteActive = null;
    };

    document.addEventListener("pointermove", surMouvement, { passive: true });
    document.documentElement.addEventListener("pointerleave", surSortie);
    return () => {
      document.removeEventListener("pointermove", surMouvement);
      document.documentElement.removeEventListener("pointerleave", surSortie);
    };
  }, []);

  return null;
}