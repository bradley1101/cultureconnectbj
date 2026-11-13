// ─────────────────────────────────────────────────────────────
// Formulaire « Ajouter un élément » du portfolio.
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ajouterAuPortfolio, type EtatPortfolio } from "@/app/espace/portfolio/actions";

const champ =
  "min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

export function FormPortfolio() {
  const [etat, action, enCours] = useActionState<EtatPortfolio, FormData>(ajouterAuPortfolio, {});
  const [apercu, setApercu] = useState<string | null>(null);
  // useRef : « poignée » vers le formulaire, pour pouvoir le vider.
  const formulaire = useRef<HTMLFormElement>(null);

  // useEffect : s'exécute après chaque nouvelle réponse de l'action.
  // En cas de succès, on vide les champs et l'aperçu.
  useEffect(() => {
    if (etat.succes) {
      formulaire.current?.reset();
      setApercu(null);
    }
  }, [etat]);

  return (
    <form ref={formulaire} action={action} className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
      <h2 className="text-xl font-bold">Ajouter un élément</h2>

      {/* Image + aperçu carré */}
      <div className="flex flex-wrap items-start gap-5">
        <div
          className="size-28 flex-none rounded-xl bg-[#E9D9C2] bg-cover bg-center"
          style={apercu ? { backgroundImage: `url(${apercu})` } : undefined}
        />
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
          <label htmlFor="image" className="text-sm font-bold">Image</label>
          <input
            id="image"
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setApercu(f ? URL.createObjectURL(f) : null);
            }}
            className="text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-sable file:px-4 file:font-bold file:text-ebene"
          />
          <p className="text-sm text-taupe">Photo d&apos;une œuvre, d&apos;un concert, d&apos;une expo…</p>
        </div>
      </div>

      {/* Lien audio ou vidéo (optionnel si une image est choisie) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lien" className="text-sm font-bold">Ou / et un lien audio ou vidéo</label>
        <input id="lien" name="lien" type="url" placeholder="https://www.youtube.com/watch?v=…" className={champ} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="titre" className="text-sm font-bold">Titre</label>
          <input id="titre" name="titre" className={champ} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="annee" className="text-sm font-bold">Année</label>
          <input id="annee" name="annee" type="number" min={1950} max={new Date().getFullYear()} className={champ} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours}
          className="min-h-12 cursor-pointer rounded-full bg-ebene px-6 font-bold text-creme hover:bg-terre disabled:cursor-wait disabled:opacity-70"
        >
          {enCours ? "Ajout…" : "Ajouter au portfolio"}
        </button>
        <p role="alert" aria-live="polite" className="font-bold text-terre empty:hidden">{etat.erreur}</p>
        <p role="status" aria-live="polite" className="font-bold text-indigo empty:hidden">{etat.succes}</p>
      </div>
    </form>
  );
}