// ─────────────────────────────────────────────────────────────
// Formulaire « Publier une œuvre ».
// "use client" : aperçu des photos, champs qui changent selon le format,
// calcul en direct du montant reçu par l'artiste.
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState, useState } from "react";
import { publierOeuvre, type EtatOeuvre } from "@/app/espace/oeuvres/actions";
import { CATEGORIES } from "@/lib/constants";

const champ =
  "min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

// Les deux formats possibles : [valeur, titre, exemples].
const FORMATS = [
  ["physical", "Œuvre physique", "Tableau, sculpture, objet…"],
  ["digital", "Œuvre numérique", "Musique, photo HD, e-book…"],
] as const;

// tauxCommission : lu dans les réglages (ex. 0.1 = 10 %), transmis par la page.
export function FormOeuvre({ tauxCommission }: { tauxCommission: number }) {
  const [etat, action, enCours] = useActionState<EtatOeuvre, FormData>(publierOeuvre, {});
  // Format choisi (change les champs affichés).
  const [format, setFormat] = useState<"physical" | "digital">("physical");
  // Prix tapé (pour calculer le montant net en direct).
  const [prix, setPrix] = useState(0);
  // Adresses temporaires des photos choisies (aperçus).
  const [apercus, setApercus] = useState<string[]>([]);

  // Montant reçu par l'artiste = prix × (1 − commission).
  const net = Math.round(prix * (1 - tauxCommission));

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* ═════════ PHOTOS ═════════ */}
      <section className="flex flex-col gap-4 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">
          Photos <span className="font-normal text-taupe">(1 à 4)</span>
        </h2>
        {/* 4 cases d'aperçu : vides (beige) tant qu'aucune photo n'est choisie. */}
        <div className="grid grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-[#E9D9C2] bg-cover bg-center"
              style={apercus[i] ? { backgroundImage: `url(${apercus[i]})` } : undefined}
            />
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="sr-only">Choisir les photos</span>
          {/* multiple : permet de choisir plusieurs fichiers d'un coup. */}
          <input
            type="file"
            name="photos"
            multiple
            accept="image/jpeg,image/png,image/webp"
            required
            // On garde les 4 premières et on crée leurs aperçus.
            onChange={(e) => setApercus(Array.from(e.target.files ?? []).slice(0, 4).map((f) => URL.createObjectURL(f)))}
            className="text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-sable file:px-4 file:font-bold file:text-ebene"
          />
        </label>
        <p className="text-sm text-taupe">
          La première photo sera l&apos;image principale. JPG, PNG ou WEBP · 5 Mo maximum chacune. Sélectionnez plusieurs
          fichiers à la fois avec Ctrl.
        </p>
      </section>

      {/* ═════════ L'ŒUVRE ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">L&apos;œuvre</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="titre" className="text-sm font-bold">Titre</label>
          <input id="titre" name="titre" required className={champ} />
        </div>

        {/* Choix du format : deux cartes (même principe que l'inscription). */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">Format</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {FORMATS.map(([valeur, titre, detail]) => (
              <label
                key={valeur}
                className="flex cursor-pointer flex-col gap-1 rounded-2xl border-2 border-ligne p-4 has-[:checked]:border-ocre has-[:checked]:bg-sable has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ocre"
              >
                <input type="radio" name="format" value={valeur} checked={format === valeur} onChange={() => setFormat(valeur)} className="sr-only" />
                <span className="font-bold">{titre}</span>
                <span className="text-sm text-taupe">{detail}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Grille de 4 petits champs (2 par ligne sur grand écran). */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="categorie" className="text-sm font-bold">Catégorie</label>
            <select id="categorie" name="categorie" required defaultValue="" className={champ}>
              <option value="" disabled>Choisir…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="annee" className="text-sm font-bold">Année</label>
            <input id="annee" name="annee" type="number" min={1900} max={new Date().getFullYear()} placeholder="2026" className={champ} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="technique" className="text-sm font-bold">Technique</label>
            <input id="technique" name="technique" placeholder="Acrylique sur toile" className={champ} />
          </div>
          <div className="flex flex-col gap-1.5">
            {/* Le texte change selon le format choisi. */}
            <label htmlFor="dimensions" className="text-sm font-bold">
              {format === "digital" ? "Format du fichier" : "Dimensions"}
            </label>
            <input id="dimensions" name="dimensions" placeholder={format === "digital" ? "MP3, 12 titres" : "80 × 100 cm"} className={champ} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-bold">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={2000}
            placeholder="L'intention, l'histoire, les matériaux…"
            className={`${champ} py-3 leading-relaxed`}
          />
        </div>
      </section>

      {/* ═════════ PRIX ET DISPONIBILITÉ ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Prix et disponibilité</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prix" className="text-sm font-bold">Prix affiché (FCFA)</label>
            {/* step={500} : les flèches du champ avancent de 500 en 500. */}
            <input
              id="prix"
              name="prix"
              type="number"
              min={1000}
              step={500}
              required
              onChange={(e) => setPrix(Number(e.target.value) || 0)}
              className={champ}
            />
          </div>
          {/* Nombre d'exemplaires : seulement pour une œuvre physique. */}
          {format === "physical" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="stock" className="text-sm font-bold">Exemplaires disponibles</label>
              <input id="stock" name="stock" type="number" min={1} defaultValue={1} className={champ} />
              <p className="text-sm text-taupe">1 = pièce unique.</p>
            </div>
          )}
        </div>
        {/* Calcul en direct du montant reçu. */}
        <p aria-live="polite" className="rounded-2xl bg-sable px-4 py-3">
          Vous recevrez <strong>{net.toLocaleString("fr-FR")} FCFA</strong> par vente (prix affiché moins la commission de{" "}
          {Math.round(tauxCommission * 100)} %).
        </p>
      </section>

      {/* ═════════ BOUTON ═════════ */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours}
          className="min-h-[52px] cursor-pointer rounded-full bg-ebene px-7 font-bold text-creme hover:bg-terre disabled:cursor-wait disabled:opacity-70"
        >
          {enCours ? "Publication…" : "Envoyer pour validation"}
        </button>
        <p role="alert" aria-live="polite" className="font-bold text-terre empty:hidden">{etat.erreur}</p>
      </div>
    </form>
  );
}