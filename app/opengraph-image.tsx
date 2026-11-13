// ─────────────────────────────────────────────────────────────
// Aperçu de partage du site (accueil, et toute page sans aperçu à elle).
// ─────────────────────────────────────────────────────────────
import { ApercuSite } from "@/components/og/apercus";
import { chargerPhoto, rendreOg, TAILLE_OG } from "@/lib/og";

export const size = TAILLE_OG;
export const contentType = "image/jpeg";
export const alt = "CultureConnectBJ — La plateforme des artistes du Bénin";

export default async function Image() {
  // La photo du bandeau d'accueil (dans public/images).
  const photo = await chargerPhoto("images/bandeau-ordinateur.jpg", 1200, 630);
  return rendreOg(<ApercuSite photo={photo} />);
}