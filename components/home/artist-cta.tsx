// ─────────────────────────────────────────────────────────────
// Grand bandeau ocre « Vous êtes artiste ? » de la page d'accueil.
// « CTA » = Call To Action (appel à l'action) : il pousse les
// artistes à s'inscrire. Contenu fixe.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

export function ArtistCta() {
  return (
    // Fond ocre sur toute la largeur de l'écran.
    <section data-reveal="rideau" className="bg-ocre">
      {/* Texte à gauche, bouton à droite ; le bouton passe
          sous le texte sur téléphone grâce à « flex-wrap ». */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 py-16">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3">
          <h2 data-reveal="titre" className="font-display text-[44px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ebene">
            Vous êtes artiste ? Donnez une vitrine à votre travail.
          </h2>
          <p className="text-lg text-ebene">
            Profil professionnel, portfolio, vente de vos œuvres et accès aux
            opportunités. Gratuit.
          </p>
        </div>

        {/* Bouton brun vers la page d'inscription. Il devient terre cuite au survol. */}
        <Link
          href="/inscription"
          className="lumineux rounded-full bg-ebene px-7 py-4 text-[17px] font-bold text-creme transition-colors hover:bg-terre"
        >
          Créer mon profil d&apos;artiste
        </Link>
      </div>
    </section>
  );
}