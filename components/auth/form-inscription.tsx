// ─────────────────────────────────────────────────────────────
// Formulaire d'inscription.
// "use client" : il gère l'affichage des erreurs et le bouton « en cours ».
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
// useActionState : relie le formulaire à l'action serveur et récupère sa réponse.
import { useActionState } from "react";
import { inscription, type EtatFormulaire } from "@/app/auth-actions";
import { Champ } from "./champ";

// Les deux types de compte proposés.
const ROLES = [
  { valeur: "artist", titre: "Artiste", detail: "Vitrine, portfolio, vente" },
  { valeur: "pro", titre: "Professionnel", detail: "Producteur, galerie, média…" },
];

export function FormInscription() {
  // etat = dernière réponse de l'action ; action = à brancher sur <form> ;
  // enCours = true pendant l'envoi.
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(inscription, {});
  const v = etat.valeurs ?? {}; // valeurs déjà tapées (en cas d'erreur)

  // ── Inscription réussie : on remplace le formulaire par un message. ──
  if (etat.succes) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-[20px] bg-sable p-7">
        <h2 className="font-display text-2xl font-extrabold">Vérifiez votre boîte mail</h2>
        <p className="leading-relaxed">{etat.succes}</p>
        <p className="text-sm text-taupe">Pensez à regarder dans les courriers indésirables (spam).</p>
      </div>
    );
  }

  return (
    // noValidate : on laisse nos propres messages d'erreur en français
    // au lieu des bulles automatiques du navigateur.
    <form action={action} className="flex flex-col gap-5" noValidate>
      {/* ── Choix du type de compte : deux cartes cliquables ── */}
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-sm font-bold">Je m&apos;inscris en tant que</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {ROLES.map((r) => (
            // has-[:checked] : la carte devient ocre quand son bouton radio est coché.
            <label
              key={r.valeur}
              className="flex cursor-pointer flex-col gap-1 rounded-2xl border-2 border-ligne p-4 has-[:checked]:border-ocre has-[:checked]:bg-sable has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ocre"
            >
              {/* Bouton radio caché (sr-only) mais toujours utilisable au clavier. */}
              <input type="radio" name="role" value={r.valeur} defaultChecked={(v.role ?? "artist") === r.valeur} className="sr-only" />
              <span className="font-bold">{r.titre}</span>
              <span className="text-sm text-taupe">{r.detail}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Champs ── autoComplete aide le navigateur à préremplir. */}
      <Champ id="nom" name="nom" label="Nom complet" autoComplete="name" required defaultValue={v.nom} />
      <Champ
        id="telephone"
        name="telephone"
        label="Téléphone (WhatsApp)"
        type="tel"
        autoComplete="tel"
        placeholder="+229 01 XX XX XX XX"
        defaultValue={v.telephone}
        aide="Utilisé par notre équipe pour vous joindre au sujet de vos ventes."
      />
      <Champ id="email" name="email" label="Adresse e-mail" type="email" autoComplete="email" required defaultValue={v.email} />
      <Champ
        id="motDePasse"
        name="motDePasse"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        aide="8 caractères minimum."
      />

      {/* ── Case des conditions (obligatoire) ── */}
      <label className="flex items-start gap-3 text-[15px]">
        {/* accent-ocre : la case cochée prend la couleur ocre. */}
        <input type="checkbox" name="conditions" className="mt-1 size-5 accent-ocre" />
        <span>
          J&apos;accepte les{" "}
          <Link href="/cgu" className="font-bold text-terre underline underline-offset-4">conditions d&apos;utilisation</Link>{" "}
          et je certifie être l&apos;auteur des œuvres que je publierai.
        </span>
      </label>

      {/* Message d'erreur. empty:hidden : caché tant qu'il est vide. */}
      <p role="alert" aria-live="polite" className="text-sm font-bold text-terre empty:hidden">{etat.erreur}</p>

      {/* Bouton désactivé pendant l'envoi pour éviter un double envoi. */}
      <button
        type="submit"
        disabled={enCours}
        className="min-h-[52px] cursor-pointer rounded-full bg-ebene px-6 font-bold text-creme transition-colors hover:bg-terre disabled:cursor-wait disabled:opacity-70"
      >
        {enCours ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="text-center text-[15px] text-taupe">
        Déjà inscrit ? <Link href="/connexion" className="font-bold text-terre hover:text-ebene">Se connecter</Link>
      </p>
    </form>
  );
}