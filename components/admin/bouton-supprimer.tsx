// ─────────────────────────────────────────────────────────────
// Bouton « Supprimer » avec confirmation en deux temps :
//   1er clic → « Supprimer définitivement ? Oui / Annuler »
//   2e clic sur « Oui » → l'action serveur s'exécute.
// Affiche aussi le message d'erreur renvoyé (ex. « a des commandes »).
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState, useState } from "react";
import type { Etat } from "@/app/admin/artistes/actions";

type Props = {
  action: (avant: Etat, formData: FormData) => Promise<Etat>;
  id: string; // identifiant de ce qu'on supprime
  libelle?: string; // texte du bouton (par défaut « Supprimer »)
  question?: string; // texte de confirmation
  grand?: boolean; // grand bouton (suppression d'un artiste entier)
};

export function BoutonSupprimer({
  action,
  id,
  libelle = "Supprimer",
  question = "Supprimer définitivement ?",
  grand = false,
}: Props) {
  const [etat, envoyer, enCours] = useActionState(action, {});
  const [confirmer, setConfirmer] = useState(false);

  const taille = grand ? "min-h-11 px-5 text-[15px]" : "min-h-10 px-4 text-sm";

  return (
    <div className="flex flex-col items-start gap-1.5">
      {!confirmer ? (
        // Étape 1 : simple bouton (ne supprime rien).
        <button
          type="button"
          onClick={() => setConfirmer(true)}
          className={`cursor-pointer rounded-full border border-terre font-bold text-terre hover:bg-terre hover:text-creme ${taille}`}
        >
          {libelle}
        </button>
      ) : (
        // Étape 2 : confirmation.
        <form action={envoyer} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <span className="text-sm font-bold">{question}</span>
          <button
            type="submit"
            disabled={enCours}
            className={`cursor-pointer rounded-full bg-terre font-bold text-creme hover:bg-ebene disabled:opacity-60 ${taille}`}
          >
            {enCours ? "Suppression…" : "Oui, supprimer"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmer(false)}
            className={`cursor-pointer rounded-full border border-ligne hover:border-ebene ${taille}`}
          >
            Annuler
          </button>
        </form>
      )}
      <p role="alert" aria-live="polite" className="text-sm font-bold text-terre empty:hidden">
        {etat.erreur}
      </p>
    </div>
  );
}