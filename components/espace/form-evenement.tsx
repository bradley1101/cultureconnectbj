// ─────────────────────────────────────────────────────────────
// Formulaire « Proposer un événement ».
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState, useEffect, useRef } from "react";
import { proposerEvenement, type EtatEvenement } from "@/app/espace/evenements/actions";
import { VILLES } from "@/lib/constants";

const champ =
  "min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

export function FormEvenement() {
  const [etat, action, enCours] = useActionState<EtatEvenement, FormData>(proposerEvenement, {});
  const formulaire = useRef<HTMLFormElement>(null);

  // Après un envoi réussi, on vide le formulaire.
  useEffect(() => {
    if (etat.succes) formulaire.current?.reset();
  }, [etat]);

  return (
    <form ref={formulaire} action={action} className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
      <h2 className="text-xl font-bold">Proposer un événement</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titre" className="text-sm font-bold">Nom de l&apos;événement</label>
        <input id="titre" name="titre" required placeholder="Concert, vernissage, spectacle…" className={champ} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateHeure" className="text-sm font-bold">Date et heure</label>
          {/* datetime-local : sélecteur de date ET d'heure intégré au navigateur. */}
          <input id="dateHeure" name="dateHeure" type="datetime-local" required className={champ} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-bold">Ville</label>
          <select id="ville" name="ville" required defaultValue="" className={champ}>
            <option value="" disabled>Choisir…</option>
            {VILLES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lieu" className="text-sm font-bold">Lieu</label>
          <input id="lieu" name="lieu" placeholder="Institut français, Centre culturel…" className={champ} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-bold">Description</label>
        <textarea id="description" name="description" rows={4} maxLength={1000} className={`${champ} py-3 leading-relaxed`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lien" className="text-sm font-bold">Lien (billetterie, page Facebook…)</label>
        <input id="lien" name="lien" type="url" placeholder="https://…" className={champ} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours}
          className="min-h-12 cursor-pointer rounded-full bg-ebene px-6 font-bold text-creme hover:bg-terre disabled:cursor-wait disabled:opacity-70"
        >
          {enCours ? "Envoi…" : "Envoyer pour validation"}
        </button>
        <p role="alert" aria-live="polite" className="font-bold text-terre empty:hidden">{etat.erreur}</p>
        <p role="status" aria-live="polite" className="font-bold text-indigo empty:hidden">{etat.succes}</p>
      </div>
    </form>
  );
}