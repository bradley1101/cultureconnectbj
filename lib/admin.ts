// ─────────────────────────────────────────────────────────────
// Garde du back-office : vérifie que la personne connectée est
// admin ou super-admin. Sinon, renvoi vers son espace.
// ─────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function requireAdmin() {
  // getSession renvoie déjà vers /connexion si personne n'est connecté.
  const session = await getSession();
  if (session.profil.role !== "admin" && session.profil.role !== "superadmin") redirect("/espace");
  return session;
}