// ─────────────────────────────────────────────────────────────
// Page de connexion, adresse : /connexion
// Peut afficher un message selon l'adresse, ex. /connexion?message=lien_invalide
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { FormConnexion } from "@/components/auth/form-connexion";

export const metadata: Metadata = { title: "Connexion" };

// Messages possibles : code dans l'adresse → texte affiché.
const MESSAGES: Record<string, string> = {
  confirme: "Adresse confirmée ! Vous pouvez vous connecter.",
  lien_invalide: "Ce lien de confirmation a expiré ou a déjà été utilisé. Connectez-vous ou réinscrivez-vous.",
};

type Props = { searchParams: Promise<{ message?: string }> };

export default function ConnexionPage({ searchParams }: Props) {
  return (
    <AuthLayout titre="Bon retour parmi nous." texte="Connectez-vous pour gérer votre profil, vos œuvres et vos demandes de commande.">
      {/* Lire l'adresse est « dynamique » : on affiche le formulaire seul en attendant. */}
      <Suspense fallback={<FormConnexion />}>
        <AvecMessage searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

// Lit le code « message » dans l'adresse et passe le texte correspondant au formulaire.
async function AvecMessage({ searchParams }: Props) {
  const { message } = await searchParams;
  return <FormConnexion message={message ? MESSAGES[message] : undefined} />;
}