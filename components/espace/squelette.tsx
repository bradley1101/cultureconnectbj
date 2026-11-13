// ─────────────────────────────────────────────────────────────
// Squelette de chargement de l'espace artiste.
// Affiché INSTANTANÉMENT quand on change de rubrique : le vrai titre
// tout de suite, puis des blocs qui « pulsent » à la place du contenu.
// ─────────────────────────────────────────────────────────────

type Props = {
  titre: string; // titre de la page (ex. « Mes événements »)
  sousTitre?: string; // phrase grise sous le titre (facultative)
  blocs?: number; // nombre de blocs gris (3 par défaut)
};

export function Squelette({ titre, sousTitre, blocs = 3 }: Props) {
  return (
    <div className="flex max-w-4xl flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">{titre}</h1>
        {sousTitre && <p className="text-taupe">{sousTitre}</p>}
      </div>

      {/* role="status" : les lecteurs d'écran annoncent le chargement. */}
      <div role="status" aria-live="polite" className="flex flex-col gap-3">
        <span className="sr-only">Chargement…</span>
        {Array.from({ length: blocs }, (_, n) => (
          <div key={n} className="h-24 animate-pulse rounded-[18px] bg-creme" />
        ))}
      </div>
    </div>
  );
}