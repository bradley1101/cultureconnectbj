// ─────────────────────────────────────────────────────────────
// Galerie de la fiche œuvre : grande image + vignettes cliquables.
// Un clic sur la grande image ouvre la visionneuse plein écran.
// ─────────────────────────────────────────────────────────────
"use client";

import Image from "next/image";
import { useRef, useState, ViewTransition } from "react";
import { storageUrl } from "@/lib/supabase/public";
import { Visionneuse } from "./visionneuse";

const hachure =
  "bg-[#E9D9C2] bg-[repeating-linear-gradient(45deg,rgba(43,26,16,0.06)_0_10px,transparent_10px_20px)]";

// slug : sert à nommer la grande image pour la transition depuis la vignette.
export function Gallery({ images, titre, slug }: { images: string[]; titre: string; slug: string }) {
  // Numéro de la vue affichée en grand (0 = la première).
  const [index, setIndex] = useState(0);
  // Pas encore de photos ? On montre 4 emplacements rayés, comme sur la maquette.
  const vues = images.length > 0 ? images : [null, null, null, null];
  const courante = vues[index];
  // Visionneuse plein écran ouverte ou non ; « grande » = point de départ de son animation.
  const [ouvert, setOuvert] = useState(false);
  const grande = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Grande image ── (même nom que la vignette cliquée → elle s'agrandit jusqu'ici) */}
      <ViewTransition name={`oeuvre-${slug}`} share="morph" default="none">
        {/* C'est maintenant un bouton : un clic ouvre la visionneuse. */}
        <button
          ref={grande}
          type="button"
          onClick={() => setOuvert(true)}
          disabled={!courante} // pas de photo : rien à agrandir
          aria-label={`Agrandir la photo de ${titre}`}
          data-sans-lumiere // pas de contour lumineux sur la photo
          className={`group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-3xl disabled:cursor-default ${hachure}`}
        >
          {courante ? (
            // key={courante} : force React à recréer l'image → l'animation de fondu rejoue.
            <Image
              key={courante}
              src={storageUrl("artworks", courante)}
              alt={`${titre} — vue ${index + 1}`}
              fill
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="animate-[fondu_300ms_ease-out] object-cover"
            />
          ) : (
            <span className="absolute bottom-4 left-4 text-sm text-[#5A3A22]">
              [Visuel de l&apos;œuvre — vue {index + 1}]
            </span>
          )}
          {/* Pastille « Agrandir » : visible au survol (souris), toujours visible au doigt */}
          {courante && (
            <span className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-ebene/75 px-3 py-1.5 text-[13px] font-medium text-sable transition-opacity duration-300 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:opacity-100">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Agrandir
            </span>
          )}
        </button>
      </ViewTransition>

      {/* ── Vignettes (seulement s'il y a plusieurs vues) ── */}
      {vues.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {vues.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher la vue ${i + 1}`}
              aria-pressed={i === index}
              // Cadre ocre autour de la vignette sélectionnée.
              className={`relative aspect-square min-h-11 cursor-pointer overflow-hidden rounded-xl border-[3px] ${hachure} ${
                i === index ? "border-ocre" : "border-transparent"
              }`}
            >
              {img && <Image src={storageUrl("artworks", img)} alt="" fill sizes="120px" className="object-cover" />}
            </button>
          ))}
        </div>
      )}

      {/* Visionneuse plein écran (seulement s'il y a de vraies photos).
          onChange={setIndex} : à la fermeture, la fiche montre la dernière photo vue. */}
      {images.length > 0 && (
        <Visionneuse
          images={images}
          titre={titre}
          index={index}
          ouvert={ouvert}
          source={grande}
          onChange={setIndex}
          onFermer={() => setOuvert(false)}
        />
      )}
    </div>
  );
}