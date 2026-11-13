// ─────────────────────────────────────────────────────────────
// Actions serveur des comptes : inscription, connexion, déconnexion.
// Elles tournent sur le serveur (jamais dans le navigateur).
// ─────────────────────────────────────────────────────────────
"use server";

import { redirect } from "next/navigation";
// Client Supabase lié aux cookies : c'est lui qui garde la personne connectée.
import { createClient } from "@/lib/supabase/server";

// Ce que les actions renvoient aux formulaires :
// - erreur : message à afficher en rouge
// - succes : message de réussite
// - valeurs : ce que la personne avait tapé (pour ne pas lui faire tout retaper)
export type EtatFormulaire = { erreur?: string; succes?: string; valeurs?: Record<string, string> };

// ══════════════ INSCRIPTION ══════════════
// « _ » = état précédent du formulaire (pas utilisé ici).
export async function inscription(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  // 1. Lecture des champs. String(...) et ?? "" évitent les valeurs vides.
  const role = formData.get("role") === "pro" ? "pro" : "artist"; // seulement 2 valeurs possibles
  const nom = String(formData.get("nom") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("motDePasse") ?? "");
  const conditions = formData.get("conditions") === "on"; // case cochée ?
  // Le mot de passe n'est jamais renvoyé, par sécurité.
  const valeurs = { role, nom, telephone, email };

  // 2. Vérifications avant d'envoyer à Supabase.
  if (nom.length < 2) return { erreur: "Indiquez votre nom (au moins 2 caractères).", valeurs };
  // Expression régulière simple : « quelque chose @ quelque chose . quelque chose ».
  if (!/^\S+@\S+\.\S+$/.test(email)) return { erreur: "Adresse e-mail invalide.", valeurs };
  if (motDePasse.length < 8) return { erreur: "Le mot de passe doit contenir au moins 8 caractères.", valeurs };
  if (!conditions) return { erreur: "Vous devez accepter les conditions d'utilisation.", valeurs };

  // 3. Création du compte chez Supabase.
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      // Ces infos sont lues par la fonction de la base qui crée le profil automatiquement.
      data: { role, full_name: nom, phone: telephone },
      // Adresse où mène le lien de l'e-mail de confirmation.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  // 4. Erreurs possibles, traduites en messages clairs.
  if (error) {
    if (error.code === "user_already_exists")
      return { erreur: "Un compte existe déjà avec cette adresse. Connectez-vous.", valeurs };
    if (error.code === "over_email_send_rate_limit")
      return { erreur: "Trop d'inscriptions en peu de temps. Réessayez dans une heure.", valeurs };
    return { erreur: "L'inscription a échoué. Réessayez dans un instant.", valeurs };
  }

  // 5. Succès : on demande de confirmer l'e-mail.
  return {
    succes: `Compte créé ! Un e-mail de confirmation a été envoyé à ${email}. Cliquez sur le lien qu'il contient pour activer votre compte.`,
  };
}

// ══════════════ CONNEXION ══════════════
export async function connexion(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  const supabase = await createClient();
  // Supabase vérifie l'e-mail et le mot de passe, puis enregistre la session dans les cookies.
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

  if (error) {
    if (error.code === "email_not_confirmed")
      return { erreur: "Confirmez d'abord votre adresse avec le lien reçu par e-mail.", valeurs: { email } };
    // Message volontairement vague : on ne dit pas si c'est l'e-mail ou le mot de passe
    // qui est faux (sinon un pirate saurait quels e-mails ont un compte).
    return { erreur: "E-mail ou mot de passe incorrect.", valeurs: { email } };
  }

  // Connecté : direction l'espace personnel.
  redirect("/espace");
}

// ══════════════ DÉCONNEXION ══════════════
export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut(); // supprime la session (cookies)
  redirect("/");
}