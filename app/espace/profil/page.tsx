// ─────────────────────────────────────────────────────────────
// Page « Mon profil », adresse : /espace/profil
// Lit la fiche actuelle (si elle existe) et affiche le formulaire.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
  import { Suspense } from "react";
  import { Squelette } from "@/components/espace/squelette";
import { FormProfil } from "@/components/espace/form-profil";
import { getSession } from "@/lib/session";
import { storageUrl } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Mon profil" };

// La page s'affiche tout de suite (titre + squelette), puis le contenu
// lu dans la base remplace le squelette dès qu'il est prêt.
export default function ProfilPage() {
  return (
    <Suspense fallback={<Squelette titre="Mon profil" sousTitre="Ces informations apparaissent sur votre page publique." />}>
      <ContenuProfil />
    </Suspense>
  );
}

// Contenu réel de la page (lecture de la base).
async function ContenuProfil() {
  const { supabase, user } = await getSession();

  // Fiche artiste complète de la personne connectée (null si pas encore créée).
  const { data: artiste } = await supabase
    .from("artists")
    .select("stage_name, disciplines, city, bio, social_links, avatar_path, banner_path")
    .eq("id", user.id)
    .maybeSingle();

  return (
    // max-w-4xl : formulaire pas trop large, plus confortable à remplir.
    <div className="flex max-w-4xl flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">
          {artiste ? "Mon profil" : "Créer mon profil d'artiste"}
        </h1>
        <p className="text-taupe">Ces informations apparaissent sur votre page publique.</p>
      </div>

      <FormProfil
        // social_links est stocké en JSON : on précise sa forme pour TypeScript.
        artiste={artiste ? { ...artiste, social_links: (artiste.social_links ?? {}) as Record<string, string> } : null}
        // Adresses complètes des images actuelles (pour les aperçus).
        photoUrl={artiste?.avatar_path ? storageUrl("avatars", artiste.avatar_path) : null}
        banniereUrl={artiste?.banner_path ? storageUrl("covers", artiste.banner_path) : null}
      />
    </div>
  );
}