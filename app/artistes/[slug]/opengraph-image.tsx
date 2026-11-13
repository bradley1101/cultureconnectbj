// ─────────────────────────────────────────────────────────────
// Aperçu de partage d'un profil d'artiste (/artistes/[slug]).
// ─────────────────────────────────────────────────────────────
import { ApercuArtiste } from "@/components/og/apercus";
import { getArtistBySlug } from "@/lib/artist-data";
import { chargerPhoto, rendreOg, TAILLE_OG } from "@/lib/og";
import { storageUrl } from "@/lib/supabase/public";

export const size = TAILLE_OG;
export const contentType = "image/jpeg";
export const alt = "Artiste sur CultureConnectBJ";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArtistBySlug(slug);
  if (!data) return new Response("Artiste introuvable", { status: 404 });

  const a = data.artist;
  const photo = a.avatar_path ? await chargerPhoto(storageUrl("avatars", a.avatar_path), 340, 340) : null;

  return rendreOg(
    <ApercuArtiste
      nom={a.stage_name}
      disciplines={a.disciplines.slice(0, 3).join(" · ") || "Artiste"}
      ville={a.city}
      photo={photo}
      nbOeuvres={data.artworks.length}
    />,
  );
}