// ─────────────────────────────────────────────────────────────
// Vidéo d'ouverture : faut-il la jouer ?
// Partagé par l'intro (intro-video.tsx) et le bandeau (hero-motion.tsx),
// pour que les deux prennent exactement la même décision.
// ─────────────────────────────────────────────────────────────

// Mémorisé pour la durée de la visite (onglet ouvert) : l'intro ne se joue qu'une fois.
export const CLE_INTRO = "ccbj-intro-vue";

// Événement envoyé quand l'intro se termine (fin, « Passer » ou Échap).
export const FIN_INTRO = "ccbj:intro-fin";

export function introDoitJouer(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Déjà vue pendant cette visite ?
  try {
    if (sessionStorage.getItem(CLE_INTRO)) return false;
  } catch {
    // stockage indisponible (navigation privée stricte) : on continue
  }

  // 2. L'utilisateur a demandé « moins d'animations ».
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  // 3. Connexion très lente ou mode « économie de données » : on épargne la vidéo.
  const connexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (connexion?.saveData || /2g$/.test(connexion?.effectiveType ?? "")) return false;

  return true;
}