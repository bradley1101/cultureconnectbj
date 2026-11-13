// ─────────────────────────────────────────────────────────────
// Écran de chargement du back-office.
// Next.js l'affiche INSTANTANÉMENT quand on change de page dans /admin,
// pendant que la nouvelle page lit ses données dans la base.
// ─────────────────────────────────────────────────────────────

export default function Chargement() {
  return (
    // role="status" + aria-live : les lecteurs d'écran annoncent le chargement.
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Chargement…</span>
      {/* Blocs gris clair qui « pulsent » (animate-pulse) à la place du contenu. */}
      <div className="h-10 w-64 animate-pulse rounded-xl bg-[#E9DFD2]" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <div className="h-24 animate-pulse rounded-[18px] bg-creme" />
        <div className="h-24 animate-pulse rounded-[18px] bg-creme" />
        <div className="h-24 animate-pulse rounded-[18px] bg-creme" />
        <div className="h-24 animate-pulse rounded-[18px] bg-creme" />
      </div>
      <div className="h-64 animate-pulse rounded-[20px] bg-creme" />
    </div>
  );
}