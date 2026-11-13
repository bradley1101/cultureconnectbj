// ─────────────────────────────────────────────────────────────
// Visionneuse plein écran des photos d'une œuvre.
//  • s'ouvre en grandissant depuis la grande image de la fiche
//  • glisser à gauche / à droite (ou flèches ← →) : photo suivante / précédente
//  • pincer, double-tap, double-clic ou molette : zoom ; glisser pour se déplacer
//  • glisser vers le bas, Échap ou ✕ : fermer (retour vers l'image de la fiche)
// ─────────────────────────────────────────────────────────────
"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "@/lib/motion";
import { storageUrl } from "@/lib/supabase/public";

const ZOOM_MAX = 4; // grossissement maximum
const ZOOM_DOUBLE = 2.5; // grossissement d'un double-tap

type Props = {
  images: string[]; // chemins des photos dans le bucket « artworks »
  titre: string;
  index: number; // photo affichée
  ouvert: boolean;
  source: RefObject<HTMLElement | null>; // grande image de la fiche (point de départ de l'animation)
  onChange: (i: number) => void;
  onFermer: () => void;
};

export function Visionneuse({ images, titre, index, ouvert, source, onChange, onFermer }: Props) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const fond = useRef<HTMLDivElement>(null);
  const piste = useRef<HTMLDivElement>(null); // bande horizontale de toutes les photos
  const interface_ = useRef<HTMLDivElement>(null); // compteur, boutons, légende
  const [indice, setIndice] = useState(true); // petite aide « pincez pour zoomer »

  // État des gestes, gardé hors de React (pas de re-rendu à chaque mouvement de doigt).
  const g = useRef({
    zoom: 1, tx: 0, ty: 0, // zoom et déplacement de la photo courante
    doigts: new Map<number, { x: number; y: number }>(),
    depart: { x: 0, y: 0, tx: 0, ty: 0 },
    pince: { dist: 0, zoom: 1, mx: 0, my: 0, tx: 0, ty: 0 },
    axe: null as null | "x" | "y", // direction choisie au début du glissement
    dernierTap: 0,
    bouge: false,
    ferme: false,
  });

  const reduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const courante = () => piste.current?.children[index]?.firstElementChild as HTMLElement | undefined;

  // Applique zoom + déplacement à la photo courante.
  const appliquer = useCallback((anime = false) => {
    const el = courante();
    if (!el) return;
    const { zoom, tx, ty } = g.current;
    gsap.to(el, { x: tx, y: ty, scale: zoom, duration: anime ? 0.35 : 0, ease: "site.out", overwrite: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Empêche de faire sortir la photo zoomée de l'écran.
  const borner = () => {
    const s = g.current;
    const mx = ((s.zoom - 1) * window.innerWidth) / 2;
    const my = ((s.zoom - 1) * window.innerHeight) / 2;
    s.tx = gsap.utils.clamp(-mx, mx, s.tx);
    s.ty = gsap.utils.clamp(-my, my, s.ty);
  };

  // Zoom vers un point de l'écran (px, py) en gardant ce point sous le doigt / la souris.
  const zoomerVers = (nouveau: number, px: number, py: number) => {
    const s = g.current;
    const cx = px - window.innerWidth / 2;
    const cy = py - window.innerHeight / 2;
    const k = nouveau / s.zoom;
    s.tx = cx - k * (cx - s.tx);
    s.ty = cy - k * (cy - s.ty);
    s.zoom = nouveau;
    if (s.zoom <= 1.01) Object.assign(s, { zoom: 1, tx: 0, ty: 0 });
    borner();
  };

  const remettre = () => Object.assign(g.current, { zoom: 1, tx: 0, ty: 0 });

  // Place la bande sur la photo « i ».
  const allerA = useCallback((i: number, anime = true) => {
    gsap.to(piste.current, {
      xPercent: -100 * i, x: 0,
      duration: anime && !reduit() ? 0.45 : 0, ease: "site.out", overwrite: true,
    });
  }, []);

  const changer = (i: number) => {
    const n = gsap.utils.clamp(0, images.length - 1, i);
    remettre();
    appliquer(true);
    onChange(n);
    allerA(n);
  };

  // ── Ouverture / fermeture animées ──
  // Calcule le décalage qui superpose la photo plein écran à la grande image de la fiche.
  const versSource = () => {
    const r = source.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0, scale: 0.8 };
    return {
      x: r.left + r.width / 2 - window.innerWidth / 2,
      y: r.top + r.height / 2 - window.innerHeight / 2,
      scale: Math.min(r.width / window.innerWidth, r.height / window.innerHeight) * 1.1,
    };
  };

  const fermer = useCallback(() => {
    const s = g.current;
    if (s.ferme) return;
    s.ferme = true;
    const el = courante();
    const fin = () => {
      dialogue.current?.close();
      document.documentElement.style.overflow = "";
      onFermer();
    };
    if (reduit() || !el) return fin();
    // La photo redescend vers la fiche pendant que le fond s'efface.
    gsap.to(el, { ...versSource(), duration: 0.45, ease: "site.out", overwrite: true });
    gsap.to([fond.current, interface_.current], { autoAlpha: 0, duration: 0.35, ease: "site.out" });
    gsap.delayedCall(0.4, fin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, onFermer]);

  useLayoutEffect(() => {
    const d = dialogue.current;
    if (!ouvert || !d) return;
    g.current.ferme = false;
    remettre();
    d.showModal(); // couche au-dessus de tout, Échap, focus gardé dans la visionneuse
    document.documentElement.style.overflow = "hidden"; // bloque le défilement de la page
    allerA(index, false);
    const el = courante();
    if (el && !reduit()) {
      gsap.fromTo(el, versSource(), { x: 0, y: 0, scale: 1, duration: 0.6, ease: "site.out" });
      gsap.fromTo([fond.current, interface_.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "site.out" });
    } else {
      gsap.set([fond.current, interface_.current], { autoAlpha: 1 });
    }
    setIndice(true);
    const t = window.setTimeout(() => setIndice(false), 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert]);

  // Clavier : ← → pour naviguer (Échap est géré par l'événement « cancel » du <dialog>).
  useEffect(() => {
    if (!ouvert) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changer(index + 1);
      if (e.key === "ArrowLeft") changer(index - 1);
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  });

  // ── Gestes au doigt et à la souris ──
  const surBas = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return; // laisse les boutons fonctionner
    const s = g.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // on suit le doigt même s'il sort de la zone
    } catch {}
    s.doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (s.doigts.size === 1) {
      s.depart = { x: e.clientX, y: e.clientY, tx: s.tx, ty: s.ty };
      s.axe = null;
      s.bouge = false;
    }
    if (s.doigts.size === 2) {
      // Début du pincement : on retient l'écart et le centre entre les deux doigts.
      const [a, b] = [...s.doigts.values()];
      s.pince = {
        dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: s.zoom,
        mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx: s.tx, ty: s.ty,
      };
      s.bouge = true;
    }
  };

  const surMouvement = (e: React.PointerEvent) => {
    const s = g.current;
    if (!s.doigts.has(e.pointerId)) return;
    s.doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (s.doigts.size === 2) {
      // Pincement : zoom selon l'écart des doigts, déplacement selon leur centre.
      const [a, b] = [...s.doigts.values()];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const nouveau = gsap.utils.clamp(1, ZOOM_MAX, s.pince.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / s.pince.dist));
      Object.assign(s, { zoom: s.pince.zoom, tx: s.pince.tx, ty: s.pince.ty });
      zoomerVers(nouveau, s.pince.mx, s.pince.my);
      s.tx += mx - s.pince.mx;
      s.ty += my - s.pince.my;
      borner();
      appliquer();
      return;
    }

    const dx = e.clientX - s.depart.x;
    const dy = e.clientY - s.depart.y;
    if (!s.bouge && Math.hypot(dx, dy) > 8) s.bouge = true;
    if (!s.bouge) return;

    if (s.zoom > 1) {
      // Photo zoomée : on se promène dedans.
      s.tx = s.depart.tx + dx;
      s.ty = s.depart.ty + dy;
      borner();
      appliquer();
      return;
    }
    // Photo normale : on choisit une direction une fois pour toutes.
    s.axe ??= Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (s.axe === "x") {
      // Aux extrémités, la bande résiste (effet élastique).
      const bout = (index === 0 && dx > 0) || (index === images.length - 1 && dx < 0);
      gsap.set(piste.current, { x: bout ? dx * 0.3 : dx });
    } else {
      // Glisser vers le bas : la photo suit le doigt et le fond s'éclaircit.
      const el = courante();
      const p = Math.min(Math.abs(dy) / 400, 1);
      gsap.set(el!, { y: dy, scale: 1 - p * 0.25 });
      gsap.set(fond.current, { autoAlpha: 1 - p });
    }
  };

  const surHaut = (e: React.PointerEvent) => {
    const s = g.current;
    if (!s.doigts.has(e.pointerId)) return;
    s.doigts.delete(e.pointerId);
    if (s.doigts.size === 1) {
      // On passe de deux doigts à un : on repart du doigt restant, sans saut.
      const [a] = [...s.doigts.values()];
      s.depart = { x: a.x, y: a.y, tx: s.tx, ty: s.ty };
      return;
    }
    if (s.doigts.size > 0) return;

    const dx = e.clientX - s.depart.x;
    const dy = e.clientY - s.depart.y;

    if (!s.bouge) {
      // Simple touche : un double-tap (ou double-clic) zoome / dézoome à cet endroit.
      const maintenant = performance.now();
      if (maintenant - s.dernierTap < 300) {
        if (s.zoom > 1) remettre();
        else zoomerVers(ZOOM_DOUBLE, e.clientX, e.clientY);
        appliquer(true);
        s.dernierTap = 0;
      } else s.dernierTap = maintenant;
      return;
    }

    if (s.zoom > 1 || !s.axe) return;
    if (s.axe === "x") {
      // Assez loin (20 % de l'écran) : photo suivante / précédente, sinon retour.
      const seuil = window.innerWidth * 0.2;
      if (dx < -seuil && index < images.length - 1) changer(index + 1);
      else if (dx > seuil && index > 0) changer(index - 1);
      else allerA(index);
    } else if (Math.abs(dy) > 120) {
      fermer();
    } else {
      // Pas assez loin : la photo revient en place.
      appliquer(true);
      gsap.to(fond.current, { autoAlpha: 1, duration: 0.3, ease: "site.out" });
    }
  };

  // Molette (ordinateur) : zoom autour du pointeur.
  const surMolette = (e: React.WheelEvent) => {
    zoomerVers(gsap.utils.clamp(1, ZOOM_MAX, g.current.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)), e.clientX, e.clientY);
    appliquer(true);
  };

  return (
    <dialog
      ref={dialogue}
      aria-label={`Photos de l'œuvre ${titre}`}
      // Échap : on remplace la fermeture brute du navigateur par notre animation.
      onCancel={(e) => {
        e.preventDefault();
        fermer();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-sable backdrop:bg-transparent"
    >
      {ouvert && (
        <>
          {/* Fond brun presque opaque */}
          <div ref={fond} className="absolute inset-0 bg-ebene/95" />

          {/* Zone des gestes ; touch-none : le navigateur ne fait ni zoom ni défilement lui-même */}
          <div
            className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
            onPointerDown={surBas}
            onPointerMove={surMouvement}
            onPointerUp={surHaut}
            onPointerCancel={surHaut}
            onWheel={surMolette}
          >
            <div ref={piste} className="flex h-full">
              {images.map((img, i) => (
                <div key={img} className="relative h-full w-full shrink-0 overflow-hidden">
                  <div className="absolute inset-0 will-change-transform">
                    <Image
                      src={storageUrl("artworks", img)}
                      alt={`${titre} — vue ${i + 1} sur ${images.length}`}
                      fill
                      sizes="100vw"
                      quality={90}
                      draggable={false}
                      // Photo affichée et ses voisines chargées tout de suite.
                      loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                      className="pointer-events-none object-contain p-4 sm:p-12"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interface : compteur, fermeture, flèches, légende */}
          <div ref={interface_} className="pointer-events-none absolute inset-0">
            <div className="flex items-center justify-between p-4">
              <span aria-live="polite" className="rounded-full bg-ebene/70 px-3.5 py-1.5 text-sm font-medium tabular-nums">
                {index + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer la visionneuse"
                className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full bg-ebene/70 transition-colors hover:bg-terre"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Flèches : seulement à la souris (sur téléphone on glisse) */}
            {images.length > 1 && (
              <div className="hidden pointer-fine:block">
                {[
                  { sens: -1, label: "Photo précédente", cote: "left-4", d: "M15 5l-7 7 7 7", off: index === 0 },
                  { sens: 1, label: "Photo suivante", cote: "right-4", d: "M9 5l7 7-7 7", off: index === images.length - 1 },
                ].map((f) => (
                  <button
                    key={f.sens}
                    type="button"
                    onClick={() => changer(index + f.sens)}
                    disabled={f.off}
                    aria-label={f.label}
                    className={`pointer-events-auto absolute top-1/2 ${f.cote} grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-ebene/70 transition-[background-color,opacity] hover:bg-terre disabled:cursor-default disabled:opacity-0`}
                  >
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={f.d} />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-5 text-center">
              <p
                className={`rounded-full bg-ebene/70 px-3.5 py-1.5 text-[13px] transition-opacity duration-500 ${indice ? "opacity-100" : "opacity-0"}`}
              >
                <span className="pointer-coarse:hidden">Double-clic ou molette pour zoomer</span>
                <span className="hidden pointer-coarse:inline">Pincez ou touchez deux fois pour zoomer</span>
              </p>
              <p className="font-display text-lg font-bold">{titre}</p>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}