// ─────────────────────────────────────────────────────────────
// Chiffre qui « compte » de 0 jusqu'à sa valeur (tableaux de bord).
// Exemples : 12 → 0, 1, 2… 12 ; « 45 000 FCFA » → 0 FCFA … 45 000 FCFA.
//
// La vraie valeur est affichée dès le départ (côté serveur) : si le
// JavaScript ne charge pas, ou si l'utilisateur a demandé « moins
// d'animations », on voit directement le bon chiffre.
// ─────────────────────────────────────────────────────────────
"use client";

import { useLayoutEffect, useRef } from "react";
import { MEDIA, gsap } from "@/lib/motion";

const nombre = new Intl.NumberFormat("fr-FR");

export function Compteur({ valeur }: { valeur: number | string }) {
  const zone = useRef<HTMLSpanElement>(null);
  const texte = String(valeur);

  // useLayoutEffect : on remet à 0 AVANT que l'écran soit dessiné (pas de saut).
  useLayoutEffect(() => {
    const el = zone.current;
    if (!el || window.matchMedia(MEDIA.reduit).matches) return;

    // On sépare le nombre du reste : « 45 000 FCFA » → 45000 + « FCFA ».
    // (\s couvre les espaces, y compris les espaces fines mises par fr-FR)
    const morceaux = texte.match(/^(\d[\d\s]*\d|\d)(.*)$/); // le nombre finit par un chiffre
    if (!morceaux) return; // pas un nombre : on n'anime pas
    const cible = Number(morceaux[1].replace(/\s/g, ""));
    const suite = morceaux[2]; // ex. « FCFA » avec son espace devant
    if (!cible) return; // 0 : rien à compter

    // On affiche tout de suite « 0 » (avant même le premier dessin).
    el.textContent = "0" + suite;
    const compteur = { n: 0 };
    const tween = gsap.to(compteur, {
      n: cible,
            duration: 0.8, // tableau de bord : on reste vif
      ease: "site.out", // rapide au début, se pose en douceur sur la valeur
      onUpdate: () => {
        el.textContent = nombre.format(Math.round(compteur.n)) + suite;
      },
      // À la fin, on remet exactement le texte d'origine.
      onComplete: () => {
        el.textContent = texte;
      },
    });
    // Si on quitte la page en plein comptage : on arrête et on remet la vraie valeur.
    return () => {
      tween.kill();
      el.textContent = texte;
    };
  }, [texte]);

  // key={texte} : si la valeur change, React recrée le chiffre proprement.
  return (
    <span key={texte} ref={zone}>
      {texte}
    </span>
  );
}