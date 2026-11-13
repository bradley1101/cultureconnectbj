// ─────────────────────────────────────────────────────────────
// Formulaire « Mon profil » : photos, informations, réseaux.
// "use client" : aperçu des images et affichage des messages.
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState, useState } from "react";
import { enregistrerProfil, type EtatProfil } from "@/app/espace/profil/actions";
// Import depuis constants (et PAS directory-data, qui contient du code serveur).
import { DISCIPLINES, VILLES } from "@/lib/constants";

// Données actuelles de la fiche (null si elle n'existe pas encore).
type Artiste = {
  stage_name: string;
  disciplines: string[];
  city: string | null;
  bio: string | null;
  social_links: Record<string, string>;
} | null;

type Props = { artiste: Artiste; photoUrl: string | null; banniereUrl: string | null };

const RESEAUX = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "audiomack", label: "Audiomack" },
  { id: "applemusic", label: "Apple Music" },
  { id: "spotify", label: "Spotify" },
];

// Style commun des champs texte.
const champ =
  "min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre";
// Style du bouton « Choisir un fichier » (file: = le bouton du champ fichier).
const champFichier =
  "text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-sable file:px-4 file:font-bold file:text-ebene";

export function FormProfil({ artiste, photoUrl, banniereUrl }: Props) {
  const [etat, action, enCours] = useActionState<EtatProfil, FormData>(enregistrerProfil, {});

  // Aperçus : au départ les images actuelles, puis celles choisies.
  const [apercuPhoto, setApercuPhoto] = useState(photoUrl);
  const [apercuBanniere, setApercuBanniere] = useState(banniereUrl);

  // Quand on choisit un fichier, on crée une adresse temporaire
  // (createObjectURL) pour l'afficher AVANT de l'envoyer.
  const apercu = (definir: (url: string | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (fichier) definir(URL.createObjectURL(fichier));
  };

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* ═════════ PHOTOS ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Photos</h2>

        {/* Bannière : aperçu en image de fond. */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold">Bannière</span>
          <div
            className="h-36 overflow-hidden rounded-2xl bg-[#E9D9C2] bg-cover bg-center"
            style={apercuBanniere ? { backgroundImage: `url(${apercuBanniere})` } : undefined}
          />
          <label className="self-start">
            <span className="sr-only">Choisir une bannière</span>
            {/* accept : le sélecteur ne propose que des images. */}
            <input type="file" name="banniere" accept="image/jpeg,image/png,image/webp" onChange={apercu(setApercuBanniere)} className={champFichier} />
          </label>
        </div>

        {/* Photo de profil : aperçu rond. */}
        <div className="flex flex-wrap items-center gap-5">
          <div
            className="size-28 flex-none rounded-full border-4 border-sable bg-[#E9D9C2] bg-cover bg-center"
            style={apercuPhoto ? { backgroundImage: `url(${apercuPhoto})` } : undefined}
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold">Photo de profil</span>
            <label>
              <span className="sr-only">Choisir une photo de profil</span>
              <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={apercu(setApercuPhoto)} className={champFichier} />
            </label>
            <p className="text-sm text-taupe">JPG, PNG ou WEBP · 5 Mo maximum.</p>
          </div>
        </div>
      </section>

      {/* ═════════ INFORMATIONS ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Informations</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nomDeScene" className="text-sm font-bold">Nom d&apos;artiste</label>
          <input id="nomDeScene" name="nomDeScene" required defaultValue={artiste?.stage_name} className={champ} />
          {/* Message affiché seulement à la création. */}
          {!artiste && (
            <p className="text-sm text-taupe">Il servira aussi à créer l&apos;adresse de votre profil (ex. /artistes/votre-nom).</p>
          )}
        </div>

        {/* Disciplines : cases à cocher cachées dans des pastilles ;
            has-[:checked] colore la pastille cochée en ocre. */}
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2 text-sm font-bold">Disciplines (3 maximum)</legend>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => (
              <label
                key={d}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-ligne bg-sable px-4 has-[:checked]:border-ocre has-[:checked]:bg-ocre has-[:checked]:font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ebene"
              >
                <input type="checkbox" name="disciplines" value={d} defaultChecked={artiste?.disciplines.includes(d)} className="sr-only" />
                {d}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-bold">Ville</label>
          <select id="ville" name="ville" required defaultValue={artiste?.city ?? ""} className={champ}>
            <option value="" disabled>Choisir…</option>
            {VILLES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-bold">Biographie</label>
          <textarea
            id="bio"
            name="bio"
            rows={6}
            maxLength={1500}
            defaultValue={artiste?.bio ?? ""}
            placeholder="Votre parcours, vos influences, vos distinctions…"
            className={`${champ} py-3 leading-relaxed`}
          />
        </div>
      </section>

      {/* ═════════ RÉSEAUX ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Écouter et suivre</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {RESEAUX.map((r) => (
            <div key={r.id} className="flex flex-col gap-1.5">
              <label htmlFor={r.id} className="text-sm font-bold">{r.label}</label>
              <input id={r.id} name={r.id} type="url" placeholder="https://…" defaultValue={artiste?.social_links?.[r.id] ?? ""} className={champ} />
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ BOUTON + MESSAGES ═════════ */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours}
          className="min-h-[52px] cursor-pointer rounded-full bg-ebene px-7 font-bold text-creme hover:bg-terre disabled:cursor-wait disabled:opacity-70"
        >
          {enCours ? "Enregistrement…" : artiste ? "Enregistrer les modifications" : "Créer mon profil"}
        </button>
        {/* Erreur en terre cuite, succès en indigo. */}
        <p role="alert" aria-live="polite" className="font-bold text-terre empty:hidden">{etat.erreur}</p>
        <p role="status" aria-live="polite" className="font-bold text-indigo empty:hidden">{etat.succes}</p>
      </div>
    </form>
  );
}