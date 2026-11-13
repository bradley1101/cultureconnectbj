// ─────────────────────────────────────────────────────────────
// Aperçus de partage (WhatsApp, Facebook, X…) : outils communs.
// Quand on partage un lien du site, l'application affiche une image
// 1200 × 630 : on la dessine ici aux couleurs de CultureConnectBJ.
// ─────────────────────────────────────────────────────────────
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

export const TAILLE_OG = { width: 1200, height: 630 };

// Couleurs du site (les mêmes que dans globals.css).
export const C = {
  ocre: "#C8752A", terre: "#A0412D", indigo: "#23395B", or: "#E3A63B",
  ebene: "#2B1A10", sable: "#F5ECDF", creme: "#FCFAF6", sableClair: "#E8DCCB",
};

// ── Polices du site, lues une seule fois puis gardées en mémoire ──
const fichierPolice = (paquet: string, nom: string) =>
  readFile(join(process.cwd(), "node_modules/@fontsource", paquet, "files", nom));

let polices: Promise<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]> | undefined;
function chargerPolices() {
  polices ??= Promise.all([
    fichierPolice("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"),
    fichierPolice("dm-sans", "dm-sans-latin-400-normal.woff"),
    fichierPolice("dm-sans", "dm-sans-latin-700-normal.woff"),
  ]).then(([titre, texte, gras]) => [
    { name: "Bricolage", data: titre, weight: 800 as const, style: "normal" as const },
    { name: "DM Sans", data: texte, weight: 400 as const, style: "normal" as const },
    { name: "DM Sans", data: gras, weight: 700 as const, style: "normal" as const },
  ]);
  return polices;
}

// ── Photos ──
// Récupère une photo (adresse web ou fichier de /public), la recadre à la taille voulue
// et la renvoie en JPEG « data: » (le moteur d'image ne lit pas le WebP).
// Renvoie null si la photo est introuvable : l'aperçu s'affiche alors sans elle.
export async function chargerPhoto(source: string, largeur: number, hauteur: number) {
  try {
    const octets = source.startsWith("http")
      ? Buffer.from(await (await fetch(source)).arrayBuffer())
      : await readFile(join(process.cwd(), "public", source));
    const jpeg = await sharp(octets).resize(largeur, hauteur, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

// ── Rendu final ──
// Dessine l'image puis la convertit en JPEG : beaucoup plus léger que le PNG,
// et WhatsApp n'affiche pas les aperçus trop lourds (au-delà d'environ 300 Ko).
export async function rendreOg(contenu: React.ReactElement) {
  const png = await new ImageResponse(contenu, { ...TAILLE_OG, fonts: await chargerPolices() }).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
  });
}

// Prix lisible (« 150 000 FCFA ») avec des espaces simples, que la police sait afficher.
export const prixOg = (texte: string) => texte.replace(/\s/g, " ");

// ── Éléments communs ──

// La frise béninoise (bandes de couleurs), en bas de chaque aperçu.
export function FriseOg() {
  const bandes: [string, number][] = [
    [C.ocre, 24], [C.ebene, 8], [C.or, 16], [C.ebene, 8], [C.terre, 24], [C.indigo, 8],
  ];
  return (
    <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 16 }}>
      {Array.from({ length: 14 }).flatMap((_, i) =>
        bandes.map(([couleur, l], j) => <div key={`${i}-${j}`} style={{ width: l, height: 16, background: couleur }} />),
      )}
    </div>
  );
}

// Le nom du site, comme dans l'en-tête : « CultureConnect » + « BJ » en or.
export function MarqueOg({ taille = 30 }: { taille?: number }) {
  return (
    <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: taille, color: C.sable, letterSpacing: -0.5 }}>
      CultureConnect<span style={{ color: C.or }}>BJ</span>
    </div>
  );
}

// Emplacement rayé quand il n'y a pas de photo (comme sur le site).
export function SansPhoto({ largeur, hauteur }: { largeur: number; hauteur: number }) {
  return (
    <div
      style={{
        display: "flex", width: largeur, height: hauteur,
        backgroundColor: "#E9D9C2",
        backgroundImage: "repeating-linear-gradient(45deg, rgba(43,26,16,0.07) 0 14px, transparent 14px 28px)",
      }}
    />
  );
}