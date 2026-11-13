// ─────────────────────────────────────────────────────────────
// Formulaire de connexion.
// « message » : texte d'information optionnel (ex. « Adresse confirmée ! »).
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { connexion, type EtatFormulaire } from "@/app/auth-actions";
import { Champ } from "./champ";

export function FormConnexion({ message }: { message?: string }) {
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(connexion, {});

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {/* Message d'information en bleu indigo (affiché seulement s'il existe). */}
      {message && <p role="status" className="rounded-2xl bg-sable p-4 font-bold text-indigo">{message}</p>}

      <Champ id="email" name="email" label="Adresse e-mail" type="email" autoComplete="email" required defaultValue={etat.valeurs?.email} />
      <Champ id="motDePasse" name="motDePasse" label="Mot de passe" type="password" autoComplete="current-password" required />

      <p role="alert" aria-live="polite" className="text-sm font-bold text-terre empty:hidden">{etat.erreur}</p>

      <button
        type="submit"
        disabled={enCours}
        className="min-h-[52px] cursor-pointer rounded-full bg-ebene px-6 font-bold text-creme transition-colors hover:bg-terre disabled:cursor-wait disabled:opacity-70"
      >
        {enCours ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center text-[15px] text-taupe">
        Pas encore de compte ? <Link href="/inscription" className="font-bold text-terre hover:text-ebene">Inscrire mon art</Link>
      </p>
    </form>
  );
}