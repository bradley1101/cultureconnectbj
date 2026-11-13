// ─────────────────────────────────────────────────────────────
// Aperçu de partage d'une œuvre (/marketplace/[slug]).
// Next.js l'ajoute tout seul dans les balises de la page :
// WhatsApp, Facebook… l'affichent quand on partage le lien.
// ─────────────────────────────────────────────────────────────
import { ApercuOeuvre } from "@/components/og/apercus";
import { getArtworkBySlug } from "@/lib/artwork-data";
import { formatFcfa } from "@/lib/format";
import { chargerPhoto, prixOg, rendreOg, TAILLE_OG } from "@/lib/og";
import { storageUrl } from "@/lib/supabase/public";

export const size = TAILLE_OG;
export const contentType = "image/jpeg";
export const alt = "Œuvre en vente sur CultureConnectBJ";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArtworkBySlug(slug);
  if (!data) return new Response("Œuvre introuvable", { status: 404 });

  const o = data.artwork;
  // Première photo de l'œuvre, recadrée pour la moitié gauche de l'aperçu.
  const photo = o.image_paths[0] ? await chargerPhoto(storageUrl("artworks", o.image_paths[0]), 560, 630) : null;

  return rendreOg(
    <ApercuOeuvre
      titre={o.title}
      artiste={o.artist?.stage_name ?? "un artiste béninois"}
      categorie={o.category}
      prix={prixOg(formatFcfa(o.price_fcfa))}
      photo={photo}
    />,
  );
}