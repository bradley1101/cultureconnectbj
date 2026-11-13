// ─────────────────────────────────────────────────────────────
// Boîte à outils du motion design (GSAP).
// Un seul endroit pour : enregistrer les plugins, définir les courbes
// maison et les durées. Toutes les animations du site importent d'ici,
// pour que le mouvement ait partout la même « grammaire ».
// ─────────────────────────────────────────────────────────────
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// On enregistre les plugins une seule fois (le navigateur seulement).
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, CustomEase, Flip, ScrollTrigger, SplitText);

  // ── Les 3 courbes maison (on n'en invente jamais une par élément) ──
  // « site.out »   : entrée — démarre vite, se pose en douceur.
  CustomEase.create("site.out", "0.16, 1, 0.3, 1");
  // « site.inOut » : déplacement d'un état à un autre (Flip, transitions).
  CustomEase.create("site.inOut", "0.65, 0, 0.35, 1");
  // « site.snap »  : micro-réactions rapides (boutons, clics).
  CustomEase.create("site.snap", "0.2, 0.9, 0.3, 1");
}

// ── Durées communes (en secondes) ──
export const DUREE = {
  entree: 0.8, // un élément qui apparaît
  sortie: 0.6, // ≈ 75 % de l'entrée
  micro: 0.25, // retour visuel d'un clic / survol
  decalage: 0.08, // écart entre deux éléments d'une même vague (stagger)
};

// Requêtes « mouvement autorisé » / « mouvement réduit » (réglage d'accessibilité du système).
export const MEDIA = {
  mouvement: "(prefers-reduced-motion: no-preference)",
  reduit: "(prefers-reduced-motion: reduce)",
};

export { gsap, useGSAP, Flip, ScrollTrigger, SplitText };