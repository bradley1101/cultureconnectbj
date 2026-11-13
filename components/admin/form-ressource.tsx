// ─────────────────────────────────────────────────────────────
// Formulaire d'un guide (même formulaire pour créer et modifier).
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState } from "react";
import { enregistrerRessource, type EtatRessource } from "@/app/admin/ressources/actions";
import { CATEGORIES_RESSOURCES } from "@/lib/constants";

// Guide existant (modification) ou null (création).
type Ressource = {
  id: string;
  title: string;
  category: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
} | null;

const champ =
  "min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

export function FormRessource({ ressource }: { ressource: Ressource }) {
  const [etat, action, enCours] = useActionState<EtatRessource, FormData>(enregistrerRessource, {});

  return (
    <form action={action} className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
      {/* En modification, l'id caché indique à l'action quel guide mettre à jour. */}
      {ressource && <input type="hidden" name="id" value={ressource.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titre" className="text-sm font-bold">Titre</label>
        <input id="titre" name="titre" required defaultValue={ressource?.title} className={champ} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categorie" className="text-sm font-bold">Catégorie</label>
          <select id="categorie" name="categorie" required defaultValue={ressource?.category ?? ""} className={champ}>
            <option value="" disabled>Choisir…</option>
            {CATEGORIES_RESSOURCES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-bold">Adresse (facultatif)</label>
          <input id="slug" name="slug" defaultValue={ressource?.slug} placeholder="inscription-bubedra" className={champ} />
          <p className="text-sm text-taupe">/ressources/… — créée à partir du titre si vide.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="resume" className="text-sm font-bold">Résumé</label>
        <textarea id="resume" name="resume" rows={2} maxLength={300} defaultValue={ressource?.excerpt ?? ""} className={`${champ} py-3`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contenu" className="text-sm font-bold">Contenu</label>
        <textarea id="contenu" name="contenu" rows={18} required defaultValue={ressource?.content} className={`${champ} py-3 leading-relaxed`} />
        <p className="text-sm text-taupe">Texte brut : laissez une ligne vide entre deux paragraphes.</p>
      </div>

      {/* Case cochée = visible sur le site ; décochée = brouillon. */}
      <label className="flex items-center gap-3 font-bold">
        <input type="checkbox" name="publie" defaultChecked={ressource?.published} className="size-5 accent-ocre" />
        Publier sur le site
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours}
          className="min-h-[52px] cursor-pointer rounded-full bg-ebene px-7 font-bold text-creme hover:bg-terre disabled:cursor-wait disabled:opacity-70"
        >
          {enCours ? "Enregistrement…" : "Enregistrer le guide"}
        </button>
        <p role="alert" aria-live="polite" className="font-bold text-terre empty:hidden">{etat.erreur}</p>
      </div>
    </form>
  );
}