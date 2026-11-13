// ─────────────────────────────────────────────────────────────
// Vidéo d'ouverture du site (page d'accueil).
//
// Déroulé :
//  1. Écran brun ébène : « CultureConnectBJ » s'écrit lettre par lettre
//     (pendant ce temps, la vidéo se charge).
//  2. La vidéo plein écran (muette) apparaît en fondu et se joue.
//  3. À la fin — ou au clic sur « Passer », ou avec la touche Échap —
//     l'écran s'efface et le site apparaît (le bandeau joue alors son animation).
//
// Ne se joue qu'UNE fois par visite, et jamais si l'utilisateur a demandé
// « moins d'animations » ou si sa connexion est très lente.
// Vidéo ordinateur (paysage) ou téléphone (portrait) selon l'écran.
// ─────────────────────────────────────────────────────────────
"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CLE_INTRO, FIN_INTRO, introDoitJouer } from "@/lib/intro";
import { SplitText, gsap } from "@/lib/motion";

// Fichiers rangés dans public/videos/
const VERSIONS = {
  paysage: { video: "/videos/intro-desktop.mp4", affiche: "/videos/intro-affiche.jpg" },
  portrait: { video: "/videos/intro-mobile.mp4", affiche: "/videos/intro-affiche-mobile.jpg" },
};

// Si la vidéo n'a pas pu démarrer au bout de ce délai (connexion lente), on passe au site.
const DELAI_MAX_MS = 6000;

export function IntroVideo() {
  // affichee : l'écran d'intro est présent. version : quelle vidéo charger.
  const [affichee, setAffichee] = useState(true);
  const [version, setVersion] = useState<(typeof VERSIONS)["paysage"] | null>(null);

  const voile = useRef<HTMLDivElement>(null);
  const titre = useRef<HTMLParagraphElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const terminee = useRef(false);

  // ── Fin de l'intro : fondu de sortie, puis on rend la main au site.
  const terminer = useCallback(() => {
    if (terminee.current) return;
    terminee.current = true;
    try {
      sessionStorage.setItem(CLE_INTRO, "1");
    } catch {}
    const rendreLaMain = () => {
      document.body.style.overflow = "";
      setAffichee(false);
      window.dispatchEvent(new Event(FIN_INTRO)); // le bandeau lance son animation
    };
    if (!voile.current) return rendreLaMain();
    gsap.to(voile.current, { autoAlpha: 0, duration: 0.7, ease: "site.inOut", onComplete: rendreLaMain });
  }, []);

  // ── Au démarrage (avant le premier dessin) : on décide si l'intro se joue.
  useLayoutEffect(() => {
    // Le JavaScript prend la main : on annule la disparition « de secours » prévue en CSS.
    if (voile.current) voile.current.style.animation = "none";

    if (!introDoitJouer()) {
      terminee.current = true;
      setAffichee(false);
      return;
    }
    document.body.style.overflow = "hidden"; // pas de défilement pendant l'intro
    const portrait = window.matchMedia("(max-aspect-ratio: 4/5)").matches;
    setVersion(portrait ? VERSIONS.portrait : VERSIONS.paysage);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Le titre s'écrit, puis la vidéo prend le relais.
  useEffect(() => {
    if (!version || !titre.current || !video.current) return;
    const v = video.current;
    let titreFini = false;
    let videoPrete = false;

    // Lance la vidéo seulement quand le titre est écrit ET la vidéo prête.
    const lancerVideo = () => {
      if (!titreFini || !videoPrete || terminee.current) return;
      gsap.to([titre.current, "[data-intro-trait]"], { autoAlpha: 0, y: -16, duration: 0.5, ease: "site.inOut" });
      gsap.to(v, { autoAlpha: 1, duration: 0.8, ease: "site.out" });
      v.play().catch(terminer); // lecture refusée par le navigateur : on passe au site
    };

    // 1. « CultureConnectBJ » : chaque lettre monte depuis un masque.
    const lettres = SplitText.create(titre.current, { type: "chars", mask: "chars" });
        const tl = gsap.timeline(); // sa fin (onComplete) est définie plus bas
    tl.set(titre.current, { autoAlpha: 1 })
      .from(lettres.chars, { yPercent: 110, duration: 0.7, ease: "site.out", stagger: 0.035 })
      .fromTo("[data-intro-trait]", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "site.inOut" }, "-=0.3")
      .to({}, { duration: 0.4 }); // courte respiration avant la vidéo

        // 2. La vidéo se charge pendant ce temps.
    //    iPhone (Safari) : il ne télécharge PAS la vidéo tant qu'on ne l'a pas lancée,
    //    et n'envoie jamais « canplaythrough ». On la « réveille » donc tout de suite :
    //    lecture (muette, invisible), puis pause et retour au début jusqu'à la fin du titre.
    v.muted = true; // indispensable sur iPhone pour une lecture automatique
    v.defaultMuted = true;
    v.setAttribute("muted", ""); // React ne pose pas l'attribut « muted » dans le HTML
    let refusee = false; // vrai si le navigateur refuse la lecture automatique
    const surPrete = () => {
      if (videoPrete) return; // une seule fois
      videoPrete = true;
      lancerVideo(); // ne démarre vraiment que si le titre est aussi fini
    };
    v.addEventListener("canplay", surPrete); // « canplay » : envoyé aussi par Safari
    v.addEventListener("ended", terminer);
    v.addEventListener("error", terminer);
    v.play()
      .then(() => {
        // La lecture est autorisée : on remet la vidéo au début en attendant le titre.
        if (!titreFini) {
          v.pause();
          v.currentTime = 0;
        }
        surPrete();
      })
      .catch(() => {
        // Lecture automatique refusée (ex. iPhone en mode « Économie d'énergie ») :
        // on termine l'intro dès que le titre est écrit.
        refusee = true;
        if (titreFini) terminer();
      });
    // Fin du titre : on lance la vidéo, ou on passe au site si elle a été refusée.
    tl.eventCallback("onComplete", () => {
      titreFini = true;
      if (refusee) terminer();
      else lancerVideo();
    });

    // 3. Sécurité : si rien n'a démarré à temps, on passe au site.
    const secours = window.setTimeout(() => {
      if (v.paused) terminer();
    }, DELAI_MAX_MS);

    // Touche Échap = « Passer ».
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && terminer();
    window.addEventListener("keydown", surTouche);

    return () => {
      tl.kill();
      lettres.revert();
      window.clearTimeout(secours);
      window.removeEventListener("keydown", surTouche);
            v.removeEventListener("canplay", surPrete);
      v.removeEventListener("ended", terminer);
      v.removeEventListener("error", terminer);
    };
  }, [version, terminer]);

  if (!affichee) return null;

  return (
    <div
      ref={voile}
      role="dialog"
      aria-label="Introduction de CultureConnectBJ"
      className="intro-voile fixed inset-0 z-[100] flex items-center justify-center bg-ebene"
    >
      {/* La vidéo plein écran (invisible jusqu'à ce qu'elle démarre). */}
      {version && (
        <video
          ref={video}
          src={version.video}
          poster={version.affiche}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="invisible absolute inset-0 size-full object-cover opacity-0"
        />
        
      )}
      
      {/* Voile marron transparent par-dessus la vidéo (comme koffination.store) :
          assombrit légèrement l'image en gardant ses couleurs chaudes,
          un peu plus foncé en haut et en bas (effet cinéma). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(43_26_16/0.88)_0%,rgb(43_26_16/0.65)_35%,rgb(43_26_16/0.65)_65%,rgb(43_26_16/1)_100%)]"
      />

      {/* « CultureConnectBJ » (même logo que l'en-tête, en grand). */}
      <div className="relative flex flex-col items-center gap-3 px-6">
        <p
          ref={titre}
          className="invisible font-display text-[clamp(36px,8vw,88px)] font-extrabold tracking-tight text-sable"
        >
          CultureConnect<span className="text-or">BJ</span>
        </p>
        <span data-intro-trait className="h-1 w-24 origin-left rounded-full bg-ocre" />
      </div>

      {/* Bouton « Passer », toujours visible. */}
      <button
        type="button"
        onClick={terminer}
        className="absolute right-5 bottom-5 z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-ebene/60 px-5 font-bold text-sable backdrop-blur-sm hover:bg-ebene"
      >
        Passer <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}