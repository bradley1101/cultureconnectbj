// ─────────────────────────────────────────────────────────────
// Rangée horizontale de cartes (Artistes à la une, Œuvres à acquérir).
// La page défile normalement : rien n'est figé.
//  • téléphone / tablette : on fait glisser la rangée au doigt
//  • ordinateur : pavé tactile (glisser à deux doigts), souris
//    (cliquer-glisser) ou flèches ← → sous la rangée
// Une barre ocre montre où l'on en est dans la rangée.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useRef, useState } from "react";

export function GalerieHorizontale({ children }: { children: React.ReactNode }) {
  const bloc = useRef<HTMLDivElement>(null);
  const barre = useRef<HTMLDivElement>(null);
  const [debut, setDebut] = useState(true); // tout à gauche ?
  const [fin, setFin] = useState(false); // tout à droite ?

  const piste = () => bloc.current?.querySelector<HTMLElement>("[data-piste]") ?? null;

  useEffect(() => {
    const p = piste();
    if (!p) return;

    // ── Barre de progression + état des flèches, à chaque défilement ──
    const maj = () => {
      const max = p.scrollWidth - p.clientWidth;
      const progres = max > 0 ? p.scrollLeft / max : 1;
      if (barre.current) barre.current.style.transform = `scaleX(${Math.max(progres, 0.04)})`;
      setDebut(p.scrollLeft <= 2);
      setFin(p.scrollLeft >= max - 2);
    };
    maj();
    p.addEventListener("scroll", maj, { passive: true });
    window.addEventListener("resize", maj);

    // ── Cliquer-glisser à la souris (le doigt et le pavé tactile marchent déjà tout seuls) ──
    let depart: { x: number; gauche: number } | null = null;
    let aBouge = false;
    const bas = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      depart = { x: e.clientX, gauche: p.scrollLeft };
      aBouge = false;
    };
    const bouge = (e: PointerEvent) => {
      if (!depart) return;
      const dx = e.clientX - depart.x;
      if (!aBouge && Math.abs(dx) > 6) {
        aBouge = true;
        p.style.scrollSnapType = "none"; // pas de « calage » pendant qu'on tire
        p.style.cursor = "grabbing";
      }
      if (aBouge) p.scrollLeft = depart.gauche - dx;
    };
    const haut = () => {
      if (!depart) return;
      depart = null;
      p.style.cursor = "";
      if (aBouge) {
        // On remet le calage : la carte la plus proche se cale en douceur.
        const gauche = p.scrollLeft;
        p.style.scrollSnapType = "";
        p.scrollLeft = gauche;
      }
    };
    // Si on a tiré la rangée, le relâchement ne doit pas ouvrir la carte sous la souris.
    const clic = (e: MouseEvent) => {
      if (aBouge) {
        e.preventDefault();
        e.stopPropagation();
        aBouge = false;
      }
    };
    // Empêche le navigateur de « prendre » l'image pour la glisser ailleurs.
    const glisserImage = (e: DragEvent) => e.preventDefault();

    p.addEventListener("pointerdown", bas);
    window.addEventListener("pointermove", bouge);
    window.addEventListener("pointerup", haut);
    p.addEventListener("click", clic, true);
    p.addEventListener("dragstart", glisserImage);

    return () => {
      p.removeEventListener("scroll", maj);
      window.removeEventListener("resize", maj);
      p.removeEventListener("pointerdown", bas);
      window.removeEventListener("pointermove", bouge);
      window.removeEventListener("pointerup", haut);
      p.removeEventListener("click", clic, true);
      p.removeEventListener("dragstart", glisserImage);
    };
  }, []);

  // Flèches : avance ou recule d'environ une largeur d'écran de cartes.
  const avancer = (sens: 1 | -1) => {
    const p = piste();
    if (!p) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    p.scrollBy({ left: sens * p.clientWidth * 0.8, behavior: reduit ? "auto" : "smooth" });
  };

  return (
    <div ref={bloc}>
      {children}
      <div className="mt-6 flex items-center gap-5">
        {/* Barre de progression */}
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-ligne" aria-hidden="true">
          <div ref={barre} className="h-full origin-left scale-x-[0.04] rounded-full bg-ocre transition-transform duration-200" />
        </div>
        {/* Flèches : seulement avec une souris (au doigt, on glisse) */}
        <div className="hidden gap-2 pointer-fine:flex">
          {[
            { sens: -1 as const, label: "Cartes précédentes", d: "M15 5l-7 7 7 7", off: debut },
            { sens: 1 as const, label: "Cartes suivantes", d: "M9 5l7 7-7 7", off: fin },
          ].map((f) => (
            <button
              key={f.sens}
              type="button"
              onClick={() => avancer(f.sens)}
              disabled={f.off}
              aria-label={f.label}
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-ligne bg-creme text-ebene transition-[background-color,color,opacity] hover:bg-terre hover:text-sable disabled:cursor-default disabled:opacity-35 disabled:hover:bg-creme disabled:hover:text-ebene"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={f.d} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}