// ─────────────────────────────────────────────────────────────
// Adresse /auth/callback : c'est là qu'arrive le lien de l'e-mail
// de confirmation. Supabase y ajoute un « code » qu'on échange
// contre une session (la personne est alors connectée).
// ─────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET : quand on clique sur le lien, le navigateur fait une requête GET.
export async function GET(request: NextRequest) {
  // Le code se trouve dans l'adresse : /auth/callback?code=xxxx
  const code = request.nextUrl.searchParams.get("code");
  // Adresse du site (ex. http://localhost:3000), pour construire les redirections.
  const origine = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Code valide : compte activé et connecté → direction l'espace personnel.
    if (!error) return NextResponse.redirect(`${origine}/espace`);
  }

  // Pas de code, ou code expiré/déjà utilisé.
  return NextResponse.redirect(`${origine}/connexion?message=lien_invalide`);
}