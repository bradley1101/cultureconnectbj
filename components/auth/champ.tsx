// ─────────────────────────────────────────────────────────────
// Champ de formulaire réutilisable : étiquette + zone de saisie
// + petit texte d'aide optionnel. Évite de répéter le même code.
//
// Si le champ est un mot de passe (type="password"), un bouton « œil »
// apparaît à droite : il affiche / masque ce que l'on tape.
// "use client" : le bouton œil a besoin d'un état (affiché ou masqué).
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";

// On accepte toutes les propriétés normales d'un <input> (type, name…)
// plus « label » (obligatoire) et « aide » (optionnelle).
type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; aide?: string };

export function Champ({ label, aide, id, type, ...props }: Props) {
  // visible = true → le mot de passe s'affiche en clair.
  const [visible, setVisible] = useState(false);
  const estMotDePasse = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      {/* htmlFor relie l'étiquette au champ : cliquer dessus place le curseur dans le champ. */}
      <label htmlFor={id} className="text-sm font-bold">{label}</label>

      {/* relative : sert de repère pour placer le bouton œil à droite du champ. */}
      <div className="relative">
        <input
          id={id}
          // Mot de passe : « text » si visible, sinon « password ». Autres champs : type inchangé.
          type={estMotDePasse && visible ? "text" : type}
          // aria-describedby : les lecteurs d'écran lisent aussi le texte d'aide.
          aria-describedby={aide ? `${id}-aide` : undefined}
          // pr-14 : laisse la place au bouton œil pour que le texte ne passe pas dessous.
          className={`min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre ${
            estMotDePasse ? "pr-14" : ""
          }`}
          // {...props} : transmet tout le reste (name, required, defaultValue…).
          {...props}
        />

        {estMotDePasse && (
          <button
            // type="button" : surtout pas « submit », sinon le clic enverrait le formulaire.
            type="button"
            onClick={() => setVisible(!visible)}
            // Texte lu par les lecteurs d'écran (le bouton ne contient qu'une icône).
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            aria-controls={id}
            // Zone de clic de 44 × 44 px, centrée verticalement à droite du champ.
            className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-taupe transition-colors hover:text-ebene focus-visible:outline-2 focus-visible:outline-ocre"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {/* L'œil (toujours dessiné) */}
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {/* Trait en travers quand le mot de passe est visible (= « cliquer pour masquer ») */}
              {visible && <path d="M4 4l16 16" />}
            </svg>
          </button>
        )}
      </div>

      {aide && <p id={`${id}-aide`} className="text-sm text-taupe">{aide}</p>}
    </div>
  );
}