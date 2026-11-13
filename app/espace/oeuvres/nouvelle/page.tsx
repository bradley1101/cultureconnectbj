// ─────────────────────────────────────────────────────────────
// Page « Publier une œuvre », adresse : /espace/oeuvres/nouvelle
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
  import { Suspense } from "react";
  import { Squelette } from "@/components/espace/squelette";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormOeuvre } from "@/components/espace/form-oeuvre";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Publier une œuvre" };

// La page s'affiche tout de suite (titre + squelette), puis le contenu
// lu dans la base remplace le squelette dès qu'il est prêt.
export default function NouvelleOeuvrePage() {
  return (
    <Suspense fallback={<Squelette titre="Publier une œuvre" sousTitre="Elle sera mise en ligne après validation par notre équipe." />}>
      <ContenuNouvelleOeuvre />
    </Suspense>
  );
}

// Contenu réel de la page (lecture de la base).
async function ContenuNouvelleOeuvre() {
  const { supabase, artiste } = await getSession();
  // Pas de fiche artiste → on envoie d'abord sur « Mon profil ».
  if (!artiste) redirect("/espace/profil");

  // Taux de commission actuel (réglages) pour le calcul affiché dans le formulaire.
  const { data: reglages } = await supabase.from("settings").select("commission_rate").single();

  return (
    <div className="flex max-w-4xl flex-col gap-7">
      <Link href="/espace/oeuvres" className="font-bold text-terre hover:text-ebene">← Mes œuvres</Link>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">Publier une œuvre</h1>
        <p className="text-taupe">Elle sera mise en ligne après validation par notre équipe.</p>
      </div>
      {/* Number(...) : la base renvoie le taux en texte (« 0.100 ») ; 0.1 par défaut. */}
      <FormOeuvre tauxCommission={Number(reglages?.commission_rate ?? 0.1)} />
    </div>
  );
}