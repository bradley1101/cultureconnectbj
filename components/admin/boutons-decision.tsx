// ─────────────────────────────────────────────────────────────
// Paire de boutons « Valider / Refuser », réutilisée dans chaque liste.
// Les deux boutons envoient le même formulaire, mais avec une
// valeur « decision » différente (name + value sur le bouton).
// ─────────────────────────────────────────────────────────────

type Props = {
  action: (formData: FormData) => Promise<void>; // action serveur à appeler
  id: string; // élément concerné
  avecBadge?: boolean; // afficher la case « Badge vérifié » ?
};

export function BoutonsDecision({ action, id, avecBadge }: Props) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {avecBadge && (
        <label className="mr-1 inline-flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="verifie" className="size-4 accent-indigo" />
          Badge vérifié
        </label>
      )}
      <button type="submit" name="decision" value="approved" className="min-h-10 cursor-pointer rounded-full bg-ebene px-4 text-sm font-bold text-creme hover:bg-terre">
        Valider
      </button>
      <button type="submit" name="decision" value="rejected" className="min-h-10 cursor-pointer rounded-full border border-[#D9C7AF] px-4 text-sm hover:border-terre hover:text-terre">
        Refuser
      </button>
    </form>
  );
}