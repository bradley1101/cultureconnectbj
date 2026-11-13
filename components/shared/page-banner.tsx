// ─────────────────────────────────────────────────────────────
// Bandeau beige avec titre + phrase, en haut des pages de liste
// (Agenda, Opportunités, Ressources…). Évite de répéter le même code.
// ─────────────────────────────────────────────────────────────

export function PageBanner({ titre, texte }: { titre: string; texte: string }) {
  return (
    <section className="border-b border-ligne bg-sable">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 pt-14 pb-10">
        {/* Taille du titre adaptée à l'écran : entre 36 et 56 px. */}
        <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-none tracking-[-0.02em]">
          {titre}
        </h1>
        <p className="max-w-[620px] text-lg text-taupe">{texte}</p>
      </div>
    </section>
  );
}