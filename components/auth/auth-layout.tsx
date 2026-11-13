// ─────────────────────────────────────────────────────────────
// Mise en page commune aux pages Inscription et Connexion :
// fond beige, grand titre + texte à gauche, formulaire dans une carte à droite.
// ─────────────────────────────────────────────────────────────

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// « children » = le formulaire placé à l'intérieur de la carte.
export function AuthLayout({ titre, texte, children }: { titre: string; texte: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="bg-sable">
        {/* flex-wrap : la carte passe sous le titre sur téléphone. */}
        <div className="mx-auto flex max-w-7xl flex-wrap gap-12 px-6 py-16">
          {/* Colonne gauche : titre et explication */}
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 pt-4">
            <h1 className="font-display text-[clamp(36px,5vw,52px)] font-extrabold leading-[1.02] tracking-[-0.02em]">
              {titre}
            </h1>
            <p className="max-w-[460px] text-lg leading-relaxed text-taupe">{texte}</p>
          </div>
          {/* Colonne droite : carte blanche contenant le formulaire */}
          <div className="min-w-0 flex-[1_1_440px] rounded-3xl bg-creme p-8 shadow-[0_1px_0_rgba(43,26,16,0.08)]">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}