// ─────────────────────────────────────────────────────────────
// Bouton « Commander sur WhatsApp » de la fiche œuvre.
// "use client" : il réagit au clic dans le navigateur.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useTransition } from "react";
import { commanderSurWhatsapp } from "@/app/marketplace/[slug]/actions";

type Props = { artworkId: string; titre: string; artiste: string; prix: string; adresse: string };

export function OrderButton(props: Props) {
  // useTransition : « enCours » vaut true pendant que le serveur enregistre la commande.
  const [enCours, demarrer] = useTransition();
  // Message d'erreur éventuel (null = pas d'erreur).
  const [erreur, setErreur] = useState<string | null>(null);

  function commander() {
    setErreur(null);
    demarrer(async () => {
      // On appelle l'action serveur (actions.ts).
      const r = await commanderSurWhatsapp(props.artworkId, props.titre, props.artiste, props.prix, props.adresse);
      // Succès : on ouvre WhatsApp. Échec : on affiche l'erreur sous le bouton.
      if (r.ok) window.location.href = r.lien;
      else setErreur(r.erreur);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={commander}
        // Désactivé pendant l'enregistrement pour éviter les doubles clics.
        disabled={enCours}
        className="lumineux flex min-h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-ocre px-6 text-lg font-bold text-ebene transition-colors hover:bg-or disabled:cursor-wait disabled:opacity-70"
      >
        {/* Icône bulle de discussion */}
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        {/* Le texte change pendant l'enregistrement. */}
        {enCours ? "Préparation de la commande…" : "Commander sur WhatsApp"}
      </button>
      {/* role="alert" : les lecteurs d'écran annoncent l'erreur dès qu'elle apparaît. */}
      <p role="alert" aria-live="polite" className="text-sm font-bold text-terre">
        {erreur}
      </p>
    </div>
  );
}