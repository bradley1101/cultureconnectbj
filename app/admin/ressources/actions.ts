// ─────────────────────────────────────────────────────────────
// Actions serveur des guides : enregistrer (créer ou modifier) et supprimer.
// ─────────────────────────────────────────────────────────────
"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { CATEGORIES_RESSOURCES } from "@/lib/constants";

export type EtatRessource = { erreur?: string; succes?: string };

// « S'inscrire au BUBEDRA » → « s-inscrire-au-bubedra ».
function versSlug(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

// ══════════════ ENREGISTRER ══════════════
// Si le formulaire contient un « id » → modification, sinon → création.
export async function enregistrerRessource(_: EtatRessource, formData: FormData): Promise<EtatRessource> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const titre = String(formData.get("titre") ?? "").trim();
  const categorie = String(formData.get("categorie") ?? "");
  // Adresse : celle tapée, sinon fabriquée à partir du titre.
  const slug = versSlug(String(formData.get("slug") ?? "").trim() || titre);
  const resume = String(formData.get("resume") ?? "").trim();
  const contenu = String(formData.get("contenu") ?? "").trim();
  const publie = formData.get("publie") === "on";

  if (titre.length < 5) return { erreur: "Le titre doit faire au moins 5 caractères." };
  if (!CATEGORIES_RESSOURCES.includes(categorie)) return { erreur: "Choisissez une catégorie." };
  if (!slug) return { erreur: "Adresse invalide." };
  if (contenu.length < 50) return { erreur: "Le contenu est trop court (50 caractères minimum)." };

  const donnees = { title: titre, category: categorie, slug, excerpt: resume || null, content: contenu, published: publie };

  if (id) {
    // ── Modification ──
    // On lit l'ancienne version pour vider le cache de l'ancienne adresse,
    // et pour ne fixer la date de publication que la PREMIÈRE fois.
    const { data: avant } = await supabase.from("resources").select("slug, published_at").eq("id", id).single();
    const { error } = await supabase
      .from("resources")
      .update({ ...donnees, ...(publie && !avant?.published_at && { published_at: new Date().toISOString() }) })
      .eq("id", id);
    // 23505 = adresse déjà prise par un autre guide.
    if (error) return { erreur: error.code === "23505" ? "Cette adresse est déjà utilisée par un autre guide." : "L'enregistrement a échoué." };
    if (avant?.slug) updateTag(`resource-${avant.slug}`);
  } else {
    // ── Création ──
    const { error } = await supabase.from("resources").insert({ ...donnees, published_at: publie ? new Date().toISOString() : null });
    if (error) return { erreur: error.code === "23505" ? "Cette adresse est déjà utilisée par un autre guide." : "L'enregistrement a échoué." };
  }

  // Liste des guides + page du guide mises à jour.
  updateTag("resources");
  updateTag(`resource-${slug}`);
  redirect("/admin/ressources");
}

// ══════════════ SUPPRIMER ══════════════
export async function supprimerRessource(formData: FormData) {
  const { supabase } = await requireAdmin();
  // .select("slug") : on récupère l'adresse du guide supprimé pour vider son cache.
  const { data } = await supabase.from("resources").delete().eq("id", String(formData.get("id"))).select("slug").maybeSingle();
  updateTag("resources");
  if (data?.slug) updateTag(`resource-${data.slug}`);
  redirect("/admin/ressources");
}