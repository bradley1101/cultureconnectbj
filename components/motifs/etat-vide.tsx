// ─────────────────────────────────────────────────────────────
// Message « rien à afficher » (aucun résultat, aucun événement…)
// avec un motif d'Abomey qui se dessine au-dessus du texte.
// ─────────────────────────────────────────────────────────────
import { Motif } from "./motif";
import type { NomMotif } from "./dessins";

export function EtatVide({ motif, children }: { motif: NomMotif; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-ligne px-6 py-12 text-center text-taupe">
      <Motif nom={motif} className="size-24 text-ocre" />
      <p className="max-w-md">{children}</p>
    </div>
  );
}