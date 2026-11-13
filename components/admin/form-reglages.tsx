// ─────────────────────────────────────────────────────────────
// Formulaire des réglages du back-office.
// ─────────────────────────────────────────────────────────────
"use client";

import { useActionState } from "react";
import { enregistrerReglages, type EtatReglages } from "@/app/admin/reglages/actions";

// Valeurs actuelles (commission déjà convertie en %, ex. 10).
type Reglages = {
  whatsapp_number: string;
  commission: number;
  legal_mentions: string | null;
  terms_of_use: string | null;
  terms_of_sale: string | null;
  privacy_policy: string | null;
};

const champ =
  "min-h-12 w-full rounded-[10px] border border-ligne bg-creme px-4 text-base text-ebene focus-visible:outline-2 focus-visible:outline-ocre";

// Les 4 textes légaux : nom du champ, colonne de la base, étiquette, page publique.
const TEXTES = [
  { nom: "mentions", cle: "legal_mentions", label: "Mentions légales", page: "/mentions-legales" },
  { nom: "cgu", cle: "terms_of_use", label: "Conditions générales d'utilisation (CGU)", page: "/cgu" },
  { nom: "cgv", cle: "terms_of_sale", label: "Conditions de vente", page: "/conditions-de-vente" },
  { nom: "confidentialite", cle: "privacy_policy", label: "Politique de confidentialité", page: "/confidentialite" },
] as const;

export function FormReglages({ reglages }: { reglages: Reglages }) {
  const [etat, action, enCours] = useActionState<EtatReglages, FormData>(enregistrerReglages, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* ═════════ COMMANDES ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Commandes</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp" className="text-sm font-bold">Numéro WhatsApp officiel</label>
            <input id="whatsapp" name="whatsapp" type="tel" required defaultValue={reglages.whatsapp_number} placeholder="+229 01 97 00 00 00" className={champ} />
            <p className="text-sm text-taupe">Reçoit toutes les commandes et demandes de contact.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="commission" className="text-sm font-bold">Commission (%)</label>
            {/* step={0.5} : on peut mettre 10, 10,5, 11… */}
            <input id="commission" name="commission" type="number" min={0} max={50} step={0.5} required defaultValue={reglages.commission} className={champ} />
            <p className="text-sm text-taupe">S&apos;applique aux nouvelles commandes uniquement.</p>
          </div>
        </div>
      </section>

      {/* ═════════ PAGES LÉGALES ═════════ */}
      <section className="flex flex-col gap-5 rounded-[20px] bg-creme p-6">
        <h2 className="text-xl font-bold">Pages légales</h2>
        <p className="text-sm text-taupe">
          Texte brut : laissez une ligne vide entre deux paragraphes. Faites relire ces textes par un juriste avant la mise en ligne.
        </p>
        {TEXTES.map((t) => (
          <div key={t.nom} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor={t.nom} className="text-sm font-bold">{t.label}</label>
              {/* Ouvre la page publique dans un nouvel onglet pour vérifier le rendu. */}
              <a href={t.page} target="_blank" rel="noopener noreferrer" className="text-sm text-terre underline">Voir la page</a>
            </div>
            <textarea id={t.nom} name={t.nom} rows={8} defaultValue={reglages[t.cle] ?? ""} className={`${champ} py-3 leading-relaxed`} />
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enCours}
          className="min-h-[52px] cursor-pointer rounded-full bg-ebene px-7 font-bold text-creme hover:bg-terre disabled:cursor-wait disabled:opacity-70"
        >
          {enCours ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
        <p role="alert" aria-live="polite" className="font-bold text-terre empty:hidden">{etat.erreur}</p>
        <p role="status" aria-live="polite" className="font-bold text-indigo empty:hidden">{etat.succes}</p>
      </div>
    </form>
  );
}