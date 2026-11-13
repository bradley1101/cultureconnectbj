// ─────────────────────────────────────────────────────────────
// Page d'inscription, adresse : /inscription
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { FormInscription } from "@/components/auth/form-inscription";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <AuthLayout
      titre="Donnez une vitrine à votre art."
      texte="Créez votre compte gratuitement. Notre équipe valide chaque profil avant sa mise en ligne pour garantir un annuaire de confiance."
    >
      <FormInscription />
    </AuthLayout>
  );
}