/**
 * Composition graphique inspirée des tentures appliquées d'Abomey :
 * aplats de couleur, formes simples posées sur une grille.
 */
export function Motif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Motif géométrique inspiré des tentures d'Abomey"
    >
      <rect width="400" height="400" fill="var(--color-indigo)" />

      <rect x="0" y="0" width="200" height="200" fill="var(--color-ocre)" />
      <circle cx="100" cy="100" r="62" fill="var(--color-or)" />
      <circle cx="100" cy="100" r="26" fill="var(--color-terre)" />

      <rect x="200" y="0" width="200" height="200" fill="var(--color-sable)" />
      <path d="M200 200 L300 40 L400 200 Z" fill="var(--color-terre)" />
      <path d="M250 200 L300 120 L350 200 Z" fill="var(--color-ebene)" />

      <rect x="0" y="200" width="200" height="200" fill="var(--color-ebene)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x="24"
          y={224 + i * 32}
          width="152"
          height="14"
          rx="7"
          fill={i % 2 ? "var(--color-or)" : "var(--color-ocre)"}
        />
      ))}

      <path d="M200 400 A100 100 0 0 1 400 400 Z" fill="var(--color-or)" />
      <path d="M260 400 A40 40 0 0 1 340 400 Z" fill="var(--color-creme)" />
      <circle cx="300" cy="262" r="18" fill="var(--color-sable)" />
    </svg>
  );
}
