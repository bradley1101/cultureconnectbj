// ─────────────────────────────────────────────────────────────
// Client Supabase « public » : anonyme, sans cookies.
// Sert aux lectures publiques mises en cache avec "use cache"
// (catalogue, agenda, opportunités, accueil…).
// ─────────────────────────────────────────────────────────────

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false, // pas de session : on lit en visiteur anonyme
        autoRefreshToken: false,
        detectSessionInUrl: false,
        // Pas de « verrou » partagé : par défaut, Supabase fait attendre chaque
        // client derrière un verrou commun à tout le serveur. Next.js refuse
        // qu'une fonction "use cache" attende quelque chose créé ailleurs
        // → erreur « awaiting a promise created outside it ».
        // Ici il n'y a aucune session à protéger, donc on exécute directement.
        lock: async (_nom, _delai, fn) => fn(),
      },
    },
  );
}

/** URL publique d'un fichier stocké dans un bucket public. */
export function storageUrl(
  bucket: "avatars" | "portfolio" | "artworks" | "covers",
  path: string,
) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}